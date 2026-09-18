/**
 * Fonte única do breakpoint de desktop pro lado JS — espelha
 * `--breakpoint-desktop` (global.css). Usado por todo `gsap.matchMedia()`/
 * `window.matchMedia()` que precisa gatear comportamento por essa mesma
 * quebra, pra não depender de 3+ cópias do literal "1280px" ficarem em
 * sincronia manualmente.
 */
export const DESKTOP_BREAKPOINT_PX = 1280;
export const DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_BREAKPOINT_PX}px)`;
