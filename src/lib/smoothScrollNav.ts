import { gsap } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

/**
 * Scroll suave (ease-in-out, GSAP ScrollToPlugin) ao clicar num link de
 * âncora (`href="#id"`) dentro do elemento passado — troca o "pulo"
 * seco do anchor-jump nativo do navegador (pedido do usuário: "ficou
 * muito seca") por uma animação rápida e fluida.
 *
 * `NAV_OFFSET` replica o `scroll-padding-top` do global.css (nav fixa
 * sobrepondo o topo da seção-alvo) — o ScrollToPlugin não lê
 * `scroll-padding` do CSS, então o valor é repetido aqui manualmente;
 * se um mudar, o outro precisa acompanhar.
 *
 * Correção (bug reportado — links da nav "Cases"/"Sobre"/"Contato" não
 * funcionavam na página de um case study): a nav é compartilhada
 * (Layout.astro) e os `href="#cases"` etc. são âncoras relativas à
 * página atual — essas seções só existem na Home, então em qualquer
 * outra página `document.querySelector(hash)` não encontrava nada e o
 * clique não fazia nada. Agora, se o alvo não existe na página atual,
 * navega pra Home com o hash (`/#cases`) em vez de simplesmente
 * desistir — o próprio `scroll-padding-top` do global.css já garante o
 * offset correto da nav fixa no salto nativo de âncora ao carregar.
 */
const NAV_OFFSET = 100;
const DURATION = 0.9;

export function initSmoothScrollNav(container: HTMLElement): () => void {
	function onClick(e: MouseEvent) {
		const link = (e.target as HTMLElement)?.closest<HTMLAnchorElement>('a[href^="#"]');
		if (!link) return;
		const hash = link.getAttribute("href");
		if (!hash || hash === "#") return; // "#" sozinho = placeholder (ex: Currículo), não é âncora de verdade
		const target = document.querySelector(hash);

		if (!target) {
			if (window.location.pathname !== "/") {
				e.preventDefault();
				window.location.href = "/" + hash;
			}
			return;
		}

		e.preventDefault();

		if (prefersReducedMotion()) {
			target.scrollIntoView({ block: "start" });
			return;
		}

		gsap.to(window, {
			duration: DURATION,
			ease: "power2.inOut",
			scrollTo: { y: target, offsetY: NAV_OFFSET },
		});
	}

	container.addEventListener("click", onClick);

	return function cleanup() {
		container.removeEventListener("click", onClick);
	};
}
