# PROJECT-STATE.md — Travelity Marketing Site

> **Read this at the start of any session before writing or reviewing code.** This document captures the current state of the project, the conventions established across 11 build phases, and what remains. It supersedes earlier handoff docs (`HANDOFF-PROMPT.md` was for the _initial_ build; this is for _ongoing_ work).
>
> **Last updated:** Phase 17 — mobile drawer rebuild, tablet breakpoint, animated featured card border (full doc sync).

---

## TL;DR — What this project is

Astro 6 marketing site for **Travelity**, a multi-tenant SaaS booking platform serving travel businesses (tour operators, transfer providers, accommodation hosts, independent guides). Site lives at `travelity.app`. Built across 11 phases; structurally complete.

**Status:** every page exists, every link resolves, every form works. Pre-launch tasks remaining are content/operations, not engineering. See [§9 Pre-launch checklist](#9-pre-launch-checklist).

---

## 1. Stack — locked

| Layer          | Choice                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Astro 6 (file-based routing, static-by-default with hybrid mode for Actions)                                                  |
| Styling        | Tailwind v4 (CSS-first via `@theme` in `src/styles/global.css`)                                                               |
| Type system    | TypeScript 5.x strict                                                                                                         |
| Islands        | React 19 (only when state genuinely needed — currently 2: `ContactForm` and `CalendlyWidget`)                                 |
| Server runtime | `@astrojs/node` adapter (mode: standalone). Swap-friendly to Vercel/Netlify/Cloudflare.                                       |
| Forms          | React Hook Form + zod (shared schemas with server-side Astro Actions)                                                         |
| Icons          | `@lucide/astro` (Astro components) and `lucide-react` (React islands). Both reference the same icon set; the bindings differ. |
| Node           | 22+                                                                                                                           |

**No SPA libraries.** No TanStack Query, React Router, Axios, Redux/Zustand/Jotai. **No CSS-in-JS.** **No `tailwind.config.js`** (Tailwind v4 is config-less; tokens live in `@theme`).

---

## 2. Site shape — 23 prerendered pages + 1 server endpoint

| Path                             | Phase | Notes                                                                                     |
| -------------------------------- | ----- | ----------------------------------------------------------------------------------------- |
| `/`                              | 3a-3d | Home: Hero → Channels → Features → Parallax → Pricing → GoLive → ClosingCTA               |
| `/solutions/booking-engine`      | 5     | The flagship Solutions page. 6 capability sections.                                       |
| `/solutions/widget`              | 5     | 3 capabilities                                                                            |
| `/solutions/integrations`        | 5     | OTA integrations. 3 capabilities.                                                         |
| `/solutions/proposals`           | 5     | 3 capabilities                                                                            |
| `/solutions/reporting`           | 5     | 3 capabilities                                                                            |
| `/solutions/security`            | 5     | 3 capabilities                                                                            |
| `/audiences/tour-operators`      | 6     | Pain → Solution → Pillars → Workflow → PlanRec → CrossSell → Close                        |
| `/audiences/transfer-providers`  | 6     | Same shape, different copy                                                                |
| `/audiences/accommodation-hosts` | 6     | Same shape                                                                                |
| `/audiences/independent-guides`  | 6     | Same shape                                                                                |
| `/pricing`                       | 8     | Hero → 3 plan cards → ComparisonTable (4 groups, 13 rows) → FaqAccordion (8 Q&As) → Close |
| `/book-demo`                     | 7,16  | Calendly inline widget + YouTube walkthrough video in hero (Phase 16)                     |
| `/thank-you`                     | 7     | Static fallback for non-JS form submission                                                |
| `/legal/privacy`                 | 9     | AI-drafted GDPR-aware privacy policy                                                      |
| `/legal/terms`                   | 9     | AI-drafted Terms of Service                                                               |
| `/legal/dpa`                     | 9     | AI-drafted Data Processing Agreement                                                      |
| `/legal/cookies`                 | 9     | AI-drafted Cookies Policy                                                                 |
| `/our-story`                     | 10    | AI-drafted founder narrative                                                              |
| `/faq`                           | 10    | 18 Q&As across 4 categories                                                               |
| `/guides`                        | 10    | 9 placeholder guide cards (hrefs are `#`)                                                 |
| `/help-center`                   | 10    | Visual search bar (non-functional) + 3 hub tiles                                          |
| `/contact`                       | 11    | React form island, 4 fields, posts to `contact` Astro Action                              |
| Server: `/_actions/*`            | 7, 11 | Astro Action endpoints for both forms                                                     |

**Intentionally 404:** `/help`, `/privacy`, `/terms`, `/dpa`, `/cookies` (renamed during phases 9-10; old paths retired). Set up redirects before going live if any external campaigns or search-engine indexes pointed at the old URLs.

---

## 3. Component layout

```
src/
├── components/
│   ├── ui/                          # Atoms (Phase 1, 1.5)
│   │   ├── button/                  # 3 variants × 3 sizes, withArrow
│   │   ├── eyebrow/                 # JetBrains Mono uppercase rule label
│   │   ├── tag/                     # 4 semantic variants incl. destructive
│   │   ├── link-inline/             # underlined inline link with optional arrow
│   │   ├── card/                    # default/featured (animated gradient border, Phase 17) + interactive
│   │   └── section-header/          # eyebrow + headline slot + dek + actions
│   │
│   ├── chrome/                      # Site-wide chrome (Phase 2; nav Phase 14, mobile drawer Phase 17)
│   │   ├── nav/                     # 68px nav + 44px sub-row pinned by route
│   │   │   ├── Nav.astro            # Top row, computes active section from pathname
│   │   │   ├── NavLink.astro        # Trigger (no popover) — teal when its section/page is active
│   │   │   ├── NavSubRow.astro      # 44px sub-row, sticky top-[68px], underline-tab items
│   │   │   ├── MobileMenuTrigger.astro  # Hamburger button — lives inside <nav> (Phase 17 split)
│   │   │   ├── MobileMenu.astro     # Slide-from-right drawer + backdrop (sibling of <nav>, Phase 17)
│   │   │   ├── nav-data.ts          # Source of truth for nav structure
│   │   │   ├── nav-active.ts        # getActiveSection(pathname, links) (Phase 14)
│   │   │   └── nav.client.ts        # Hover-swap, scroll handlers, mobile drawer + backdrop/close wiring
│   │   └── footer/                  # 5/2/1-col responsive, dark ink
│   │
│   ├── home/                        # Home-page sections (Phase 3a-3d)
│   │   ├── hero/                    # Hero + HeroVisual + BookingFlowCard + AudienceChips
│   │   ├── channels-section/        # Orbit diagram: hub + 5 nodes + flowing dashed pulses (Phase 15)
│   │   ├── features-section/        # 6-card grid with per-position color rotation
│   │   ├── parallax-break/          # Scroll-driven photo break
│   │   ├── pricing-section/         # 3 plan cards (reused on /pricing)
│   │   ├── golive-section/          # 4-col onboarding
│   │   └── closing-cta-section/     # Final conversion strip
│   │
│   ├── shared/                      # Cross-page components
│   │   ├── product-hero/            # Used by Solutions AND Audience pages (Phase 4); ctasAlign prop Phase 16
│   │   ├── capability-section/      # 2-col with `flip` prop (Phase 4)
│   │   ├── cross-sell/              # 3-card "explore" strip (Phase 4)
│   │   ├── social-proof/            # Testimonial cards (Phase 4)
│   │   ├── pain-grid/               # Audience problems (Phase 6)
│   │   ├── solution-map/            # Pain→arrow→fix rows (Phase 6)
│   │   ├── feature-pillars/         # Vertical capability list with optional spotlight (Phase 6)
│   │   ├── workflow/                # 4-col timeline stepper (Phase 6)
│   │   ├── plan-rec/                # Recommended-plan callout (Phase 6)
│   │   ├── coverage-list/           # Book Demo "what we'll cover" (Phase 7)
│   │   ├── comparison-table/        # Pricing feature comparison (Phase 8)
│   │   ├── faq-accordion/           # Native <details>-based FAQ (Phase 8)
│   │   ├── legal-page-layout/       # Shared chrome for 4 legal pages (Phase 9)
│   │   ├── guide-card/              # Article preview card (Phase 10)
│   │   └── help-tile/               # Help center hub tile (Phase 10)
│   │
│   ├── decorative/                  # Bespoke SVG components
│   │   ├── mountain-scene/          # HeroVisual scene mock
│   │   └── ota-logos/               # GygLogo + ViatorLogo + KlookLogo (Phase 15)
│   │
│   ├── book-demo/                   # /book-demo page-specific React island + video (Phase 16)
│   │   ├── CalendlyWidget.tsx       # InlineWidget + event_scheduled → CRM sync → redirect
│   │   └── BookDemoVideo.astro      # YouTube walkthrough iframe (nocookie + lazy)
│   │
│   └── forms/                       # React form islands
│       └── contact/                 # 4-field contact form (only form left after Phase 16)
│
├── pages/
│   ├── index.astro                  # /
│   ├── solutions/                   # 6 Solutions pages
│   ├── audiences/                   # 4 Audience pages
│   ├── legal/                       # 4 Legal pages
│   ├── _internal/                   # Underscore-prefixed: showcase + phase-4-preview (not built)
│   ├── book-demo/index.astro
│   ├── contact.astro
│   ├── pricing.astro
│   ├── faq.astro
│   ├── guides.astro
│   ├── help-center.astro
│   ├── our-story.astro
│   └── thank-you.astro
│
├── actions/
│   └── index.ts                     # contact Astro Action (bookDemo removed Phase 16 — Calendly handles)
│
├── icons/
│   └── index.ts                     # Single barrel for ~30 lucide icons; .astro files import only from here
│
├── layouts/
│   └── MarketingLayout.astro        # <html>/<head> wrapper, font links, meta tags
│
├── lib/
│   └── utils/
│       ├── cn.ts                    # className merger
│       ├── paths.ts                 # All URL strings centralized
│       └── external-attrs.ts        # target=_blank + rel=noopener helper
│
└── styles/
    └── global.css                   # Tailwind imports + @theme tokens + base resets + --nav-height
```

---

## 4. Conventions — locked across all phases

Following these is not optional. Violations should be flagged in code review.

### 4.1 Token rule

- All colors in components use `hsl(var(--token-name))` or Tailwind utilities that resolve to tokens (`bg-paper`, `text-ink`, `text-travelity-teal`).
- **No hex codes** in `src/components/` or `src/pages/`. Verify with: `grep -rE "#[0-9a-fA-F]{6}" src/components/ src/pages/` → 0 matches.
- **Exemption:** decorative SVGs (`MountainScene`, `ParallaxScene`, the booking-flow card's pulse) may use bespoke `hsl()` literals because their colors are landscape/effect-specific and don't reuse elsewhere.
- **Exemption:** AI-drafted legal pages' DRAFT banner uses raw amber `hsl()` because warning colors aren't part of the brand palette.

### 4.2 Color-name purity

The codebase contains **zero** references to warm-direction tokens. All v2.5 reference HTML uses warm names (coral/cream/sand/gold/line-warm) which are **translated** during transcription:

| v2.5 alias          | Astro component    |
| ------------------- | ------------------ |
| `--travelity-cream` | `--paper`          |
| `--travelity-coral` | `--travelity-teal` |
| `--travelity-sand`  | `--surface-alt`    |
| `--line-warm`       | `--line`           |

Verify with: `grep -rE "(coral|cream|sand|gold|line-warm)" src/components/ src/pages/` → 0 matches.

### 4.3 Icon barrel rule

- **`.astro` files** import all icons from `@/icons` (the barrel). Never directly from `@lucide/astro`.
- **`.tsx` files (React islands)** import from `lucide-react` directly. The icon-barrel rule does not apply.
- All icon exports in the barrel end with the suffix `Icon` (e.g. `LockIcon`, not `Lock`).
- The barrel also handles upstream renames (e.g. lucide deprecated `XCircle` → `CircleX`; the barrel exports `CircleX as XCircleIcon` so consumers' imports stay stable).

Verify with: `grep -r "from '@lucide/astro'" src/components/` → should match only `src/icons/index.ts`.

### 4.4 Variant API rule

Every component takes:

- A typed `Props` interface that `extends HTMLAttributes<'TAG'>` for rest-args pass-through.
- An optional `class?: string` prop merged via `cn()`.
- `...rest` spread on the root element.

Pattern:

```astro
---
export interface Props extends HTMLAttributes<'div'> {
    class?: string;
}
const { class: className, ...rest } = Astro.props;
---

<div class={cn('default-classes', className)} {...rest}>
    <slot />
</div>
```

### 4.5 Reduced-motion

Every animation, hover-lift, and transition has a `@media (prefers-reduced-motion: reduce)` override that disables it. Verified for: BookingFlowCard's 3-step animation, ChannelHub's pulse, ParallaxBreak's scroll-driven translate, all card hover lifts, audience chip hover transforms, FAQ icon rotations.

### 4.6 Reusable URL constants

All internal URLs come from `src/lib/utils/paths.ts`:

```ts
export const Paths = {
    HOME: '/',
    SOLUTIONS_BOOKING_ENGINE: '/solutions/booking-engine',
    SOLUTIONS_WIDGET: '/solutions/widget',
    // ... etc
    AUDIENCE_TOUR_OPERATORS: '/audiences/tour-operators',
    // ... etc
    LEGAL_PRIVACY: '/legal/privacy',
    LEGAL_TERMS: '/legal/terms',
    // ... etc
    PRICING: '/pricing',
    BOOK_DEMO: '/book-demo',
    CONTACT: '/contact',
    THANK_YOU: '/thank-you',
    FAQ: '/faq',
    GUIDES: '/guides',
    HELP_CENTER: '/help-center',
    OUR_STORY: '/our-story',
    STATUS: 'https://status.travelity.app', // external
} as const;
```

Naming convention: namespaced prefixes (`SOLUTIONS_*`, `AUDIENCE_*`, `LEGAL_*`) for grouped routes; flat names for one-offs (`PRICING`, `CONTACT`).

### 4.7 Folder/file naming

- Folders: `kebab-case` (`pricing-section/`, `book-demo/`)
- Components: `PascalCase.astro` / `PascalCase.tsx` (`PricingPlan.astro`, `ContactForm.tsx`)
- Helpers: `kebab-case.ts` (`nav.client.ts`, `book-demo-schema.ts`)
- Each component folder has an `index.ts` barrel re-exporting its public surface
- Test/preview pages live under `src/pages/_internal/` (Astro skips underscore-prefixed paths from the build)

### 4.8 Tailwind v4 — no config file

Tokens live in `src/styles/global.css` inside an `@theme` block. There is **no `tailwind.config.js`** and there will not be one — Tailwind v4 is config-less by design.

To add a new token:

```css
@theme {
    --color-travelity-teal-hover: hsl(194 56% 47%); /* example */
}
```

…then use it as `bg-travelity-teal-hover` etc.

### 4.9 Astro Actions

Defined in `src/actions/index.ts`. Only `contact` remains (the `bookDemo` action was removed in Phase 16 when /book-demo switched to Calendly):

```ts
export const server = {
    contact: defineAction({ accept: 'json', input: contactSchema, handler: ... }),
};
```

Current handler logs to console + simulates 600ms latency. **Real email service wiring is a pre-launch task.** Calendly bookings are CRM-synced via a POST inside `CalendlyWidget.tsx` (separate concern, separate TODO).

### 4.10 Hydration directives

React islands use `client:load` for forms (immediate hydration; the form is the page's primary CTA). No island uses `client:idle`, `client:visible`, or `client:media` yet — if a future island can defer, document the choice.

---

## 5. Visual language

### 5.1 Palette — cool blue + teal only

| Token                                | Value              | Use                                           |
| ------------------------------------ | ------------------ | --------------------------------------------- |
| `--travelity-blue`                   | `hsl(218 42% 48%)` | Primary brand blue (lifted variant)           |
| `--travelity-teal`                   | `hsl(194 56% 57%)` | Primary brand teal (accent / italic-em color) |
| `--travelity-blue-deep`              | `hsl(218 50% 38%)` | Deeper variant for tonal distinction          |
| `--travelity-teal-deep`              | `hsl(194 40% 40%)` | Deeper variant for tonal distinction          |
| `--paper`                            | white              | Default surface                               |
| `--surface-alt`                      | light gray         | Alternating section background                |
| `--ink`, `--ink-muted`, `--ink-soft` | grayscale tones    | Text foreground hierarchy                     |
| `--line`                             | light gray         | Default border                                |
| `--success`                          | green              | Form success, included-feature checks         |
| `--destructive`                      | red                | Form errors, "double-booking prevented" pill  |

**No coral / cream / sand / gold / warm anything.** v2.5's earlier warm direction was rolled back; the codebase has no traces.

### 5.2 Typography

| Family              | Weight(s)          | Use                                                                     |
| ------------------- | ------------------ | ----------------------------------------------------------------------- |
| Author serif italic | 500                | Editorial italic-em phrases inside display headlines (always teal)      |
| General Sans        | 600                | Display headlines, card titles                                          |
| Satoshi             | 400, 500           | Body text                                                               |
| JetBrains Mono      | 500-600, uppercase | System labels: eyebrows, time labels, status pills, FAQ category labels |

### 5.3 Italic-em pattern — three coexisting variants

All three render serif italic teal but the application differs:

1. **Inline solid teal** (Hero, ClosingCTA): nested `<em><span>` markup — `<em class="not-italic"><span class="italic font-medium text-travelity-teal">…</span></em>`. Bespoke per consumer.
2. **Scoped solid teal** (SectionHeader): `:global(em)` rule inside SectionHeader's scoped style. Automatic for any consumer with `<em>` in the headline slot. Used by Channels, Features, GoLive, etc.
3. **Gradient text-fill** (ProductHero, PlanRec): blue→teal linear-gradient with `background-clip: text`. Applied via scoped `:global(em)` on the headline class. Richer treatment for Solutions/Audience pages.

The duality is intentional but unresolved. **Open: consolidation review** if a fourth variant emerges.

### 5.4 Spacing rhythm

- Page sections: `py-16 md:py-24` (most sections), `py-24` (heroes, big sections), `py-12 md:py-16` (subordinate/dense sections)
- Card padding: `p-6` (small), `p-7` (default — feature cards, plan cards), `p-9` or `p-7 md:p-9` (forms, plan-rec)
- Container: `container mx-auto px-6` plus a `max-w-*` constraint when the content is narrower than the page

### 5.5 Animation timings (locked)

| Component            | Animation                                | Duration / Easing                                                                               |
| -------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| BookingFlowCard      | 3-step + prevented pill choreography     | Step 1: 0.3s. Step 2: 1.4s. Prevented: 1.9s. Step 3: 2.5s. Total ~3s. cubic-bezier(0.4,0,0.2,1) |
| ChannelHub           | Pulse breath                             | 4s ease-in-out infinite (gentler — Phase 15 retune; was 3s)                                     |
| Card hover           | translateY-1 + shadow                    | 240ms cubic-bezier(0.4,0,0.2,1)                                                                 |
| FaqItem              | Plus → minus rotation                    | 200ms (CSS transition; native `<details>` for state)                                            |
| ParallaxBreak        | Scroll-driven translateY                 | rAF-driven, ±40px range                                                                         |
| Featured PricingPlan | Elevated translateY-3 + scale 1.02 (lg+) | Same as Card hover transition                                                                   |

---

## 6. Forms — one wired

### 6.1 Pattern (ContactForm only)

`ContactForm` is the lone React form island after Phase 16. Pattern:

- React Hook Form + zod, mode `onTouched`
- Schema in `contact-schema.ts` shared between the React island (client validation) and the Astro Action (server validation)
- 4-state machine: `idle | submitting | submitted | error`
- Submit button shows `Sending…` during the request
- Success swaps the form in-place for a success card (no redirect)
- Error renders an alert above the submit button
- Field errors render with red borders, `aria-invalid`, `aria-describedby`

### 6.2 Calendly — shipped (Phase 16)

`/book-demo` now uses `react-calendly`'s `<InlineWidget>` instead of a form. `CalendlyWidget.tsx` listens for the `event_scheduled` postMessage, POSTs the event + invitee URIs to a CRM sync endpoint (currently v1's `my.travelity.app/api/v1/cem/request-demo`), logs failures, then redirects to `/thank-you` unconditionally. The pre-Phase-16 BookDemoForm + bookDemoSchema + bookDemo Astro Action were deleted.

### 6.3 Real email service — pending

`contact` action handler currently `console.log`s and returns `{ ok: true }`. Real implementation routes by subject to `sales@/support@/partnerships@/hello@travelity.app`. No structural changes to the action; only the handler body.

---

## 7. Accessibility — established, audit pending

Patterns held throughout the build:

- All decorative SVGs marked `aria-hidden="true"`
- Form fields have `aria-invalid`, `aria-describedby` for errors, proper `<label htmlFor>` associations
- Skip-to-content link in `MarketingLayout` (Phase 0)
- Sticky nav has scroll-state class; mobile drawer toggles `aria-hidden`, `aria-expanded`, body scroll lock, has `role="dialog"` + `aria-modal="true"` (Phase 17)
- FAQ uses native `<details>` / `<summary>` (no JS hacks for keyboard interaction)
- All animations short-circuit under `prefers-reduced-motion: reduce`
- Color contrast: not formally audited yet — pre-launch task

---

## 8. Documentation — what's authoritative

**Authoritative for ongoing work:**

- This file (`PROJECT-STATE.md`) — current state and conventions
- `rules-astro.md` — coding rules (will be updated next; see [§10](#10-whats-next))
- `src/styles/global.css` — token source of truth
- `src/lib/utils/paths.ts` — URL source of truth
- `src/components/chrome/nav/nav-data.ts` — nav structure source of truth

**Reference but not authoritative (stale in places):**

- `HANDOFF-PROMPT.md` — was for the initial build; pre-Phase 0
- `component-inventory.md` — predicted components before they were built; reality diverged in places (e.g. AudienceHero was dropped; ProductHero handles both Solutions and Audience hero use)
- `home-page-structure.md` — accurate but only covers home; doesn't reflect post-home decisions
- `build-plan.md` — the original 11-phase plan; we executed it but with sub-phases (3a/3b/3c/3d, 6.5)
- `design-system.md` — visual language reference; matches the codebase
- `tech-stack.md` — stack reference; matches the codebase

**Reference HTMLs at `docs/references/`:**

- `travelity-home-v2_5.html` — canonical home-page reference (cool palette)
- `travelity-demo_3.html` — visual reference for the 11 product/audience pages

These are still useful for visual checks against what shipped.

---

## 9. Pre-launch checklist

What's left before the site can ship publicly. Engineering tasks are quick; content/legal are people-tasks.

### Must-haves (engineering)

- [ ] **Wire real email service** to the `contact` Astro Action. Resend / SendGrid / Postmark or CRM/ticketing. Subject routing (Sales→sales@, Support→support@, Partnership→partnerships@, Other→hello@).
- [ ] **Swap Calendly CRM-sync endpoint** in `CalendlyWidget.tsx` when v2 backend ships. TODO marker in code at the exact call site. May need CORS allowlist on the new endpoint for the deploy origin.
- [ ] **301 redirects** from old URLs: `/help` → `/help-center`, `/privacy` → `/legal/privacy`, `/terms` → `/legal/terms`, `/dpa` → `/legal/dpa`, `/cookies` → `/legal/cookies`. Only needed if external campaigns indexed the old paths.
- [ ] **Replace `[Address TBD]`** in `/contact` email strip with BraveCrew Inc.'s registered address.
- [ ] **Confirm role-based emails exist:** `sales@`, `support@`, `partnerships@`, `hello@`, `privacy@`, `dpo@`, `security@`, `legal@travelity.app`.

### Must-haves (content / legal)

- [ ] **Lawyer review of all 4 `/legal/*` pages.** AI-drafted boilerplate. Specific TBDs inline:
    - Privacy: DPO contact, EU representative, retention specifics
    - Terms: governing-law jurisdiction (twice in "Governing law" section)
    - DPA: subprocessor list URL (`/legal/subprocessors` doesn't exist yet)
    - Cookies: analytics provider name, cookie preferences UI
- [ ] **PO review of `/our-story` narrative.** AI-drafted; specifics about team, founding, customers, hiring/funding need to be true.
- [ ] **PO review of FAQ entries** on both `/pricing` (8 Q&As) and `/faq` (18 Q&As) — particularly refund policy, OTA commission, payment methods, data retention claims.
- [ ] **Replace `Plan feature one`** placeholder copy in `PricingPlan.astro`. Same for the 13-row placeholder in `/pricing`'s ComparisonTable.

### Should-haves (content)

- [ ] **Real product screenshots** for the 5 simpler Solutions pages. Drop assets in `/public/`, swap `[Screenshot: …]` placeholder divs in CapabilitySection visual slots.
- [ ] **Real travel photo** for HeroVisual. Component already takes `photoSrc` — pass when ready, MountainScene falls back automatically if unset.
- [x] **Real OTA logos** in ChannelDiagram — done in Phase 15. `GygLogo`, `ViatorLogo`, `KlookLogo` ship as Astro components under `src/components/decorative/ota-logos/`.
- [ ] **Real testimonials** in SocialProof. Currently 3 placeholder cards.
- [ ] **9 guide articles** for `/guides`. Currently all card hrefs are `#`.

### Nice-to-haves

- [ ] **Lighthouse audit + tuning.** LCP, CLS, font loading. Probably already healthy.
- [ ] **Real search on `/help-center`.** Currently visual-only. Pagefind (lightweight) or Algolia (powerful).
- [ ] **Analytics integration.** Cookies policy mentions "[analytics provider TBD]". Plausible / Fathom / GA4 — pick one and wire it.
- [ ] **Subprocessors page** at `/legal/subprocessors` referenced by DPA. Reuses LegalPageLayout, lists service providers.
- [ ] **Mobile menu polish** (Phase 2 carry-forward): animation timing, accordion item density, scrim, iOS scroll-position preservation.

---

## 10. Phase narratives (13–17)

Brief context for each post-build phase. Newer phases on top.

### Phase 17 — mobile drawer, tablet breakpoint, animated featured border

- **Mobile menu rebuilt as a slide-from-right drawer**. The previous slide-down panel rendered invisibly because `<nav>`'s `backdrop-filter: blur(14px)` was acting as a containing block for the drawer's `position: fixed` — trapping it inside the 68px nav. Fix: split into `MobileMenuTrigger.astro` (button stays inside `<nav>`) + `MobileMenu.astro` (drawer renders as a sibling of `<nav>` so fixed positioning escapes the containing block). Wired backdrop tap, X button, link-tap, and Escape to close. Backdrop scrim, body scroll lock, `role="dialog"` + `aria-modal="true"`.
- **Tablet shows desktop nav**. Breakpoint shifted `lg` (1024px) → `md` (768px) across Nav, NavSubRow, MobileMenuTrigger, MobileMenu. `--nav-height: 112px` rule now gated by `@media (min-width: 768px)` so mobile (where sub-row is `display:none`) keeps `--nav-height: 68px`.
- **Click on dropdown trigger is a no-op** (hover-only per product call). Keyboard Escape still closes.
- **Logo unified**: `LogoSmall` removed from `Nav` and `Footer`; full `Logo` works at all breakpoints.
- **`AnchorNav` deleted entirely**. Was Phase 5 component, only used on `/solutions/booking-engine`. Removed from page, component folder deleted, global.css comment updated.
- **Featured pricing card: animated conic-gradient border**. The static teal border + topAccent "hat" was reading as a floating brim. Replaced with `Card`'s `card-animated-border` class — card's own bg is the gradient, a 1.5px-inset `::before` pseudo paints a white interior, leaving a 1.5px gradient ring at edges. 10s linear spin via `@property` + keyframes; halts under prefers-reduced-motion. Two earlier approaches (`background-clip: border-box` and `pseudo-behind-with-z-index:-1`) failed due to Tailwind v4 cascade and CSS painting-order spec respectively — final approach documented in `Card.astro` source.

### Phase 16 — Calendly integration on `/book-demo`

- BookDemoForm + book-demo Astro Action + `bookDemoSchema` all deleted. Replaced with `react-calendly`'s `<InlineWidget>` in `CalendlyWidget.tsx` (React island under `src/components/book-demo/`). Iframe height 1050px to fit the time-slot view without internal scroll.
- `event_scheduled` handler POSTs the event + invitee URIs to v1's CRM endpoint (`my.travelity.app/api/v1/cem/request-demo`), logs failures (not swallowed like v1), then redirects to `/thank-you` unconditionally so a backend hiccup doesn't break the user flow.
- `PUBLIC_CALENDLY_URL` env var with v1's themed URL as fallback. Documented in `.env.example`.
- **Hero re-laid out two-column**: text + centered "Pick a time" button on the left, `BookDemoVideo` (YouTube walkthrough, nocookie + lazy + aspect-video) on the right. Added `ctasAlign` prop to `ProductHero` so the button centers in its column without affecting other consumers.
- `scroll-behavior: smooth` added to `html` in `global.css`. `#schedule` section gets `scroll-mt-[var(--nav-height)]` so the anchor jump lands under the sticky nav.
- Two TODOs preserved in code: swap CRM sync endpoint for v2 backend; fire Google Ads conversion when GTM is wired.

### Phase 15 — channels diagram orbit redesign

- Home-page "All-in-one channel management" section's left visual swapped from rows-of-cards-converging-on-hub to an **orbit**: Travelity hub in the center (with "ONE PLATFORM" label and gentle 4s breath pulse), Back-office and Widget cards on the left, GYG/Viator/Klook OTA badges on the right at asymmetric distances (Viator pushed farthest).
- Connector lines reworked: static dashed guide line + animated dashed pulses flowing inward, ~3-4 pulses visible per line at any moment. Each line tinted in its source's brand color (GYG `#FF5533`, Viator `#028768`, Klook `#FF5B01` — partner brand hex literals, documented exempt context). SVG `<filter>` + `feGaussianBlur` for glow halos (more reliable than CSS `filter: drop-shadow` on thin strokes).
- OTA logos moved from `src/icons/` (where the user dropped them initially) to `src/components/decorative/ota-logos/` as small `.astro` wrappers — fits the project's "lucide-only barrel + bespoke SVGs in decorative" rule.
- ChannelsSection grid widened `0.9fr_1.1fr` → `1fr_1fr` to give the orbit room.

### Phase 14 — desktop nav redesign

Hover-dropdown popovers replaced with a **pinned sub-row** pattern.

- **Pinned secondary row** (44px, sticky `top: 68px` directly under the main nav). On `/solutions/*` and `/our-story|/faq|/guides|/help-center`, the row is present in SSR HTML and shows the section's child links as horizontal underline-tabs. Active child has a 2px teal `border-bottom` and `aria-current="page"`.
- **Active nav indicator** in the top row: the parent section renders `text-travelity-teal`. Flat top-level links (Pricing) also render teal when on their own page.
- **Hover-swap behavior**: hovering a different top-level trigger swaps the visible panel in the sub-row via instant `display:none/flex` (the original cross-fade was dropped — it caused content overlap during transition). 100ms open intent + 120ms close delay. On pages with no pinned section, hovering slides the sub-row down via `max-height` transition (0 → 44px, 220ms) on the sub-row itself.
- **Layout/sticky**: sub-row owns `overflow-hidden` + `max-height` directly (an ancestor with `overflow:hidden` would have killed `position: sticky`).
- **`--nav-height` CSS variable**: 68px default, 112px under `:root:has([data-nav-root][data-has-subnav])`. Phase 17 added the `@media (min-width: 768px)` gate.
- New files: `NavSubRow.astro`, `nav-active.ts`. Deleted: `NavDropdown.astro`, `NavDropdownItem.astro`. Type rename: `NavDropdownItemData` → `NavSubItemData`.

### Phase 13 — brand / logo swap

Logo system reworked. Phase 13 also bundled a Phase 12 audit ride-along (see commit `e5bda15`).

## 11. What's next

The remaining engineering pass:

1. Verify clean code passes: lint, format, type-check, build, no dead code, no unused exports, no orphaned imports, no `console.log` outside Astro Actions.
2. Wire real email/CRM destinations (see §9).
3. Anything else (real content, real photos) is content/operations work — see §9.

---

## 12. How to use this file

**At session start:**

1. Read this file top-to-bottom.
2. Scan §3 (component layout) and §4 (conventions) for anything that's changed since the last session.
3. If a section is missing or outdated, that's a docs issue worth flagging — don't work around it.

**Before writing or editing code:**

1. Confirm the change fits the conventions in §4. If it doesn't, that's a discussion to have, not a deviation to ship.
2. If the change touches forms, check §6 for the established pattern.
3. If the change touches tokens or palette, check §5 for the established palette.

**At session end (if changes shipped):**

1. Update §2 (site shape) if any pages were added/removed/renamed.
2. Update §4 (conventions) if any new rules emerged.
3. Update §9 (pre-launch checklist) if any items were completed.

**This file is not a substitute for `rules-astro.md`** — that file is the authoritative coding ruleset. This file is the project's _state_ and _narrative_. Both should align; if they conflict, fix the conflict.
