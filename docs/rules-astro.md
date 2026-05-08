# Travelity Marketing Website — Project Rules

> Read this before writing any code. **Authoritative as of end of Phase 11 + Phase 12 audit.** PROJECT-STATE.md (in `docs/`) is the companion: it describes _what_ was built, this file describes the _rules_ for building.

---

## 0. Hierarchy of authority

When sources disagree, follow this order:

1. **This file** (`docs/rules-astro.md`) — what to do when writing code
2. **`docs/PROJECT-STATE.md`** — what the codebase looks like right now
3. **The codebase itself** — when docs and code disagree, code wins and docs get updated in the same change
4. **`docs/references/travelity-home-v2_5.html` and `index.html`** — visual references for spacing, animation timings, and copy

There is no fifth layer. Don't invent one.

---

## 1. Stack — locked

| Layer       | Choice                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| Framework   | Astro 6 (file-based routing, prerender-by-default with hybrid mode for Actions)                                   |
| Adapter     | `@astrojs/node` (mode: `standalone`). Swap-friendly to Vercel/Netlify/Cloudflare.                                 |
| Styling     | Tailwind v4 (CSS-first via `@theme` in `src/styles/global.css`). **No `tailwind.config.js`.**                     |
| Type system | TypeScript 5.x strict                                                                                             |
| Islands     | React 19 — only when state is genuinely needed (currently 2 forms)                                                |
| Forms       | React Hook Form + zod 4 (shared schemas with server-side Astro Actions)                                           |
| Icons       | `@lucide/astro` (Astro components) and `lucide-react` (React islands). Same icon set, different runtime bindings. |
| Node        | 22+                                                                                                               |

**What is NOT used.** TanStack Query. React Router. Axios. Redux/Zustand/Jotai. CSS-in-JS. Astro Content Collections (the legal/marketing content lives directly in `.astro` pages — Phase 9 chose this over a CC abstraction). shadcn/ui (Phase 0 considered, dropped — primitives we needed were small enough to hand-write).

If you need to reach for one of those, stop and ask. The discipline of refusing them shaped most of the rest of the codebase.

---

## 2. Folder & file conventions

### 2.1 Top-level layout

```
src/
├── actions/index.ts           # Astro Actions (currently bookDemo, contact)
├── components/
│   ├── chrome/                # site-wide chrome (Nav, Footer, MobileMenu)
│   │   ├── nav/
│   │   └── footer/
│   ├── home/                  # home-page sections only
│   │   ├── hero/
│   │   ├── channels-section/
│   │   ├── features-section/
│   │   ├── parallax-break/
│   │   ├── pricing-section/
│   │   ├── golive-section/
│   │   └── closing-cta-section/
│   ├── shared/                # cross-page composable components
│   │   ├── product-hero/      # shared by Solutions and Audience pages
│   │   ├── capability-section/
│   │   ├── cross-sell/
│   │   ├── social-proof/
│   │   ├── pain-grid/         # audience-specific
│   │   ├── solution-map/
│   │   ├── feature-pillars/
│   │   ├── workflow/
│   │   ├── plan-rec/
│   │   ├── anchor-nav/
│   │   ├── coverage-list/
│   │   ├── comparison-table/
│   │   ├── faq-accordion/
│   │   ├── legal-page-layout/
│   │   ├── guide-card/
│   │   └── help-tile/
│   ├── ui/                    # atoms (Button, Eyebrow, Tag, Card, etc.)
│   ├── decorative/            # pure-SVG / illustration (MountainScene, ParallaxScene, TravelityMark)
│   └── forms/                 # React form islands
│       ├── book-demo/
│       └── contact/
├── icons/index.ts             # the icon barrel (single source of truth)
├── layouts/MarketingLayout.astro
├── lib/utils/                 # cn(), Paths, externalAttrs
├── pages/                     # file-based routes
│   ├── _internal/             # underscore prefix → excluded from build
│   ├── audiences/
│   ├── solutions/
│   └── legal/
└── styles/global.css          # @theme tokens + base resets + global utilities
```

### 2.2 Naming

- **PascalCase** for `.astro` and `.tsx` component files.
- **kebab-case** for folders.
- **`index.ts` barrel per folder** — re-exports the components that should be public consumers of that folder.
- **Path alias `@/`** maps to `src/`. No relative `../../` imports across folder boundaries; sibling-only imports (`./Foo.astro`) are fine.

### 2.3 Subfolder suffix conventions

- `home/<name>-section/` — page sections of the home page (e.g. `pricing-section/`).
- `shared/<bare-name>/` — cross-page components (e.g. `product-hero/`).
- `ui/<bare-name>/` — atoms (e.g. `button/`).

