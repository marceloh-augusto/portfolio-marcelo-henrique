import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Este módulo é importado tanto por `<script>` de cliente quanto
// potencialmente avaliado em ambiente Node sem DOM real (build/SSR do
// Astro) — `normalizeScroll()`/listeners de DOM abaixo quebram nesse
// segundo caso (confirmado: `ScrollTrigger.normalizeScroll` acessa
// `window` internamente e derruba o build sem essa guarda). Só roda em
// browser de verdade.
if (typeof window !== "undefined" && typeof document !== "undefined") {
	// Correção (auditoria de scroll "engasgando" no mobile — pedido do
	// usuário): as 2 únicas seções pinadas do site (Hero, Cases) fazem o
	// GSAP "brigar" com o scroll nativo por inércia (momentum) do touch
	// em Android/iOS perto do início/fim de cada pin — comportamento
	// PADRÃO do `pin:` sem ajuste, conhecido na comunidade GSAP por gerar
	// exatamente a sensação de "emperra, solta o dedo e prende de novo".
	// `normalizeScroll()` é a correção oficial do próprio GSAP pra essa
	// classe de sintoma. `{ type: "touch" }` restringe a normalização a
	// touch — o desktop (mouse wheel) já funciona bem sem ela (confirmado
	// na auditoria), então não precisa ter o comportamento alterado.
	ScrollTrigger.normalizeScroll({ type: "touch" });

	// Correção (auditoria de scroll — item 4, trigger calculado com
	// medida provisória): Hero (`getFinalPhotoScale`, largura real da
	// foto) e CasesSection (`scrollDistance`, largura real do texto dos
	// cards) medem elementos via `getBoundingClientRect()`/`scrollWidth`
	// pra calcular a distância de scroll do pin — se a fonte Figtree ou
	// alguma imagem relevante ainda não carregaram nesse instante, a
	// medida vem errada (fallback font mais estreita, imagem com altura
	// 0) e o ScrollTrigger nasce com start/end levemente errados. Antes
	// só um `resize` da janela corrigia isso — em mobile, a maioria dos
	// usuários nunca redimensiona, então o erro persistia pro scroll
	// inteiro. Um único listener aqui (módulo compartilhado, roda 1x por
	// carga de página) refaz o cálculo assim que fonte e imagens terminam.
	let refreshQueued = false;
	function queueRefresh() {
		if (refreshQueued) return;
		refreshQueued = true;
		requestAnimationFrame(() => {
			refreshQueued = false;
			ScrollTrigger.refresh();
		});
	}

	document.fonts?.ready.then(queueRefresh);

	function watchImages() {
		document.querySelectorAll("img").forEach((img) => {
			if (img.complete) return;
			img.addEventListener("load", queueRefresh, { once: true });
		});
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", watchImages, { once: true });
	} else {
		watchImages();
	}
}

export { gsap, ScrollTrigger };
