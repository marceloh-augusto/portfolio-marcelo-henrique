import { gsap } from "./gsapSetup";
import { scaleDuration } from "./reducedMotion";

export interface LogoMarqueeOptions {
	/** Velocidade base, em px/s — quanto menor, mais lento/suave. */
	pxPerSecond?: number;
	/** timeScale aplicado enquanto o mouse está em cima (1 = velocidade normal, 0 = parado). */
	hoverTimeScale?: number;
}

/**
 * Carrossel infinito de logos.
 *
 * Correção (bug relatado pelo usuário — "fica recomeçando", devia ser
 * liso e infinito): a tween andava exatamente `-unitWidth` px antes de
 * repetir, mas `unitWidth` era medido como `track.scrollWidth` de UMA
 * unidade ISOLADA — isso conta os gaps ENTRE os itens dessa unidade,
 * mas não o gap de CONEXÃO entre o fim de uma unidade e o começo da
 * próxima (o `gap` do flex também se aplica ali, já que pro CSS é só
 * mais um item adjacente). Resultado: a tween sempre andava um `gap` a
 * menos do que a distância real entre unidades — cada vez que repetia
 * (voltando instantaneamente de `-unitWidth` pra `0`), o conteúdo
 * pulava esse `gap` faltante, um "soluço" visível a cada volta que lia
 * como o carrossel reiniciando.
 *
 * Fix: mede a distância real entre o início de uma unidade e o início
 * da próxima usando as posições renderizadas de verdade
 * (`getBoundingClientRect`), não a largura de uma unidade isolada —
 * inclui o gap de conexão automaticamente, não importa o valor do gap
 * ou de onde ele vem.
 *
 * Ao passar o mouse, DESACELERA (não pausa — pedido explícito do
 * usuário), e volta à velocidade normal ao tirar o mouse. `timeScale`
 * é trocado direto (sem tween intermediária suavizando a troca): uma
 * tentativa anterior de animar a troca de velocidade com uma tween
 * separada tinha um bug real do GSAP em combinação com uma tween
 * `repeat:-1` (duração infinita) — a segunda troca em sequência
 * (entrar → sair) não aplicava de verdade. O movimento em si continua
 * liso (é sempre a mesma tween contínua) — só a TROCA de velocidade
 * fica instantânea, imperceptível na prática.
 */
export function initLogoMarquee(track: HTMLElement, opts: LogoMarqueeOptions = {}): () => void {
	const pxPerSecond = opts.pxPerSecond ?? 40;
	const hoverTimeScale = opts.hoverTimeScale ?? 0.25;

	const container = track.parentElement ?? track;

	// Envolve o conteúdo original (a única cópia acessível de verdade,
	// sem aria-hidden) num wrapper `display:contents` também — assim
	// toda unidade (original + clones) tem a MESMA estrutura, o que
	// facilita medir a distância entre unidades de forma consistente.
	const firstUnit = document.createElement("div");
	firstUnit.style.display = "contents";
	firstUnit.append(...Array.from(track.childNodes));
	track.append(firstUnit);

	const unitHTML = firstUnit.innerHTML;

	function appendUnit(hidden: boolean): HTMLElement {
		const unit = document.createElement("div");
		unit.style.display = "contents";
		if (hidden) unit.setAttribute("aria-hidden", "true");
		unit.innerHTML = unitHTML;
		track.append(unit);
		return unit;
	}

	// Uma segunda unidade só pra medir a distância real de repetição —
	// `display:contents` faz o wrapper não afetar o layout flex (os
	// filhos se comportam como se estivessem direto no `track`), mas ele
	// continua um nó real no DOM.
	const secondUnit = appendUnit(true);
	const unitWidth =
		secondUnit.firstElementChild!.getBoundingClientRect().left -
		firstUnit.firstElementChild!.getBoundingClientRect().left;

	// Clona mais unidades até a faixa cobrir pelo menos 2x a largura do
	// container — nunca fica vazio, não importa a largura da tela.
	const containerWidth = container.getBoundingClientRect().width;
	let guard = 0;
	while (track.scrollWidth < containerWidth * 2 && guard < 30) {
		appendUnit(true);
		guard++;
	}

	const duration = scaleDuration(unitWidth / pxPerSecond);

	const tween = gsap.to(track, {
		x: -unitWidth,
		duration,
		ease: "none",
		repeat: -1,
	});

	function onEnter() {
		tween.timeScale(hoverTimeScale);
	}
	function onLeave() {
		tween.timeScale(1);
	}

	container.addEventListener("pointerenter", onEnter);
	container.addEventListener("pointerleave", onLeave);

	return function cleanup() {
		tween.kill();
		container.removeEventListener("pointerenter", onEnter);
		container.removeEventListener("pointerleave", onLeave);
	};
}