### 2.4 Barrel imports

Components consuming a folder import from the folder's `index.ts` barrel, **not** from individual files inside. Two documented exceptions:

1. **React islands** inside `pages/*.astro` (`import BookDemoForm from '@/components/forms/book-demo/BookDemoForm';`). Astro hydrates the file path directly; the barrel doesn't help here.
2. **Type-only imports** from a sibling folder may go directly to the file when the type doesn't have a stable name in the barrel.

---

## 3. Component API rules

### 3.1 Variant API (`HTMLAttributes`)

Every `.astro` component that renders a single root element takes a `Props` interface that extends `HTMLAttributes<'TAG'>`. Spread `{...rest}` onto the root.

```tsx
---
import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'astro/types';

export interface Props extends HTMLAttributes<'div'> {
    variant?: 'default' | 'featured';
    class?: string;
}

const { variant = 'default', class: className, ...rest } = Astro.props;
---

<div class={cn('base-classes', className)} {...rest}>
    <slot />
</div>
```

**Exception:** internal "data-shaped" components — those that compose other components from a structured prop, rather than rendering a single root with arbitrary HTML attributes — do not need `HTMLAttributes`. Audit found 4 in this category: `LegalPageLayout`, `FooterColumn`, `NavLink`, `NavDropdown`. They take typed shape props (e.g. `{ items: TocItem[] }`) and render structured output. Adding `HTMLAttributes` to them would be surface area without consumers.

### 3.2 Class merging

When a component accepts a `class` prop, **always** merge through `cn()` from `@/lib/utils/cn` so consumer-supplied utilities can override defaults via `tailwind-merge`.

```tsx
// CORRECT
<div class={cn('p-4 bg-paper', className)} {...rest}>

// WRONG — consumer's `class="bg-surface-alt"` won't override
<div class={`p-4 bg-paper ${className ?? ''}`} {...rest}>
```

### 3.3 Slot conventions

Standard slot names used across the codebase:

- `headline` — h1/h2 content with possible `<em>` italic-em (see §6.3)
- `dek` — the descriptive paragraph below a headline
- `aside` — right-column secondary content (used by ProductHero)
- `ctas` — slot the consumer fills with `<Button>` instances; if omitted, the host component may render defaults
- `icon` — a single icon component, used inside any tile/card with an icon block
- `visual` — a screenshot/illustration slot, used by CapabilitySection

Components with non-standard slot names should comment them in the `Props` interface.

### 3.4 Defaults via destructuring

Defaults go in the destructure, not in the JSX:

```tsx
const { variant = 'default', size = 'md', class: className } = Astro.props;
```

Not `{variant ?? 'default'}` inside the markup. Defaults declared once.

---

## 4. Token & color rules

### 4.1 No hex codes in components

No `#abcdef` literals inside `src/components/` or `src/pages/`. All color references go through:

- Tailwind utilities mapped to `@theme` tokens (`bg-paper`, `text-ink-muted`, `border-line`, `text-travelity-teal`)
- Direct `hsl(var(--token))` references for arbitrary alpha (`hsl(var(--travelity-teal) / 0.18)`)

**Exempted contexts** (these are documented carve-outs, not violations):

1. **Decorative SVG paths** in `src/components/decorative/` — `MountainScene`, `ParallaxScene`, `TravelityMark` use bespoke landscape `hsl()` literals (mountain ridge tones, gradient stops). They aren't reused, aren't part of the brand system, and would clutter `@theme` to extract.
2. **DRAFT/TODO banners** in `LegalPageLayout` and `our-story.astro` — the amber warning palette `hsl(38 92% …)` is intentionally outside the brand system. Warning colors should not be teal/blue.

If you find yourself wanting a third exemption, the answer is probably "extract a token to `@theme`."

### 4.2 Color-name purity (cool palette only)

A previous design iteration had warm-direction tokens (`coral`, `cream`, `sand`, `gold`, `line-warm`). They are **not** in this codebase. The cool palette is the only palette.

When transcribing CSS from the v2.5 reference HTML or any other source that uses the warm names:

| Reference (warm)    | Codebase (cool)                                      |
| ------------------- | ---------------------------------------------------- |
| `--travelity-coral` | `--travelity-teal`                                   |
| `--travelity-cream` | `--paper`                                            |
| `--travelity-sand`  | `--surface-alt`                                      |
| `--travelity-gold`  | `--ink-soft` (text) — flag if used as a brand accent |
| `--line-warm`       | `--line`                                             |

A grep for `coral|cream|sand|gold|line-warm` in `src/components/`, `src/pages/`, `src/styles/` should return zero matches. If one slips through (including in comments or doc strings), translate it.

