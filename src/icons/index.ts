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
export { Menu as MenuIcon } from '@lucide/astro';
export { X as XIcon } from '@lucide/astro';

// Booking-flow card + Hero trust row (Phase 3a)
export { Lock as LockIcon } from '@lucide/astro'; // step 2 icon (seats locked)
export { Check as CheckIcon } from '@lucide/astro'; // step 3 icon + trust row checks
// XCircle was renamed to CircleX in lucide; export alias keeps the consumer name stable.
export { CircleX as XCircleIcon } from '@lucide/astro'; // "prevented" pill icon
