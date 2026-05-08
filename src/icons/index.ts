/**
 * Icon barrel — the single source of truth for icons in this project.
 *
 * RULES:
 * 1. Every component imports icons from `@/icons`. Never from `@lucide/astro`
 *    directly.
 * 2. Every export ends in `Icon`. `Lock` becomes `LockIcon`.
 * 3. Add icons here lazily — only as components actually need them.
 */

export { ArrowRight as ArrowRightIcon } from '@lucide/astro';
export { ChevronDown as ChevronDownIcon } from '@lucide/astro';
export { Menu as MenuIcon } from '@lucide/astro'; // mobile-only (hamburger)
export { X as XIcon } from '@lucide/astro'; // mobile-only (close)
