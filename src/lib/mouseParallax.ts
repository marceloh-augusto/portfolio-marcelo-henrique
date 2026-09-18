import { gsap } from "./gsapSetup";
import { scaleDuration } from "./reducedMotion";

export interface ParallaxOptions {
	/** Deslocamento máximo em px. Pedido: ~10px. */
	maxOffset?: number;
}

/**
 * Parallax sutil da foto do Hero (desktop apenas — o chamador decide o
 * gating por breakpoint via matchMedia). O elemento se desloca em direção
 * ao cursor, suavizado por gsap.quickTo (que já É o lerp/smoothing pedido
 * — sem loop manual de requestAnimationFrame).
 *
 * Aplicado no wrapper de PARALLAX, nunca no wrapper de escala/grayscale:
 * dois GSAP tweens escrevendo x/y e scale no mesmo elemento pisariam um no
 * transform do outro.
 */
export function initParallax(
	wrapper: HTMLElement,
	opts: ParallaxOptions = {},
): () => void {
	const maxOffset = opts.maxOffset ?? 10;
	const duration = scaleDuration(0.6);

	const xTo = gsap.quickTo(wrapper, "x", { duration, ease: "power3" });
	const yTo = gsap.quickTo(wrapper, "y", { duration, ease: "power3" });

	const container = wrapper.parentElement ?? wrapper;

	// Cache do rect (correção — cada `pointermove` chamava
	// `getBoundingClientRect()`, forçando um layout síncrono por evento;
	// como o container não redimensiona durante um gesto de hover, medir
	// 1x aqui e recalcular só em `resize` evita esse custo repetido).
	let containerRect = container.getBoundingClientRect();
	function syncContainerRect() {
		containerRect = container.getBoundingClientRect();
	}
	window.addEventListener("resize", syncContainerRect);

	function onMove(e: PointerEvent) {
		const nx = (e.clientX - containerRect.left) / containerRect.width - 0.5;
		const ny = (e.clientY - containerRect.top) / containerRect.height - 0.5;
		xTo(nx * maxOffset);
		yTo(ny * maxOffset);
	}

	function onLeave() {
		xTo(0);
		yTo(0);
	}

	container.addEventListener("pointermove", onMove);
	container.addEventListener("pointerleave", onLeave);

	return function cleanup() {
		container.removeEventListener("pointermove", onMove);
		container.removeEventListener("pointerleave", onLeave);
		window.removeEventListener("resize", syncContainerRect);
		// Correção (achada em auditoria — cleanup só removia listeners,
		// nunca desfazia o `transform` que o `gsap.quickTo` já tinha
		// escrito no elemento): sem isso, um offset de parallax residual
		// podia sobreviver à troca de breakpoint (o chamador desmonta
		// este efeito via `gsap.matchMedia()` ao cruzar pra mobile) caso
		// o cleanup rode sem um `pointerleave` antes. `gsap.set` zera x/y
		// de imediato, sem depender da duração do `quickTo`.
		gsap.set(wrapper, { x: 0, y: 0 });
	};
}
