import { prefersReducedMotion } from "./reducedMotion";

/**
 * Porte do componente "DriftWall" (React Bits, variante JS+CSS) pro
 * stack do projeto — sem dependências novas (o original também não usa
 * nenhuma, só React pra orquestrar `useEffect`/`useRef`/`useMemo`, tudo
 * substituível por DOM + `requestAnimationFrame` puro, mesmo padrão já
 * usado em topographyEffect.ts).
 *
 * Mantido o MAIS PRÓXIMO possível da lógica original (mesma física de
 * damping/easing, mesmo cálculo de velocidade por coluna) — só a parte
 * de "React re-render" virou manipulação direta do DOM.
 */

export interface DriftWallOptions {
	columns?: number;
	tileHeight?: number;
	gap?: number;
	speed?: number;
	direction?: "up" | "down";
	variance?: number;
	parallax?: number;
	pauseOnHover?: boolean;
	tilt?: number;
	turn?: number;
	roll?: number;
	depth?: number;
}

const DEFAULTS: Required<DriftWallOptions> = {
	columns: 5,
	tileHeight: 132,
	gap: 18,
	speed: 42,
	direction: "up",
	variance: 0.45,
	parallax: 0.6,
	pauseOnHover: false,
	tilt: 16,
	turn: -14,
	roll: 0,
	depth: 120,
};

function columnFactor(index: number, variance: number): number {
	const pseudo = ((index * 0.618033988 + 0.35) % 1) * 2 - 1;
	return 1 + variance * pseudo;
}