### 4.3 Tokens that exist

These are defined in `src/styles/global.css` as raw HSL triplets in `:root` and exposed as Tailwind utilities via `@theme`:

| Token                                       | Tailwind utility prefix                               | Notes              |
| ------------------------------------------- | ----------------------------------------------------- | ------------------ |
| `--travelity-blue` / `-deep`                | `text-travelity-blue` / `bg-travelity-blue-deep` etc. | brand primary      |
| `--travelity-teal` / `-deep`                | `text-travelity-teal` etc.                            | brand secondary    |
| `--paper` / `--surface`                     | `bg-paper`                                            | white surface      |
| `--surface-alt`                             | `bg-surface-alt`                                      | light gray surface |
| `--ink` / `--ink-muted` / `--ink-soft`      | `text-ink` etc.                                       | text on light      |
| `--line`                                    | `border-line`                                         | hairline borders   |
| `--success` / `--warning` / `--destructive` | `text-success` etc.                                   | semantic           |

If a component needs a color that isn't here, either it's wrong (use the existing palette) or the token system needs to grow. Decide before coding.

---

## 5. Icon rules

### 5.1 Barrel-only for `.astro`

Every `.astro` import goes through `@/icons`. **Never** `from '@lucide/astro'` directly inside a component or page. The barrel is the single source of truth and the swap point if we ever change icon libraries.

```tsx
// CORRECT
import { CheckIcon, ArrowRightIcon } from '@/icons';

// WRONG
import { Check } from '@lucide/astro';
```

Every export from `src/icons/index.ts` ends in `Icon`: `LockIcon`, not `Lock`.

### 5.2 Direct imports for `.tsx`

React islands import from `lucide-react` directly. The Astro barrel is Astro-only — the bindings differ between the two packages. The icon-barrel rule does not apply to `.tsx` files.

```tsx
// CORRECT in a .tsx file
import { CheckCircle2, Mail } from 'lucide-react';
```

### 5.3 Lucide deprecation aliasing

When lucide deprecates an icon name, alias the canonical name to the consumer-facing name in the barrel. Consumers don't change. Instances in this codebase:

- `XCircle` → `CircleX as XCircleIcon` (Phase 3a)
- `BarChart3` → `ChartColumn as BarChartIcon` (Phase 5)
- `HelpCircle` → `CircleQuestionMark as HelpCircleIcon` (Phase 10)

### 5.4 Lazy add only

Add icons to the barrel only when a consumer actually imports them. Speculative bulk additions become dead exports (Phase 5 added 6 that ended up unused — see AUDIT-REPORT.md §1.5).

---

## 6. Visual & content patterns

### 6.1 Animation rules

Every animated component (transforms, scales, keyframe animations, hover lifts) carries a `@media (prefers-reduced-motion: reduce)` block that short-circuits the animation:

```css
@media (prefers-reduced-motion: reduce) {
    .animated-thing {
        animation: none !important;
        transition: none !important;
        transform: none !important;
    }
}
```

**Carve-out:** components with only `transition-colors` (color-only hover/focus, no transforms, no scale, no continuous animations) do **not** require the override. Color shifts at 150ms are imperceptible-to-uneventful for users with motion sensitivity. Transforms, scale, opacity-with-translate, and keyframe animations always require the override.

