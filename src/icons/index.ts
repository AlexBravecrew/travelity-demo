/**
 * Icon barrel — the single source of truth for icons in this project.
 *
 * RULES:
 * 1. Every component imports icons from `@/icons`. Never from `@lucide/astro`
 *    directly. Never from any other icon package directly.
 * 2. Every export from this file ends in `Icon`. `Lock` becomes `LockIcon`,
 *    `ArrowRight` becomes `ArrowRightIcon`. Always.
 * 3. Add icons here lazily — only as components actually need them.
 *    Do not pre-export the entire lucide library.
 *
 * Why: components stay decoupled from the icon library. Swapping @lucide/astro
 * for tabler/phosphor/custom SVG is a one-file change here, not a project-wide
 * find-and-replace.
 */

export { ArrowRight as ArrowRightIcon } from '@lucide/astro';
