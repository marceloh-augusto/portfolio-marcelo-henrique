/**
 * prefers-reduced-motion: mantém todas as animações do site, só reduz
 * velocidade/duração — nunca desativa (regra explícita do usuário).
 * Lido uma vez (sem listener de "change"): escopo deliberadamente simples,
 * um reload pega a preferência nova caso o usuário mude no meio da sessão.
 */

const REDUCED_MOTION_SCALE = 2.5;

export function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Multiplica uma duração base quando o usuário pediu menos movimento. */
export function scaleDuration(base: number): number {
	return prefersReducedMotion() ? base * REDUCED_MOTION_SCALE : base;
}