The `nav.client.ts` rAF loop (sticky nav border + parallax photo) checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` per frame to skip the parallax block.

### 6.2 nav.client.ts is the home for behavior

All cross-cutting client-side behavior lives in `src/components/chrome/nav/nav.client.ts`:

- Sticky nav border (scroll threshold)
- Hover-intent dropdown open delay (100ms) + close delay (120ms)
- Mobile menu toggle + body scroll lock
- Mobile accordion section expand/collapse
- Parallax photo translateY (added Phase 3c)

Don't add a second client script that duplicates the rAF loop. Add to this one.

`anchor-nav.client.ts` is a separate file because it uses `IntersectionObserver` (different mechanism, different scope — single-page anchor scroll-spy).

### 6.3 Italic-em — three documented patterns

The italic-em phrase is the project's editorial signature. Three coexisting patterns, do not invent a fourth:

1. **Inline italic-span** — used in Hero, ClosingCTASection, our-story, and the Pricing/Help-Center hero strips. The `<em>` is `not-italic` (semantic only); a nested `<span class="italic font-medium text-travelity-teal">` carries the styling.

    ```astro
    <em class="not-italic">
        <span class="italic font-medium text-travelity-teal"
            >without the spreadsheets.</span
        >
    </em>
    ```

2. **SectionHeader scoped `:global(em)`** — used wherever a `SectionHeader` consumes an `<em>` inside the headline slot. The styling lives once in `SectionHeader.astro`'s scoped `<style>` block and reaches every consumer's `<em>`.

3. **ProductHero / PlanRec gradient text-fill** — used on Solutions, Audience, and PlanRec headlines. `<em>` styled via `:global(em)` inside the parent's scoped `<style>`, with a teal-to-blue `linear-gradient` clipped to text. Distinct from the solid-teal pattern; reserved for product-page headlines that want a richer feel.

### 6.4 Animation timings (locked)

Don't tune these without a deliberate decision; they were calibrated against the v2.5 reference:

- **BookingFlowCard** (Hero): 3-step animation, ~3s total runtime. Step-in 0.5s with delays at 0.3s/1.4s/2.5s. Icon pop 0.4s with delays at 0.4s/1.5s/2.6s. Prevented pill 0.4s at 1.9s.
- **ChannelHub** pulse: 3s ease-in-out infinite.
- **Card hover** (interactive): -4px translateY, 240ms.
- **Nav dropdown**: 100ms open intent / 120ms close delay.

---

## 7. Form rules

### 7.1 Architecture

React island + zod schema + Astro Action. The schema is shared between client validation and server input parsing — single source of truth.

Don't extract a "shared form primitives" abstraction. Two consumers (`BookDemoForm`, `ContactForm`) don't justify it. Three would.

### 7.2 State machine

Form state is one of: `idle | submitting | submitted | error`. On success the form is replaced **in-place** by a success card (no redirect). On error, an alert banner appears above the submit button and the form stays mounted with submitted values preserved.

### 7.3 Validation

- `react-hook-form` with `zodResolver`
- `mode: 'onTouched'` — fields validate on blur, then on every keystroke after first touch
- Field-level errors render as red text below the field with `aria-describedby` linkage and `aria-invalid` on the input

### 7.4 zod 4 conventions

Two pre-zod-4 patterns are deprecated; use the new forms:

```ts
// CORRECT (zod 4)
email: z.email('Please enter a valid email address.').trim();
subject: z.enum(SUBJECTS, { message: 'Pick the closest match.' });