export function initDriftWall(container: HTMLElement, options: DriftWallOptions = {}): () => void {
	const opts = { ...DEFAULTS, ...options };
	const plane = container.querySelector<HTMLElement>("[data-drift-wall-plane]");
	if (!plane) return () => {};

	let raf = 0;
	let ro: ResizeObserver | null = null;
	let cleanupListeners: (() => void) | null = null;
	const unit = opts.tileHeight + opts.gap;

	function applyPlaneTransform(px: number, py: number) {
		plane!.style.transform =
			`translate(-50%, -50%) scale(1.18) ` +
			`rotateX(${opts.tilt + py}deg) rotateY(${opts.turn + px}deg) rotateZ(${opts.roll}deg) ` +
			`translateZ(${-opts.depth}px)`;
	}

	// Correção (bug real, pré-existente — só ficou visível depois que os
	// tiles triplicaram de tamanho): o loop de animação fazia o offset
	// vertical dar wrap módulo a altura TOTAL da faixa (`track.scrollHeight`).
	// Isso não é um loop de verdade — é uma única tira de conteúdo finita
	// sendo arrastada; conforme o offset se aproxima do fim dessa tira,
	// a maior parte do conteúdo já saiu de vista e não sobra nada atrás
	// pra preencher, deixando a coluna visivelmente vazia por boa parte
	// de cada ciclo (quanto maior o tile em relação à altura do
	// container, mais visível/longa essa fase vazia). Corrige clonando o
	// mesmo bloco de conteúdo ("unidade") várias vezes — mesma técnica do
	// logoMarqueeLoop.ts — e fazendo o wrap módulo UMA unidade (não a
	// faixa inteira): como o conteúdo de uma unidade é idêntico ao da
	// próxima, esse wrap é imperceptível, contanto que sempre sobre pelo
	// menos `containerHeight + 1 unidade` de conteúdo à frente de
	// qualquer offset dentro da unidade.
	function fillTrackVertically(track: HTMLElement): number {
		const containerHeight = container.getBoundingClientRect().height || window.innerHeight || 600;
		const unitHTML = track.dataset.unitHtml ?? track.innerHTML;
		track.dataset.unitHtml = unitHTML;
		const unitHeight = (() => {
			const probe = document.createElement("div");
			probe.style.position = "absolute";
			probe.style.visibility = "hidden";
			probe.innerHTML = unitHTML;
			track.appendChild(probe);
			const h = probe.getBoundingClientRect().height || unit;
			probe.remove();
			return h;
		})();
		const targetHeight = containerHeight + unitHeight * 2;
		let guard = 0;
		while (track.scrollHeight < targetHeight && guard < 60) {
			track.insertAdjacentHTML("beforeend", unitHTML);
			guard++;
		}
		track.dataset.unitHeight = String(unitHeight);
		return unitHeight;
	}

	// Correção (bug relatado — vão vazio entre colunas, "fica sumindo os
	// quadros"): o bug real era estrutural, não só de densidade. O plano
	// se autocentraliza via `left:50%` + `transform: translate(-50%,...)`,
	// calculado em cima da SUA PRÓPRIA largura total — clonar colunas
	// extras sempre no final (`appendChild`) cresce o plano só de um
	// lado, o que desloca o centro visual pra longe do meio original a
	// cada clone. Isso fazia uma tentativa anterior (medir vão e clonar
	// até fechar) nunca convergir de verdade: cada clone novo empurrava o
	// centro um pouco mais, reabrindo vão nas bordas opostas. A correção
	// é clonar alternando os dois lados (`appendChild` / `insertBefore`
	// no início), mantendo o crescimento simétrico em torno do centro
	// original — assim adicionar colunas efetivamente fecha vão em vez
	// de só deslocá-lo.
	//
	// A margem de segurança (quantas colunas extras clonar) cresce com o
	// alcance do parallax por ponteiro (`opts.parallax`): mover o mouse
	// soma até `parallax * 8` graus de rotação extra por cima do
	// `tilt`/`turn` base, e quanto maior esse alcance, mais a perspectiva
	// desloca a projeção das colunas nas bordas — por isso a margem não é
	// um número fixo, escala com esse alcance.
	//
	// Correção (bug relatado — 2 colunas com as MESMAS imagens, na mesma
	// ordem): clonar uma coluna via `cloneNode` copia também a ORDEM das
	// imagens — o clone fica pixel-idêntico ao original, o que fica óbvio
	// se os dois acabam visíveis ao mesmo tempo. Embaralha a ordem dos
	// tiles do CLONE (não do original) logo depois de criá-lo, resolvendo
	// qualquer repetição adjacente que sobre do embaralhamento — genérico
	// o bastante pra não precisar saber quantas imagens distintas existem
	// (funciona igual pra qualquer conteúdo).
	function shuffleColumnTiles(col: HTMLElement) {
		const track = col.querySelector<HTMLElement>("[data-drift-wall-track]");
		if (!track) return;
		const tiles = Array.from(track.children) as HTMLElement[];
		if (tiles.length < 2) return;

		const keyOf = (el: HTMLElement) => el.querySelector("img")?.getAttribute("src") ?? el.textContent ?? "";

		for (let i = tiles.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[tiles[i], tiles[j]] = [tiles[j], tiles[i]];
		}
		for (let i = 1; i < tiles.length; i++) {
			if (keyOf(tiles[i]) !== keyOf(tiles[i - 1])) continue;
			const swapIndex = tiles.findIndex(
				(t, k) => k > i && keyOf(t) !== keyOf(tiles[i - 1]) && keyOf(t) !== keyOf(tiles[i + 1] ?? t),
			);
			if (swapIndex !== -1) [tiles[i], tiles[swapIndex]] = [tiles[swapIndex], tiles[i]];
		}

		tiles.forEach((tile) => track.appendChild(tile));
	}

	function ensureColumnCoverage() {
		const originalCols = Array.from(plane!.querySelectorAll<HTMLElement>("[data-drift-wall-col]"));
		if (originalCols.length === 0) return;

		originalCols.forEach((col) => {
			const track = col.querySelector<HTMLElement>("[data-drift-wall-track]");
			if (track) fillTrackVertically(track);
		});

		const containerWidth = container.getBoundingClientRect().width || window.innerWidth || 600;
		const maxTilt = opts.parallax * 8;
		const safetyFactor = 5.5 + maxTilt / 3;
		const targetWidth = containerWidth * safetyFactor;

		let nextIndex = originalCols.length;
		let guard = 0;
		let appendSide = true;
		while (plane!.scrollWidth < targetWidth && guard < 120) {
			const template = originalCols[guard % originalCols.length];
			const clone = template.cloneNode(true) as HTMLElement;
			shuffleColumnTiles(clone);
			clone.querySelectorAll<HTMLElement>("[data-tile-id]").forEach((tile) => {
				tile.dataset.col = String(nextIndex);
				tile.dataset.tileId = `c${nextIndex}-${tile.dataset.tileId}`;
			});
			if (appendSide) {
				plane!.appendChild(clone);
			} else {
				plane!.insertBefore(clone, plane!.firstElementChild);
			}
			appendSide = !appendSide;
			nextIndex++;
			guard++;
		}
	}

	// A medição de largura/altura acima só é confiável depois que o
	// navegador terminou pelo menos um ciclo de layout/paint — rodando
	// ela direto no corpo síncrono do script, `getBoundingClientRect()` e
	// até `window.innerWidth` podem ler 0 num timing específico logo na
	// carga da página. Um duplo `requestAnimationFrame` garante que o
	// layout já assentou antes de medir e clonar.
	requestAnimationFrame(() => requestAnimationFrame(() => start()));

	function start() {
		ensureColumnCoverage();

		const cols = Array.from(plane!.querySelectorAll<HTMLElement>("[data-drift-wall-col]"));
		const tracks = cols.map((col) => col.querySelector<HTMLElement>("[data-drift-wall-track]")!);
		if (tracks.some((t) => !t)) return;

		runAnimation(tracks);
	}

	function runAnimation(tracks: HTMLElement[]) {
		const unitHeights = tracks.map((track) => fillTrackVertically(track));

		ro = new ResizeObserver(() => {
			tracks.forEach((track, c) => {
				unitHeights[c] = fillTrackVertically(track);
			});
		});
		ro.observe(container);

		const offsets = tracks.map((_, c) => (unitHeights[c] || unit) * ((c * 0.37) % 1));
		const velocities = tracks.map(() => 0);

		const dirSign = opts.direction === "up" ? 1 : -1;
		const baseVelocities = tracks.map((_, c) => {
			const altSign = c % 2 === 0 ? 1 : -1;
			return opts.speed * columnFactor(c, opts.variance) * dirSign * altSign;
		});

		let hoveredCol = -1;
		let wallHovered = false;
		let activeTile: HTMLElement | null = null;
		const pointer = { x: 0, y: 0 };
		const pointerDamped = { x: 0, y: 0 };
		let lastTs: number | null = null;

		const reduced = prefersReducedMotion();

		function animate(ts: number) {
			if (lastTs === null) lastTs = ts;
			const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
			lastTs = ts;

			const maxTilt = opts.parallax * 8;
			const targetX = pointer.x * maxTilt;
			const targetY = -pointer.y * maxTilt;
			const damp = 1 - Math.exp(-dt / 0.12);
			pointerDamped.x += (targetX - pointerDamped.x) * damp;
			pointerDamped.y += (targetY - pointerDamped.y) * damp;
			applyPlaneTransform(pointerDamped.x, pointerDamped.y);

			if (!reduced) {
				for (let c = 0; c < tracks.length; c++) {
					const wrapHeight = unitHeights[c] || unit;
					const paused = wallHovered && opts.pauseOnHover;
					const factor = paused || hoveredCol === c ? 0 : 1;
					const target = baseVelocities[c] * factor;

					const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
					velocities[c] += (target - velocities[c]) * ease;
					let next = (offsets[c] ?? 0) + velocities[c] * dt;
					next = ((next % wrapHeight) + wrapHeight) % wrapHeight;
					offsets[c] = next;

					tracks[c].style.transform = `translate3d(0, ${-next}px, 0)`;
				}
			}

			raf = requestAnimationFrame(animate);
		}
		raf = requestAnimationFrame(animate);

		// Correção (bug relatado — hover não destaca nenhuma imagem): o
		// preenchimento vertical (`fillTrackVertically`) duplica o MESMO
		// bloco de HTML várias vezes dentro de uma coluna pra nunca ficar
		// sem conteúdo — e isso duplica também os `data-tile-id` originais
		// (só os clones HORIZONTAIS de coluna, feitos via `cloneNode`, são
		// renumerados). Ou seja, o mesmo id pode aparecer em 2-3 elementos
		// na mesma coluna, em posições verticais bem diferentes. Como
		// `activate()` antes procurava o tile pelo id (`querySelector`),
		// sempre pegava o PRIMEIRO elemento com aquele id no DOM — quase
		// nunca o mesmo elemento que está de fato embaixo do cursor, então
		// o destaque quase sempre "acendia" numa cópia fora de tela.
		// Corrigido guardando e operando diretamente na REFERÊNCIA do
		// elemento já resolvido pelo hit-test (`e.target`/`closest`), nunca
		// mais reprocurando por id.
		function activate(tile: HTMLElement, colIndex: number) {
			if (tile === activeTile) return;
			activeTile?.classList.remove("is-active");
			activeTile = tile;
			hoveredCol = colIndex;
			tile.classList.add("is-active");
		}
		function release() {
			activeTile?.classList.remove("is-active");
			activeTile = null;
			hoveredCol = -1;
		}

		function onPointerMove(e: PointerEvent) {
			const rect = container.getBoundingClientRect();
			if (opts.parallax > 0 && !reduced) {
				pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
				pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
			}
			// Nem `document.elementFromPoint` nem `e.target` (hit-test
			// NATIVO do navegador) são confiáveis aqui: dentro de uma
			// árvore `preserve-3d` com muitas colunas se sobrepondo em
			// tela sob rotação 3D, boa parte dos pontos que visualmente
			// estão DENTRO de uma imagem resolvem pra um ancestral
			// (`.drift-wall__track`/`.drift-wall__plane`) em vez do tile —
			// confirmado testando uma grade de pontos dentro da área
			// visível de um tile: a maioria não batia em nenhum tile.
			// Por isso a detecção agora é 100% geométrica: mede a
			// bounding box projetada (pós-transform) de cada tile via
			// `getBoundingClientRect()` — a mesma técnica já usada pra
			// diagnosticar/corrigir os vãos entre colunas — e escolhe o
			// tile cujo CENTRO está mais perto do cursor, entre os que
			// realmente contêm o ponto (as bounding boxes de tiles
			// vizinhos se sobrepõem nas bordas; "centro mais próximo"
			// desempata a favor do tile certo, não do vizinho).
			const x = e.clientX;
			const y = e.clientY;
			let best: HTMLElement | null = null;
			let bestDist = Infinity;
			container.querySelectorAll<HTMLElement>("[data-tile-id]").forEach((el) => {
				const r = el.getBoundingClientRect();
				if (x < r.left || x > r.right || y < r.top || y > r.bottom) return;
				const cx = r.left + r.width / 2;
				const cy = r.top + r.height / 2;
				const dist = (x - cx) ** 2 + (y - cy) ** 2;
				if (dist < bestDist) {
					bestDist = dist;
					best = el;
				}
			});
			if (!best) {
				release();
				return;
			}
			activate(best, Number((best as HTMLElement).dataset.col));
		}
		function onPointerEnter() {
			wallHovered = true;
		}
		function onPointerLeave() {
			wallHovered = false;
			pointer.x = 0;
			pointer.y = 0;
			release();
		}
		function onFocusIn(e: FocusEvent) {
			const tile = (e.target as HTMLElement)?.closest<HTMLElement>("[data-tile-id]");
			if (!tile) return;
			activate(tile, Number(tile.dataset.col));
		}
		function onFocusOut() {
			release();
		}

		container.addEventListener("pointermove", onPointerMove);
		container.addEventListener("pointerenter", onPointerEnter);
		container.addEventListener("pointerleave", onPointerLeave);
		container.addEventListener("focusin", onFocusIn);
		container.addEventListener("focusout", onFocusOut);

		cleanupListeners = function cleanup() {
			container.removeEventListener("pointermove", onPointerMove);
			container.removeEventListener("pointerenter", onPointerEnter);
			container.removeEventListener("pointerleave", onPointerLeave);
			container.removeEventListener("focusin", onFocusIn);
			container.removeEventListener("focusout", onFocusOut);
		};
	}

	return function cleanup() {
		cancelAnimationFrame(raf);
		ro?.disconnect();
		cleanupListeners?.();
	};
}
