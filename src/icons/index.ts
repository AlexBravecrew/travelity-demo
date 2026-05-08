/**
 * Icon barrel — the single source of truth for icons in this project.
 *
 * RULES:
 * 1. Every component imports icons from `@/icons`. Never from `@lucide/astro`
 *    directly.
 * 2. Every export ends in `Icon`.
 * 3. Add icons here lazily — only as components actually need them.
 */

export { ArrowRight as ArrowRightIcon } from '@lucide/astro';
export { ChevronDown as ChevronDownIcon } from '@lucide/astro';
export { Menu as MenuIcon } from '@lucide/astro';
export { X as XIcon } from '@lucide/astro';
export { Lock as LockIcon } from '@lucide/astro';
export { Check as CheckIcon } from '@lucide/astro';
// XCircle was renamed to CircleX in lucide; export alias keeps the consumer name stable.
export { CircleX as XCircleIcon } from '@lucide/astro';

// Feature cards (Phase 3b)
export { Clock as ClockIcon } from '@lucide/astro'; // Real-time availability
export { Calendar as CalendarIcon } from '@lucide/astro'; // Booking management
export { ClipboardList as ClipboardListIcon } from '@lucide/astro'; // Daily operations
export { FileCheck as FileCheckIcon } from '@lucide/astro'; // Custom proposals
export { Users as UsersIcon } from '@lucide/astro'; // Customer database
export { CreditCard as CreditCardIcon } from '@lucide/astro'; // Payments