// WRONG (zod 3 / deprecated in 4)
email: z.string().trim().email('…');
subject: z.enum(SUBJECTS, { errorMap: () => ({ message: '…' }) });
```

### 7.5 Astro Actions

All actions live in `src/actions/index.ts` on a single `server` object. Each uses `defineAction({ accept: 'json', input: zodSchema, handler })`. Don't split actions across multiple files — there's one consumer (`astro:actions`) and the bundle re-exports based on this file's exports.

The current handlers `console.log` + simulate latency. Real email/CRM destinations are a pre-launch swap (PROJECT-STATE.md §9).

---

## 8. Routing & path rules

### 8.1 Paths constants

All internal URLs go through `src/lib/utils/paths.ts`. No hardcoded URL strings (`<a href="/pricing">`) anywhere outside this file. When a route is renamed or restructured, this is the only file that changes.

### 8.2 Page prerender

Every real page declares `export const prerender = true;` in its frontmatter. Astro 6 prerenders by default, but the explicit declaration is self-documenting and surfaces the intent at the page boundary. **Exception:** `_internal/*` pages are excluded from the route table by the underscore prefix; declaring `prerender` there would be misleading.

### 8.3 External link convention

Use `externalAttrs(external)` from `@/lib/utils/external-attrs` whenever a link may open in a new tab. It returns `{}` or `{ target: '_blank', rel: 'noopener noreferrer' }`. Three consumers: `Button`, `LinkInline`, `FooterColumn`.

The single external URL in the codebase right now: `Paths.STATUS = 'https://status.travelity.app'`.

---

## 9. Placeholder & TODO conventions

Every piece of placeholder content carries an unmistakable marker so a launch reviewer can't miss what's pending:

| Placeholder kind       | Marker                                        | Where                                |
| ---------------------- | --------------------------------------------- | ------------------------------------ |
| Plan feature labels    | `Plan feature one`, `Plus feature two`, etc.  | `PricingSection`, `ComparisonTable`  |
| Screenshot slots       | `[Screenshot: brief description]`             | Solutions pages × ~21 slots          |
| Future article URLs    | `href="#"`                                    | `guides.astro`                       |
| Avatar fallbacks       | gradient circle (no `avatarSrc`)              | `TestimonialCard`                    |
| OTA logos              | `[GYG logo]`, `[Viator logo]`, `[Klook logo]` | `ChannelDiagram`                     |
| Legal/AI-drafted prose | amber DRAFT banner                            | `LegalPageLayout`, `our-story.astro` |
| Address                | `[Address TBD before launch]`                 | `contact.astro`                      |

### TODO comments

Source-level `// TODO:` markers are tied to specific known follow-ups. Current alive markers (audit-confirmed):

- `// TODO: split when signup page exists` — near every `Paths.BOOK_DEMO` CTA that should eventually route to a different secondary destination (e.g. `Start Free Trial`, `View live demo`, `Download whitepaper`).
- `// TODO: replace placeholder feature copy with real plan details before launch` — `pricing.astro`, `PricingSection.astro`.
- `// TODO: replace # hrefs with real guide article URLs as they're written` — `guides.astro`.

When you address a TODO, remove the comment in the same change. Orphaned TODOs lie.

---

## 10. Established patterns to preserve

These patterns shaped multiple phases. Don't deviate without a decision:

1. **Card composition over inheritance.** `Card` is unopinionated about padding; consumers (`PricingPlan`, `FeatureCard`) bring their own `p-7`. `Card.featured + topAccent` adds a top gradient bar; `interactive` adds hover-lift. New "card-like" patterns extend Card via composition, not by adding variants to Card.

2. **ClosingCTASection reuse.** Most marketing pages end with `<ClosingCTASection />` with default copy. The Phase 6.5 override surface (`eyebrow`, `description`, `primaryCtaLabel/Href`, `secondaryCtaLabel/Href`, named `headline` slot) is available but unused — pages can opt in when per-page tone is needed.

3. **AnchorNav for in-page nav.** Sticky in-page nav is `AnchorNav` (Phase 5), an `IntersectionObserver` scroll-spy at `top: 68px` (under the main Nav). One consumer right now: `/solutions/booking-engine`. Add to other long pages (e.g. a future `/solutions/booking-engine/api-docs`) by passing `items={[{id, label}, …]}` matching `<section id="...">` in the page body.

4. **PlanRec primary CTA → `/pricing`** (not `/book-demo`). Audience pages route their PlanRec to pricing because it's the next discovery step. Demo bookings happen via the explicit demo CTAs.

5. **Decorative SVG conventions.** Bespoke `hsl()` values are fine inside `src/components/decorative/`. The wrapper `<div>` is `aria-hidden="true"`. SVG root has `viewBox` and `preserveAspectRatio` matched to the layout shape.

6. **The home and Nav consume a single `nav-data.ts`.** Updating the desktop nav also updates the mobile menu. Add new top-level links by editing the array, not by editing `Nav.astro` markup.

---

## 11. No improvising

If a brief doesn't specify a variant, behavior, or copy, **don't add it**. Variants emerge from real consumer needs, not speculation. Three concrete instances of this discipline:

- **AudienceHero** (planned for Phase 4) was dropped when `ProductHero` proved sufficient for both Solutions and Audience pages with content variation alone.
- **WorkflowIcon** (added speculatively in Phase 6 batch) was removed in Phase 6.5 as dead code.
- **Shared form primitives** (deferred since Phase 11) — two form consumers don't justify abstraction; three would.

Phase 5's Solutions-icons batch was the visible counter-example: 10 icons added, 6 ended up unused (see AUDIT-REPORT.md §1.5). The lesson: **lazy add only**.

---

## 12. Open questions and known asymmetries

These are deliberately deferred. Don't "fix" them as cleanups; they're recorded in PROJECT-STATE.md §10 so future work has context. Selected highlights:

- **Mobile menu animation timing** (200ms slide / 240ms accordion) may need tuning behind real home content. Carry-forward from Phase 2.
- **iOS scroll-position preservation** when the mobile menu opens (`body.overflow = 'hidden'` doesn't preserve scroll position on iOS).
- **`HeroVisual.photoSrc`** is the swap-point for a real travel photo; ships with a `MountainScene` SVG mock.
- **OTA placeholder boxes** (`[GYG logo]`, etc.) ready for real-logo swap.
- **Calendly alternative.** The brief locked "form-based, not Calendly" but kept the Calendly swap in mind. `BookDemoForm` could be swapped for a Calendly embed component without touching the page or action.
- **Real email/CRM destination** for both Astro Actions. Schema and contract don't change — only the handler body.

---

## 13. When in doubt

1. Read **PROJECT-STATE.md** to understand what already exists.
2. Read the **codebase** to confirm.
3. If the rule isn't here and the answer isn't obvious from §1–§12, ask the user.

The codebase is the source of truth. This file and PROJECT-STATE.md should describe it accurately at any given moment; if they don't, fix the docs in the same change as the code.
