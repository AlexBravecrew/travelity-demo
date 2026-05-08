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

// Pricing (Phase 3c)
export { Minus as MinusIcon } from '@lucide/astro'; // excluded features in pricing

// GoLive section (Phase 3d)
export { Settings as SettingsIcon } from '@lucide/astro'; // 1. Setup assistance
export { GraduationCap as GraduationCapIcon } from '@lucide/astro'; // 2. Personalized training
export { Headphones as HeadphonesIcon } from '@lucide/astro'; // 3. Dedicated support
export { Sparkles as SparklesIcon } from '@lucide/astro'; // 4. Ongoing updates

// Phase 4 — used by cross-page-component preview/consumers
// (none of the Phase 4 components themselves import icons; consumers do)
export { Globe as GlobeIcon } from '@lucide/astro'; // OTAs / international
export { Code as CodeIcon } from '@lucide/astro'; // embed/widget
export { Plus as PlusIcon } from '@lucide/astro'; // FAQ expand/collapse (rotates 45° → minus)

// Phase 5 — Solutions pages (capability bullets + cross-sell card icons)
export { Boxes as BoxesIcon } from '@lucide/astro'; // products & catalog
export { CircleDollarSign as DollarIcon } from '@lucide/astro'; // pricing rules
export { Receipt as ReceiptIcon } from '@lucide/astro'; // invoices, orders
export { Building2 as BuildingIcon } from '@lucide/astro'; // multi-location, enterprise
export { Shield as ShieldIcon } from '@lucide/astro'; // security
export { ShieldCheck as ShieldCheckIcon } from '@lucide/astro'; // compliance
export { Database as DatabaseIcon } from '@lucide/astro'; // data, isolation
// BarChart3 was deprecated in lucide; ChartColumn is the canonical successor.
export { ChartColumn as BarChartIcon } from '@lucide/astro'; // reporting
export { Webhook as WebhookIcon } from '@lucide/astro'; // integrations, API
export { Languages as LanguagesIcon } from '@lucide/astro'; // multi-currency / locale

// Phase 6 — Audience pages (FeaturePillars + Workflow rows)
export { CalendarDays as CalendarDaysIcon } from '@lucide/astro';
export { MapPin as MapPinIcon } from '@lucide/astro';
export { LayoutGrid as LayoutGridIcon } from '@lucide/astro';
export { Route as RouteIcon } from '@lucide/astro';
export { Bed as BedIcon } from '@lucide/astro';
export { Briefcase as BriefcaseIcon } from '@lucide/astro';
export { TrendingUp as TrendingUpIcon } from '@lucide/astro';
export { MessageSquare as MessageSquareIcon } from '@lucide/astro';
export { Clock3 as Clock3Icon } from '@lucide/astro';
