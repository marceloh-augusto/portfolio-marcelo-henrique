/**
 * Script utilitário (Node, não roda no browser, mesmo padrão do
 * generateAsciiArt.ts) que corrige a dessincronia visual entre as 2 fotos
 * do Hero durante o cross-fade do scroll.
 *
 * Causa raiz medida diretamente nos arquivos originais (comparando os
 * dois lado a lado, rodada 7): a margem vertical (topo/base) de
 * "foto minha inicial.png" já batia com a de "foto minha.png" desde o
 * início — o problema real era só horizontal: o enquadramento da pessoa
 * (largura relativa ao canvas e posição do centro) era diferente entre as
 * duas. A primeira tentativa (rodada 4) cortou pro bounding-box do
 * conteúdo e SÓ then ajustou a largura pra bater a proporção do canvas —
 * isso removeu a margem superior correta (que já estava certa) e não
 * corrigiu o que realmente precisava (largura/centro horizontal),
 * piorando a dessincronia em vez de resolver.
 *
 * Fix (rodada 7): mede em "foto minha.png" (referência, fundo opaco) a
 * fração de largura ocupada pela pessoa na linha mais larga (ombros) e a
 * fração horizontal do centro dela; recorta "foto minha inicial.png"
 * SÓ NO EIXO X pra bater essas duas frações, mantendo a altura original
 * (0 a canvas.height) intacta — sem tocar na margem vertical, que já
 * estava correta.
 *
 * Rodar manualmente se as fotos originais mudarem:
 *   npx tsx src/lib/alignHeroPhoto.ts
 */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE = resolve(
	import.meta.dirname,
	"../../Assets/foto minha inicial.png",
);
const REFERENCE = resolve(import.meta.dirname, "../../Assets/foto minha.png");
const OUTPUTS = [
	resolve(
		import.meta.dirname,
		"../../public/images/home/desktop/foto-minha-inicial-aligned.png",
	),
	resolve(
		import.meta.dirname,
		"../../public/images/home/mobile/foto-minha-inicial-aligned.png",
	),
];

interface RowProfile {
	left: number;
	right: number;
	width: number;
	count: number;
}

function rowProfilesAlpha(png: InstanceType<typeof PNG>): RowProfile[] {
	const { width, height, data } = png;
	const rows: RowProfile[] = [];
	for (let y = 0; y < height; y++) {
		let left = -1;
		let right = -1;
		let count = 0;
		for (let x = 0; x < width; x++) {
			const idx = (width * y + x) << 2;
			if (data[idx + 3] > 20) {
				if (left === -1) left = x;
				right = x;
				count++;
			}
		}
		rows.push({ left, right, width: right >= 0 ? right - left : 0, count });
	}
	return rows;
}

/** Imagem opaca (sem alpha útil): detecta conteúdo pela diferença de cor em relação ao fundo (amostrado no canto). */
function rowProfilesOpaque(png: InstanceType<typeof PNG>): RowProfile[] {
	const { width, height, data } = png;
	const bgR = data[0];
	const bgG = data[1];
	const bgB = data[2];
	const rows: RowProfile[] = [];
	for (let y = 0; y < height; y++) {
		let left = -1;
		let right = -1;
		let count = 0;
		for (let x = 0; x < width; x++) {
			const idx = (width * y + x) << 2;
			const dr = data[idx] - bgR;
			const dg = data[idx + 1] - bgG;
			const db = data[idx + 2] - bgB;
			if (Math.sqrt(dr * dr + dg * dg + db * db) > 18) {
				if (left === -1) left = x;
				right = x;
				count++;
			}
		}
		rows.push({ left, right, width: right >= 0 ? right - left : 0, count });
	}
	return rows;
}

function contentBBox(rows: RowProfile[]) {
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = -1;
	let maxY = -1;
	rows.forEach((r, y) => {
		if (r.count <= 5) return;
		if (minY === -1) minY = y;
		maxY = y;
		if (r.left < minX) minX = r.left;
		if (r.right > maxX) maxX = r.right;
	});
	return { minX, maxX, minY, maxY };
}

function widestRow(rows: RowProfile[]) {
	let best = rows[0];
	for (const r of rows) if (r.width > best.width) best = r;
	return best;
}

const source = PNG.sync.read(readFileSync(SOURCE));
const reference = PNG.sync.read(readFileSync(REFERENCE));

const sourceRows = rowProfilesAlpha(source);
const referenceRows = rowProfilesOpaque(reference);

const sourceBBox = contentBBox(sourceRows);
const refWidest = widestRow(referenceRows);

const targetWidthFrac = refWidest.width / reference.width;
const targetCenterFrac = (refWidest.left + refWidest.right) / 2 / reference.width;

const contentWidth = sourceBBox.maxX - sourceBBox.minX;
const contentCenterX = (sourceBBox.minX + sourceBBox.maxX) / 2;

console.log(
	`Referência (foto minha.png): pessoa ocupa ${(targetWidthFrac * 100).toFixed(1)}% da largura do canvas, centro em ${(targetCenterFrac * 100).toFixed(1)}%.`,
);
console.log(
	`Fonte (foto minha inicial.png): conteúdo real ${contentWidth}px de largura, centro em x=${contentCenterX}.`,
);

// Novo canvas: só ajusta o eixo X pra bater largura/centro da referência.
// Altura permanece EXATAMENTE a original (a margem vertical já estava
// correta — não recortar/adicionar nada no eixo Y).
const canvasWidth = Math.round(contentWidth / targetWidthFrac);
const canvasHeight = source.height;
const cropX = Math.round(contentCenterX - targetCenterFrac * canvasWidth);

console.log(
	`Canvas alinhado: ${canvasWidth}x${canvasHeight}, recorte X a partir de ${cropX} (${cropX < 0 || cropX + canvasWidth > source.width ? "com preenchimento transparente" : "recorte simples"}).`,
);

const output = new PNG({ width: canvasWidth, height: canvasHeight });
for (let y = 0; y < canvasHeight; y++) {
	for (let x = 0; x < canvasWidth; x++) {
		const srcX = cropX + x;
		if (srcX < 0 || srcX >= source.width) continue; // fica transparente
		const srcIdx = (source.width * y + srcX) << 2;
		const dstIdx = (canvasWidth * y + x) << 2;
		output.data[dstIdx] = source.data[srcIdx];
		output.data[dstIdx + 1] = source.data[srcIdx + 1];
		output.data[dstIdx + 2] = source.data[srcIdx + 2];
		output.data[dstIdx + 3] = source.data[srcIdx + 3];
	}
}

const buffer = PNG.sync.write(output);
for (const outPath of OUTPUTS) {
	writeFileSync(outPath, buffer);
	console.log(`Gerado ${outPath} (${canvasWidth}x${canvasHeight})`);
}
