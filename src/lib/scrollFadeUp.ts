import { gsap } from "./gsapSetup";

/**
 * Fade in + slide up genérico ao entrar na viewport (pedido do usuário,
 * pra aplicar em blocos de conteúdo pela página inteira). Valores no
 * meio das faixas que o usuário especificou: 24px de deslocamento
 * (faixa pedida: 20-30px), 500ms de duração (faixa: 400-600ms), 120ms de
 * stagger (faixa: 100-150ms), easing suave (`power2.out` — GSAP não tem
 * um ease chamado "ease-out" nativo, esse é o mais próximo do
 * `cubic-bezier` que os navegadores usam pra `ease-out` em CSS).
 *
 * Dispara só uma vez (`once: true` no ScrollTrigger) — não repete ao
 * rolar pra cima e descer de novo, conforme pedido.
 *
 * `prefers-reduced-motion`: a função simplesmente não anima nada nesse
 * caso — o elemento já nasce no estado final (opacidade 1, sem
 * deslocamento) porque `gsap.from()` só aplica o estado inicial quando a
 * animação de fato roda. Sem esse guard, o "de" da animação (opacity:0)
 * ficaria aplicado indefinidamente pra quem tem a preferência ativada e
 * o elemento nunca chegaria no estado visível.
 */
const DISTANCE_PX = 24;
const DURATION_S = 0.5;
const STAGGER_S = 0.12;
const EASE = "power2.out";
const TRIGGER_START = "top 85%";

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Um único bloco (seção, imagem, card avulso) fade+slide ao entrar na tela. */
export function initScrollFadeUp(el: HTMLElement): void {
	if (prefersReducedMotion()) return;

	gsap.from(el, {
		opacity: 0,
		y: DISTANCE_PX,
		duration: DURATION_S,
		ease: EASE,
		scrollTrigger: {
			trigger: el,
			start: TRIGGER_START,
			once: true,
		},
	});
}

/**
 * Um grupo de itens (lista, grade de cards) — os FILHOS DIRETOS de
 * `container` entram em stagger, não o container inteiro de uma vez.
 */
export function initScrollFadeUpGroup(container: HTMLElement): void {
	if (prefersReducedMotion()) return;

	const items = Array.from(container.children) as HTMLElement[];
	if (items.length === 0) return;

	gsap.from(items, {
		opacity: 0,
		y: DISTANCE_PX,
		duration: DURATION_S,
		ease: EASE,
		stagger: STAGGER_S,
		scrollTrigger: {
			trigger: container,
			start: TRIGGER_START,
			once: true,
		},
	});
}

/**
 * Varre o DOM (ou um escopo específico, default `document`) aplicando os
 * 2 comportamentos acima via data-attribute — `data-reveal` num elemento
 * único, `data-reveal-group` num container cujos filhos diretos devem
 * fazer stagger. Chamado uma vez por página (Layout.astro) — cobre
 * qualquer seção que ganhe esses atributos, sem precisar de um `<script>`
 * próprio em cada componente.
 */
export function initScrollReveals(scope: ParentNode = document): void {
	scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach(initScrollFadeUp);
	scope.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach(initScrollFadeUpGroup);
}
