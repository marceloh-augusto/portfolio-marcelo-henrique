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
 */
const HIDE_THRESHOLD = 80;

export function initAutoHideNav(nav: HTMLElement): () => void {
	let lastY = window.scrollY;

	function onScroll() {
		const y = window.scrollY;
		const scrollingDown = y > lastY;
		const pastThreshold = y > HIDE_THRESHOLD;
		nav.style.transform = scrollingDown && pastThreshold ? "translateY(-150%)" : "translateY(0)";
		lastY = y;
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
