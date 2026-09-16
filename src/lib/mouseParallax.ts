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

	function onMove(e: PointerEvent) {
		const rect = container.getBoundingClientRect();
		const nx = (e.clientX - rect.left) / rect.width - 0.5;
		const ny = (e.clientY - rect.top) / rect.height - 0.5;
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
	};
}
