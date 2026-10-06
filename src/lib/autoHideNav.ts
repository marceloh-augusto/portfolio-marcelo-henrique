/**
 * Navbar "smart" (esconde ao rolar pra baixo, aparece ao rolar pra
 * cima) — padrão pedido pelo usuário pra a nav global fixa não ocupar
 * espaço/atenção o tempo todo durante leitura de conteúdo longo (Cases).
 * Só troca um `transform` (translateY) via CSS, a transição em si é CSS
 * puro (`transition-transform` no elemento, ver Layout.astro) — o JS só
 * decide a direção do scroll.
 *
 * Sem throttle via rAF/"ticking" de propósito (uma tentativa anterior
 * com esse padrão tinha um bug sutil de estado que deixava o flag
 * "ticking" preso em `true`, nunca resetando, e a nav parava de reagir
 * depois do primeiro scroll) — o cálculo aqui é barato o bastante
 * (2 comparações + 1 write de style) pra rodar direto no evento de
 * scroll sem precisar de throttle.
 *
 * Não esconde nos primeiros `HIDE_THRESHOLD` px de scroll (perto do
 * topo) — evita a nav "piscar" escondendo/aparecendo com qualquer
 * pequeno movimento logo no início da página.
 *
 * Só troca de estado depois de `DIRECTION_DELTA` px acumulados na mesma
 * direção — no mobile, inércia, rubber-band (`scrollY` negativo no iOS) e
 * a barra de URL recolhendo geram reversões de 1–2px que faziam a nav
 * piscar. Ao esconder, desloca altura da nav + `top` + folga da sombra,
 * pra sair inteira da tela (`-150%` deixava ~2px visíveis no mobile).
 */
const HIDE_THRESHOLD = 80;
const DIRECTION_DELTA = 10;
const HIDDEN_TRANSFORM = "translateY(calc(-100% - var(--spacing-lg) - 16px))";

export function initAutoHideNav(nav: HTMLElement): () => void {
	let anchorY = Math.max(window.scrollY, 0);
	let hidden = false;

	function setHidden(next: boolean) {
		if (next === hidden) return;
		hidden = next;
		nav.style.transform = hidden ? HIDDEN_TRANSFORM : "translateY(0)";
	}

	function onScroll() {
		const y = Math.max(window.scrollY, 0);
		if (y <= HIDE_THRESHOLD) {
			setHidden(false);
			anchorY = y;
			return;
		}
		if (y > anchorY) {
			if (y - anchorY >= DIRECTION_DELTA) setHidden(true);
			else return;
		} else if (anchorY - y >= DIRECTION_DELTA) {
			setHidden(false);
		} else {
			return;
		}
		anchorY = y;
	}

	window.addEventListener("scroll", onScroll, { passive: true });

	return function cleanup() {
		window.removeEventListener("scroll", onScroll);
	};
}

/**
 * Regra diferente da nav como um todo (pedido do usuário): o texto
 * "Santa Catarina - BR" deve sumir assim que o scroll sai do topo e
 * NÃO voltar ao rolar pra cima de novo (ao contrário do resto da nav,
 * que reaparece) — só reaparece se o usuário voltar pro topo mesmo
 * (`scrollY` de volta a ~0). Por isso é um efeito independente do
 * `initAutoHideNav` acima (que reage à DIREÇÃO do scroll), baseado só
 * na POSIÇÃO absoluta do scroll.
 */
const TOP_THRESHOLD = 4;

export function initHideAfterScroll(el: HTMLElement): () => void {
	function onScroll() {
		const atTop = window.scrollY <= TOP_THRESHOLD;
		el.classList.toggle("opacity-0", !atTop);
		el.classList.toggle("pointer-events-none", !atTop);
	}
	onScroll();

	window.addEventListener("scroll", onScroll, { passive: true });

	return function cleanup() {
		window.removeEventListener("scroll", onScroll);
	};
}
