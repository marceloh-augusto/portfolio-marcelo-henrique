import { prefersReducedMotion } from "./reducedMotion";

/**
 * Porte pra TypeScript puro do componente "ScrollVelocity" (React Bits,
 * variante JS+CSS) — o projeto não usa React nem a lib `motion` (só
 * Astro + TS + GSAP, ver CLAUDE.md). O componente original só usa React
 * pra orquestrar hooks (`useMotionValue`, `useVelocity`, `useSpring`,
 * `useTransform`, `useAnimationFrame`) que, no fundo, são: 1 valor mutável
 * (posição X acumulada), 1 derivada do scroll (velocidade), 1 suavização
 * tipo mola (spring) daquela velocidade, e 1 loop de rAF que acumula
 * deslocamento — nada disso depende de React. Reimplementado aqui como
 * matemática simples + `requestAnimationFrame` puro (mesmo padrão do
 * topographyEffect.ts) — por isso a dependência `motion` do pacote
 * original NÃO foi instalada, evita uma lib nova pra algo que já dá pra
 * fazer com o que o projeto já tem.
 */

export interface ScrollVelocityOptions {
	/** Velocidade base do scroll do texto, em px/s. Sinal definido pelo chamador (linhas alternam direção). */
	baseVelocity: number;
	/** Damping da mola que suaviza a velocidade de scroll captada. */
	damping?: number;
	/** Stiffness da mola. */
	stiffness?: number;
	/** Mapeamento linear (sem clamp, extrapola nos dois sentidos) de velocidade de scroll -> multiplicador de movimento. */
	velocityMapping?: { input: [number, number]; output: [number, number] };
}

const SPRING_STEP = 1 / 120;

function wrap(min: number, max: number, v: number): number {
	const range = max - min;
	const mod = (((v - min) % range) + range) % range;
	return mod + min;
}

function mapRange(value: number, input: [number, number], output: [number, number]): number {
	const [inMin, inMax] = input;
	const [outMin, outMax] = output;
	const t = (value - inMin) / (inMax - inMin);
	return outMin + t * (outMax - outMin);
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Anima `scroller` (a faixa com N cópias do texto lado a lado) deslizando
 * continuamente a `baseVelocity` px/s, acelerando/invertendo brevemente
 * conforme a velocidade real do scroll da página (suavizada por uma mola
 * massa-mola-amortecedor simples, mesmo princípio do `useSpring` do
 * Framer Motion). `firstCopy` é usado só pra medir a largura de uma cópia
 * do texto (pra saber o ponto de wrap do loop infinito).
 */
export function initScrollVelocityRow(
	scroller: HTMLElement,
	firstCopy: HTMLElement,
	options: ScrollVelocityOptions,
): () => void {
	const damping = options.damping ?? 50;
	const stiffness = options.stiffness ?? 400;
	const velocityMapping = options.velocityMapping ?? { input: [0, 1000] as [number, number], output: [0, 5] as [number, number] };
	const baseVelocity = prefersReducedMotion() ? options.baseVelocity / 2.5 : options.baseVelocity;

	let copyWidth = firstCopy.offsetWidth;
	const ro = new ResizeObserver(() => {
		copyWidth = firstCopy.offsetWidth;
	});
	ro.observe(firstCopy);

	let lastScrollY = window.scrollY;
	let smoothVelocity = 0;
	let springVel = 0; // "velocidade" do próprio valor suavizado (estado interno da mola)
	let baseX = 0;
	let direction = 1;
	let lastTime = performance.now();
	let raf = 0;

	// Correção (bug reportado pelo usuário — texto e foto ficavam
	// "desalinhados" horizontalmente ao rolar rápido, só ficava certo
	// rolando devagar): diagnóstico — `mapRange` não tem clamp, extrapola
	// linear pros dois lados. Um flick rápido do mouse gera um
	// `rawVelocity` bem maior que `velocityMapping.input` (pensado pra
	// scroll normal), e isso se propaga SEM TETO até `velocityFactor`,
	// multiplicando `moveBy` muito além do previsto — o texto "dispara"
	// pra longe da posição que teria num scroll normal. A foto (GSAP
	// scrub, baseado na posição atual do scroll) não tem esse
	// acumulador, então não acompanha o disparo — daí a sensação de
	// desalinhamento. Fix: 2 clamps —
	// 1) `rawVelocity` não entra na mola além de um teto (ainda reage
	//    forte a scroll rápido, mas não deixa o "impulso" bruto de um
	//    flick extremo virar um valor absurdo);
	// 2) `velocityFactor` (resultado do `mapRange`) fica travado dentro
	//    da própria faixa de `output` pedida — nunca extrapola além do
	//    que o efeito foi desenhado pra produzir, não importa o quão
	//    rápido o scroll seja.
	const maxRawVelocity = velocityMapping.input[1] * 2;
	const maxVelocityFactor = Math.max(Math.abs(velocityMapping.output[0]), Math.abs(velocityMapping.output[1]));

	const loop = (now: number) => {
		const dt = Math.min((now - lastTime) / 1000, 1 / 30); // trava o passo em jank grande, evita "pulo"
		lastTime = now;

		const y = window.scrollY;
		const rawVelocity = dt > 0 ? clamp((y - lastScrollY) / dt, -maxRawVelocity, maxRawVelocity) : 0;
		lastScrollY = y;

		// Integração semi-implícita (Euler) de uma mola massa=1 puxando
		// `smoothVelocity` em direção a `rawVelocity` — mesmo comportamento
		// físico de `useSpring(scrollVelocity, {damping, stiffness})`.
		// Sub-passos fixos: com 1 passo por frame e `dt` ≈ 1/30 (fps baixo,
		// cena pesada) o integrador fica com autovalor negativo e
		// `smoothVelocity` passa a alternar de sinal a cada frame ao decair —
		// `direction` (abaixo) inverte todo frame e o marquee para de andar.
		const steps = Math.max(1, Math.ceil(dt / SPRING_STEP));
		const h = dt / steps;
		for (let i = 0; i < steps; i++) {
			const springForce = stiffness * (rawVelocity - smoothVelocity);
			const dampingForce = -damping * springVel;
			springVel += (springForce + dampingForce) * h;
			smoothVelocity += springVel * h;
		}

		const velocityFactor = clamp(
			mapRange(smoothVelocity, velocityMapping.input, velocityMapping.output),
			-maxVelocityFactor,
			maxVelocityFactor,
		);

		let moveBy = direction * baseVelocity * dt;
		if (velocityFactor < 0) direction = -1;
		else if (velocityFactor > 0) direction = 1;
		moveBy += direction * moveBy * velocityFactor;
		baseX += moveBy;

		const x = copyWidth === 0 ? 0 : wrap(-copyWidth, 0, baseX);
		scroller.style.transform = `translateX(${x}px)`;

		raf = requestAnimationFrame(loop);
	};
	raf = requestAnimationFrame(loop);

	return function cleanup() {
		cancelAnimationFrame(raf);
		ro.disconnect();
	};
}
