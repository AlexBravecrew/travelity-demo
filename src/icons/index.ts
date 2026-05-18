/**
 * Icon barrel — the single source of truth for icons in this project.
 *
 * RULES:
 * 1. Every `.astro` component imports icons from `@/icons`. Never from
 *    `@lucide/astro` directly. (React islands import `lucide-react` directly.)
 * 2. Every export ends in `Icon`.
 * 3. Add icons here lazily — only as a component actually imports one.
 *    Speculative additions become dead exports.
 */

// Chrome — nav, mobile drawer, shared affordances
export { ArrowRight as ArrowRightIcon } from '@lucide/astro';
export { ChevronDown as ChevronDownIcon } from '@lucide/astro';
export { Menu as MenuIcon } from '@lucide/astro';
export { X as XIcon } from '@lucide/astro';
export { Check as CheckIcon } from '@lucide/astro';

// Home — feature cards
export { Clock as ClockIcon } from '@lucide/astro';
export { Calendar as CalendarIcon } from '@lucide/astro';
export { ClipboardList as ClipboardListIcon } from '@lucide/astro';
export { FileCheck as FileCheckIcon } from '@lucide/astro';
export { Users as UsersIcon } from '@lucide/astro';
export { CreditCard as CreditCardIcon } from '@lucide/astro';
export { Share2 as Share2Icon } from '@lucide/astro';
export { LayoutGrid as LayoutGridIcon } from '@lucide/astro';
export { MessageSquare as MessageSquareIcon } from '@lucide/astro';

// Home — GoLive section
export { Settings as SettingsIcon } from '@lucide/astro';
export { GraduationCap as GraduationCapIcon } from '@lucide/astro';
export { Headphones as HeadphonesIcon } from '@lucide/astro';
export { Sparkles as SparklesIcon } from '@lucide/astro';

// Channels diagram + FAQ
export { Code as CodeIcon } from '@lucide/astro';
export { Plus as PlusIcon } from '@lucide/astro'; // FAQ expand/collapse (rotates 45° → minus)
// HelpCircle was deprecated in lucide; CircleQuestionMark is the canonical successor.
export { CircleQuestionMark as HelpCircleIcon } from '@lucide/astro';

// Contact page
export { Mail as MailIcon } from '@lucide/astro';
export { Phone as PhoneIcon } from '@lucide/astro';
// CheckCircle2 was deprecated in lucide; CircleCheck is the canonical successor.
export { CircleCheck as CheckCircleIcon } from '@lucide/astro';
