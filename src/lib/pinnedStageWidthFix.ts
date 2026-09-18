/**
 * Correção de largura pra elementos que o GSAP ScrollTrigger pina
 * (`pin: stage`) — extraída pra cá depois de aparecer 2x (Hero.astro e
 * CasesSection.astro), mesmo mecanismo nos dois: ao fixar
 * (`position:fixed`), o containing block passa a ser o initial
 * containing block, cuja largura EXCLUI o gutter da scrollbar clássica
 * — mas o GSAP mede a largura ANTES de pinar, no fluxo normal do
 * documento, que já vem menor que o viewport quando há scrollbar.
 * `document.documentElement.clientWidth` é exatamente a largura do
 * initial containing block, correta nos dois casos (scrollbar overlay
 * ou ocupando layout), sem ramificar por breakpoint.
 */
export function applyPinnedStageWidthFix(stage: HTMLElement): void {
	const viewportWidth = document.documentElement.clientWidth;
	stage.style.width = `${viewportWidth}px`;
	stage.style.maxWidth = `${viewportWidth}px`;
	stage.style.left = "0px";
}
