import { gsap, ScrollTrigger } from "./gsapSetup";

/**
 * Porte do componente "ScrollReveal" (React Bits, variante JS+CSS) pro
 * stack do projeto — a dependência listada (`gsap`) já existe no
 * projeto (é o motor de animação usado em tudo), então não precisou
 * instalar nada novo. O componente original não usa nenhum recurso de
 * React além de `useEffect`/`useMemo` pra montar as animações e
 * splitar o texto em palavras — ambos triviais em JS puro.
 *
 * 3 animações por instância, todas scroll-scrubbed (não são "one-shot",
 * acompanham a posição do scroll 1:1, exatamente como o original):
 *  1. Rotação do container inteiro (baseRotation° → 0°) enquanto ele
 *     entra na tela.
 *  2. Opacidade de cada palavra (baseOpacity → 1), em stagger.
 *  3. Blur de cada palavra (blurStrength → 0px), em stagger — opcional.
 */

export interface ScrollRevealOptions {
	enableBlur?: boolean;
	baseOpacity?: number;
	baseRotation?: number;
	blurStrength?: number;
	rotationEnd?: string;
	wordAnimationEnd?: string;
}

const DEFAULTS: Required<ScrollRevealOptions> = {
	enableBlur: true,
	baseOpacity: 0.1,
	baseRotation: 3,
	blurStrength: 4,
	rotationEnd: "bottom bottom",
	wordAnimationEnd: "bottom bottom",
};

export function initScrollReveal(container: HTMLElement, options: ScrollRevealOptions = {}): void {
	const opts = { ...DEFAULTS, ...options };

	gsap.fromTo(
		container,
		{ transformOrigin: "0% 50%", rotate: opts.baseRotation },
		{
			ease: "none",
			rotate: 0,
			scrollTrigger: {
				trigger: container,
				start: "top bottom",
				end: opts.rotationEnd,
				scrub: true,
			},
		},
	);

	const words = container.querySelectorAll<HTMLElement>(".word");

	gsap.fromTo(
		words,
		{ opacity: opts.baseOpacity },
		{
			ease: "none",
			opacity: 1,
			stagger: 0.05,
			scrollTrigger: {
				trigger: container,
				start: "top bottom-=20%",
				end: opts.wordAnimationEnd,
				scrub: true,
			},
		},
	);

	if (opts.enableBlur) {
		gsap.fromTo(
			words,
			{ filter: `blur(${opts.blurStrength}px)` },
			{
				ease: "none",
				filter: "blur(0px)",
				stagger: 0.05,
				scrollTrigger: {
					trigger: container,
					start: "top bottom-=20%",
					end: opts.wordAnimationEnd,
					scrub: true,
				},
			},
		);
	}
}

/**
 * Troca o texto de uma instância já inicializada (usado pelo toggle de
 * idioma, ver i18n.ts) — não dá pra só trocar o `textContent`/`innerHTML`
 * porque cada `.word` tem seu PRÓPRIO ScrollTrigger scrub preso a ele
 * (ver `initScrollReveal` acima); substituir os nós sem matar esses
 * triggers primeiro deixaria ScrollTriggers órfãos (presos a nós já
 * removidos do DOM) e duplicaria as animações a cada troca de idioma.
 */
export function setScrollRevealText(container: HTMLElement, text: string): void {
	const oldWords = container.querySelectorAll<HTMLElement>(".word");
	ScrollTrigger.getAll().forEach((st) => {
		if (st.trigger === container) st.kill();
	});
	gsap.killTweensOf(container);
	gsap.killTweensOf(oldWords);

	const textEl = container.querySelector<HTMLElement>(".scroll-reveal-text");
	if (!textEl) return;
	textEl.innerHTML = "";
	text.split(/(\s+)/).forEach((w) => {
		if (/^\s+$/.test(w)) {
			textEl.append(w);
			return;
		}
		const span = document.createElement("span");
		span.className = "word";
		span.textContent = w;
		textEl.appendChild(span);
	});

	const config = container.dataset.config ? JSON.parse(container.dataset.config) : {};
	initScrollReveal(container, config);
}
