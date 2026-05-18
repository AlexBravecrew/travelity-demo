# Travelity Marketing Website — Project Rules

> Read this before writing any code. **Authoritative through Phase 27.** PROJECT-STATE.md (in `docs/`) is the companion: it describes _what_ was built, this file describes the _rules_ for building.

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
| Islands     | **None.** React removed in Phase 25. No `.tsx`, no `client:*`. Interactivity ships as Astro-bundled `<script>`s. |
| Forms       | Native Astro markup + a bundled client script. Contact form POSTs directly to `api.travelity.app/api/v1/public/contact` (Phase 24); no Astro Actions, no React (Phase 25). |
| Icons       | `@lucide/astro` only, consumed via the `@/icons` barrel. (`lucide-react` removed in Phase 25.) |
| Analytics   | GA4 + Google Ads via `gtag.js` running inside a Web Worker via `@astrojs/partytown` (Phase 23). CookieYes is the certified CMP for IAB TCF + banner UI; Consent Mode v2 gates everything default-denied. See PROJECT-STATE.md §4.11. |
| Live chat   | Intercom messenger, ported from v1 (Phase 27). Anonymous visitor, consent-gated inline `<script>` — boots on CookieYes `functional` consent. See PROJECT-STATE.md §4.12. |
| Node        | 22+                                                                                                               |

**What is NOT used.** **React** (and React Hook Form, zod — all removed Phase 25 when the lone island went native). TanStack Query. React Router. Axios. Redux/Zustand/Jotai. CSS-in-JS. Astro Content Collections (the legal/marketing content lives directly in `.astro` pages — Phase 9 chose this over a CC abstraction). shadcn/ui (Phase 0 considered, dropped — primitives we needed were small enough to hand-write). **`react-calendly`** (post-Phase-18 — its `<InlineWidget>` couldn't pass `resize: true`; the team-selection dropdown clipped; we switched to Calendly's official simple inline embed pattern with widget.js auto-discovery, matching v1's working setup).

If you need to reach for one of those, stop and ask. The discipline of refusing them shaped most of the rest of the codebase.

---

## 2. Folder & file conventions

### 2.1 Top-level layout

```
src/
├── components/
│   ├── book-demo/             # /book-demo page-specific (conversion-wired Phase 23)
│   │   └── CalendlyWidget.astro  # native v1 inline embed at 700px; postMessage → gtag conversion + /thank-you
│   ├── chrome/                # site-wide chrome
│   │   ├── nav/               # Nav + NavLink + NavSubRow + MobileMenuTrigger + MobileMenu
│   │   ├── analytics/         # Phase 23 — GA4 + Google Ads via Partytown + CookieYes + Consent Mode v2
│   │   ├── intercom/          # Phase 27 — consent-gated Intercom live chat
│   │   └── footer/            # 3-col [2fr_2fr_3fr]: brand+socials / Get-in-touch (plain-text contact, non-clickable) / nested Company+Resources
│   ├── home/                  # home-page sections only
│   │   ├── hero/              # Hero only (post-Phase-18 — HeroVisual / BookingFlowCard / AudienceChips deleted)
│   │   ├── channels-section/
│   │   ├── features-section/  # FeatureCard requires href; renders slice(0, 6) of 9 (Phase 19)
│   │   ├── parallax-break/
│   │   ├── pricing-section/   # Phase 21 hover-swap active card (CSS-only via :has()); excluded-feature icon = red X (Phase 23)
│   │   ├── golive-section/
│   │   └── closing-cta-section/  # primaryCtaExternal / secondaryCtaExternal props (Phase 19)
│   ├── shared/                # cross-page composable components
│   │   ├── capability-section/   # used on /features (was on /solutions through Phase 22; superseded by OutcomeCard there)
│   │   ├── coverage-list/
│   │   ├── comparison-table/  # Phase 23 — excluded cells now red X
│   │   ├── faq-accordion/
│   │   ├── legal-page-layout/
│   │   └── structured-data/   # Phase 26 — JSON-LD <script> emitter
│   │   # NOTE Phase 18: pain-grid, solution-map, feature-pillars, workflow,
│   │   # plan-rec deleted with the audience cluster.
│   │   # NOTE Phase 22: product-hero, cross-sell, social-proof deleted with
│   │   # the Solutions cluster.
│   ├── ui/                    # atoms (Button, Eyebrow, Tag, Card, etc.)
│   ├── decorative/            # bespoke SVG (mountain-scene deleted Phase 18 — only ota-logos/ now)
│   │   └── ota-logos/
│   ├── solutions/             # /solutions page-specific
│   │   └── outcome-card/      # screenshot-top peer tile, 3-up grid on /solutions
│   └── contact/               # /contact page-specific — native form (Phase 25, ex-React)
│       ├── ContactForm.astro      # markup + Turnstile loader + <script>
│       ├── ContactSuccess.astro   # success card, JS-revealed on 204
│       └── contact.client.ts      # validation + fetch submit
├── icons/index.ts             # the icon barrel (single source of truth)
├── layouts/MarketingLayout.astro  # <head>: <Analytics />, canonical/OG, Organization JSON-LD
├── lib/utils/                 # cn(), Paths, externalAttrs
├── pages/                     # file-based routes
│   ├── _internal/             # underscore prefix → excluded from build
│   ├── features.astro         # Phase 19 — 9 anchored CapabilitySections
│   ├── solutions.astro        # 6 OutcomeCards in a 3-up grid; replaces retired Phase-22 six-page cluster
│   └── legal/
│   # NOTE Phase 18: audiences/ subfolder deleted (4 pages retired).
│   # NOTE Phase 22: solutions/ subfolder deleted (6 pages retired); solutions.astro added.
├── public/
│   ├── features/              # placeholder.svg + future per-section screenshots
│   ├── solutions/             # placeholder.svg + future per-section screenshots
│   └── robots.txt             # Phase 26 — allow-all + sitemap reference
└── styles/global.css          # @theme tokens + container @utility (1280px) + --nav-height + smooth-scroll
```

### 2.2 Naming

- **PascalCase** for `.astro` component files.
- **kebab-case** for folders.
- **`index.ts` barrel per folder** — re-exports the components that should be public consumers of that folder.
- **Path alias `@/`** maps to `src/`. No relative `../../` imports across folder boundaries; sibling-only imports (`./Foo.astro`) are fine.

### 2.3 Subfolder suffix conventions

- `home/<name>-section/` — page sections of the home page (e.g. `pricing-section/`).
- `shared/<bare-name>/` — cross-page components (e.g. `capability-section/`).
- `ui/<bare-name>/` — atoms (e.g. `button/`).

### 2.4 Barrel imports

Components consuming a folder import from the folder's `index.ts` barrel, **not** from individual files inside. One documented exception:

1. **Type-only imports** from a sibling folder may go directly to the file when the type doesn't have a stable name in the barrel.

(The former React-island exception was retired in Phase 25 — no `.tsx`, no hydrated imports remain.)

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

**Exception:** internal "data-shaped" components — those that compose other components from a structured prop, rather than rendering a single root with arbitrary HTML attributes — do not need `HTMLAttributes`. Currently 3 in this category: `LegalPageLayout`, `FooterColumn`, `NavLink`. (Audit originally listed `NavDropdown` — deleted in Phase 14 when the dropdown pattern was replaced with the sub-row.) They take typed shape props (e.g. `{ items: TocItem[] }`) and render structured output. Adding `HTMLAttributes` to them would be surface area without consumers.

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
- `aside` — right-column secondary content. (Historically used by `ProductHero` which was retired in Phase 22 — slot name still available if a future component needs the convention.)
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

### 4.4 Native Tailwind sizing — prefer over arbitrary-value brackets

Use Tailwind's native scale utilities (`text-lg`, `w-3.5`, `gap-6`, `mt-9`) by default. Reach for arbitrary-value brackets (`text-[18px]`, `w-[14px]`, `gap-[72px]`) only when the value genuinely can't be expressed on the native scale.

**Tailwind v4's dynamic spacing scale** accepts any integer for spacing utilities (`p-N`, `m-N`, `w-N`, `h-N`, `min-h-N`, `max-w-N`, `gap-N`) — the integer multiplied by 0.25rem (4px). So `min-h-[540px]` → `min-h-135` (135 × 4 = 540), `gap-[72px]` → `gap-18`. If your pixel value is a clean multiple of 4, the native utility exists.

Common substitutions when writing new code:

| Avoid          | Prefer    | Why                                    |
| -------------- | --------- | -------------------------------------- |
| `text-[14px]`  | `text-sm` | Tailwind `text-sm` = 14px              |
| `text-[18px]`  | `text-lg` | Tailwind `text-lg` = 18px              |
| `text-[20px]`  | `text-xl` | Tailwind `text-xl` = 20px              |
| `text-[24px]`  | `text-2xl`| Tailwind `text-2xl` = 24px             |
| `w-[14px]`     | `w-3.5`   | Tailwind `w-3.5` = 14px                |
| `gap-[24px]`   | `gap-6`   | Tailwind `gap-6` = 24px                |
| `gap-[72px]`   | `gap-18`  | Tailwind `gap-18` = 72px               |
| `p-[28px]`     | `p-7`     | Tailwind `p-7` = 28px                  |

Legitimate uses of bracket-arbitrary values (keep these as-is):

- **Character-unit constraints** for readability: `max-w-[52ch]`, `max-w-[13ch]`.
- **Off-scale design values** that don't land on Tailwind's 4px step: `text-[22px]`, `min-h-[540px]`.
- **Exotic tracking / line-height / clamp**: `tracking-[-0.035em]`, `leading-[1.02]`, inline `style="font-size: clamp(...);"` for fluid type.
- **Bespoke pixel values** for one-off shadow/border math.

Why this matters: the native scale is self-documenting in Tailwind's mental model, IDE-autosuggested, and grep-friendly. Arbitrary values are escape hatches, not defaults. **Apply moving forward** — pre-existing arbitrary values aren't retroactively in scope to refactor; touch them when you're already editing the surrounding code.

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

The barrel is the **only** icon source — every consumer is `.astro` and imports from `@/icons`. (Pre-Phase-25 there was a second rule for `.tsx` React islands importing `lucide-react` directly; with React gone, `@lucide/astro` via the barrel is the single path.)

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
- Desktop sub-row hover-swap: 100ms open intent + 120ms close delay
- Mobile drawer open/close + body scroll lock + backdrop tap + X button + link-tap close (Phase 17)
- Mobile accordion section expand/collapse
- Parallax photo translateY (added Phase 3c)

Don't add a second client script that duplicates the rAF loop. Add to this one.

### 6.2.1 Desktop nav pattern — pinned sub-row, not dropdown

The desktop nav uses a **persistent secondary row** (Phase 14), not a hover-dropdown popover. The pattern:

- **Pinned by route.** On `/solutions/*` and `/our-story|/faq`, the parent section (Solutions or Resources) renders teal in the top row and its child items render as horizontal underline-tabs in a 44px sub-row sticky beneath the main nav. The active child has a 2px teal `border-bottom`. `aria-current="page"` on the active child link.
- **Hover-preview swap.** Hovering a different top-level trigger swaps the visible panel via instant `display: none/flex` (a cross-fade was tried first but caused brief content overlap during transition — see Phase 14 narrative in PROJECT-STATE.md §10). The pinned parent's teal text stays as the wayfinding anchor.
- **Click is a no-op on dropdown triggers** (Phase 17 — hover-only by product decision). Keyboard Escape still closes the hover-preview for accessibility. Flat top-level links navigate normally.
- **Hover-slide-down from idle.** On pages with no pinned section (e.g. `/`, `/pricing`), hovering a trigger slides the sub-row down via a `max-height` transition on the sub-row itself (0 → 44px, 220ms). Content below pushes down smoothly.
- **Total chrome height** lives in `--nav-height` (`global.css`): `68px` by default, `112px` when `[data-nav-root][data-has-subnav]` is present AND viewport is `>= 768px` (Phase 17 added the media-query gate so mobile chrome stays 68). Consumers: any `scroll-margin-top` on anchored sections (`#schedule` on `/book-demo`); add future sticky offsets via the variable.
- **`getActiveSection(pathname, navLinks)`** (`nav-active.ts`) resolves which section's panel is pinned. Returns `null` when no child href matches the current pathname → no sub-row renders.
- **Breakpoint: 768px** (Phase 17 — `md`, was `lg`). Tablet shows the full desktop nav + sub-row; mobile (`< md`) gets the slide-from-right drawer instead.
- **Pinned state ships in SSR HTML.** No flicker on hydration; client only manages hover-swap transitions.

### 6.2.2 Mobile drawer pattern (Phase 17)

The mobile menu is a **slide-from-right drawer** rendered as a **sibling** of `<nav>`, not a child:

- **Why split.** `<nav>` has `backdrop-filter: blur(...)` which makes it a containing block for `position: fixed` descendants. Putting the drawer inside `<nav>` traps its fixed positioning inside the 68px nav box → invisible. The split (`MobileMenuTrigger.astro` inside, `MobileMenu.astro` as a sibling) is structural, not stylistic — don't merge them back.
- **Drawer shape.** 85% width, max 380px, slides in via `translateX(100%)` → `translateX(0)` over 240ms. Backdrop scrim covers the rest of the viewport at 40% black. Body scroll lock when open. `role="dialog"`, `aria-modal="true"`.
- **Close paths.** Backdrop tap, X button in drawer header, Escape key, any nav link tap. All wired in `nav.client.ts:initMobileMenu`.
- **Hidden on `>= md`** (768px) — desktop nav shows from tablet up.

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

3. **Gradient text-fill** — historically used on Solutions-page headlines (ProductHero) and audience PlanRec. `<em>` styled via `:global(em)` inside the parent's scoped `<style>`, with a teal-to-blue `linear-gradient` clipped to text. Both consumers were retired (PlanRec in Phase 18 with the audiences cluster; ProductHero in Phase 22 with the Solutions cluster). Pattern documented here as a precedent — if a future product-page headline wants the richer feel, reach for this variant rather than inventing a fourth.

### 6.4 Animation timings (locked)

Don't tune these without a deliberate decision; they were calibrated against the v2.5 reference:

- **BookingFlowCard** (Hero): 3-step animation, ~3s total runtime. Step-in 0.5s with delays at 0.3s/1.4s/2.5s. Icon pop 0.4s with delays at 0.4s/1.5s/2.6s. Prevented pill 0.4s at 1.9s.
- **ChannelHub** breath pulse: 4s ease-in-out infinite (Phase 15 retune from 3s).
- **Channel connector pulses** (Phase 15): 0.8s linear infinite, 5 lines staggered by 0.15s.
- **Card hover** (interactive): -4px translateY, 240ms.
- **Featured card animated border** (Phase 17): 10s linear infinite spin via `@property --card-gradient-angle`.
- **Nav sub-row hover-swap**: 100ms open intent / 120ms close delay.
- **Mobile drawer**: 240ms cubic-bezier slide-in; backdrop 240ms ease-out fade.

---

## 7. Form rules

### 7.1 Architecture (Phase 25 — native)

Native Astro markup + one bundled client script + direct browser fetch to `api.travelity.app`. No React, no Astro Action, no server validation in this repo — the backend owns validation, Turnstile verification, and email delivery.

The one form, `src/components/contact/`, has three files: `ContactForm.astro` (markup), `ContactSuccess.astro` (success card, rendered hidden), `contact.client.ts` (validation + submit). The submit body adds two transport-layer fields the user never types: `turnstileToken` (captured from the Turnstile `data-callback`) and `website` (honeypot, read from `FormData`).

The API base URL is `import.meta.env.PUBLIC_API_URL` (falls back to `https://api.travelity.app`). The endpoint path is `/api/v1/public/contact`.

Don't extract a "shared form primitives" abstraction, and **don't re-introduce a form framework** for one 3-field form. If a second form ever appears, the bar is: native + a small script first; reach for a library only at the third form, and only if validation is genuinely complex.

### 7.2 Submit flow & states

The script tracks `idle → submitting → (submitted | error)` implicitly via DOM:

- **idle** — submit button ships **`disabled`**; it enables only when Turnstile passes (§7.5). A tokenless submit short-circuits with "Please complete the verification below."
- **submitting** — submit button disabled + `Sending…`.
- **submitted** (`204`) — the `<form>` is hidden and the `#ct-success` card is revealed in place (no redirect); focus moves to the card.
- **error** (`429` / other / network) — an alert `<div role="alert">` above the button shows the message; the form stays put with values preserved; the Turnstile widget resets and the button stays disabled until the new challenge passes.

### 7.3 Validation

- Client-side validation is **UX only** — the backend is authoritative. Constraints: name 2–100, email valid + max 254, message 10–2000; values `.trim()`-ed before checking.
- Per-field check on `blur`, on `submit`, and on `input` after a field has first errored (mirrors the old RHF `onTouched`).
- Field errors set `aria-invalid="true"` on the input — which drives the red border via an `aria-[invalid=true]:` Tailwind variant — and fill a per-field `<p id="ct-*-error">` linked by `aria-describedby`.

### 7.4 No Astro Actions (Phase 24)

`src/actions/` doesn't exist. The single former Action (`contact`) was deleted in Phase 24 when the contact form was rewired to POST directly to `api.travelity.app/api/v1/public/contact`. `astro:actions` is not imported anywhere.

If a future feature needs a server-side endpoint, decide consciously: prefer extending the backend API at `api.travelity.app` (single owner, single CORS surface, no Astro server runtime needed). Reach for Astro Actions only if a piece of logic genuinely belongs in this repo — e.g. needs build-time secrets that can't live in the backend, or needs to render server-side HTML. Don't bring Actions back just to avoid a backend round-trip.

Note: Calendly bookings flow through `CalendlyWidget.astro`'s inline `postMessage` handler, never an Astro Action — different pattern, view-only since the CRM sync was removed post-Phase-18.

### 7.5 Turnstile + honeypot

Two transport-layer fields the backend expects on every `contact` submission:

- **`turnstileToken`** — Cloudflare Turnstile challenge token. The widget script `https://challenges.cloudflare.com/turnstile/v0/api.js` (loaded `async defer` from the body of `ContactForm.astro`) renders `<div class="cf-turnstile" data-sitekey={PUBLIC_TURNSTILE_SITE_KEY} data-callback data-expired-callback data-error-callback>`. Those `data-*-callback` attributes name global handlers in `contact.client.ts`: `onTurnstileSuccess` captures the token + enables the submit button; expiry/error clear it + re-disable. Tokens are **single-use** — on any non-success the script calls `window.turnstile.reset()` and the button stays disabled until the fresh challenge passes. The token is read from the callback, **not** from a hidden `FormData` input.
- **`website`** — honeypot. An off-screen `<input name="website">` (position-absolute / left-9999px / tabindex=-1 / aria-hidden / autocomplete=off). Humans never fill it; bots do. Backend rejects (generic 400) if populated.

`PUBLIC_TURNSTILE_SITE_KEY` is **required** — `ContactForm.astro` `throw`s at build time if it's unset, so a misconfigured deploy fails loudly rather than shipping an inert CAPTCHA. Local builds need a `.env` (gitignored); Cloudflare's dummy "always passes" key `1x00000000000000000000AA` works for dev.

Status handling at the boundary: `204` → success state; `429` → rate-limit message; everything else → one generic "Could not send" message. The backend deliberately collapses honeypot, CAPTCHA, and field-validation failures into a single 400 so the UI **must not** differentiate them. No retry-on-429 — user retries manually.

---

## 8. Routing & path rules

### 8.1 Paths constants

All internal URLs go through `src/lib/utils/paths.ts`. No hardcoded URL strings (`<a href="/pricing">`) anywhere outside this file. When a route is renamed or restructured, this is the only file that changes.

### 8.2 Page prerender

Every real page declares `export const prerender = true;` in its frontmatter. Astro 6 prerenders by default, but the explicit declaration is self-documenting and surfaces the intent at the page boundary. **Exception:** `_internal/*` pages are excluded from the route table by the underscore prefix; declaring `prerender` there would be misleading.

### 8.3 External link convention

Use `externalAttrs(external)` from `@/lib/utils/external-attrs` whenever a link may open in a new tab. It returns `{}` or `{ target: '_blank', rel: 'noopener noreferrer' }`. Three consumers: `Button`, `LinkInline`, `FooterColumn`.

The single external URL in the codebase right now: `Paths.STATUS = 'https://status.travelity.app'`.

### 8.4 SEO metadata & structured data (Phase 26)

- **`MarketingLayout` owns page metadata.** `<title>`, `<meta name="description">`, canonical, Open Graph and Twitter tags all render from its `title` / `description` / `canonical` / `ogImage` / `noindex` props. Pages pass copy — they never hand-roll `<head>` tags.
- **`site` is the origin source of truth.** `site` in `astro.config.mjs` drives canonical + OG URLs (read via `Astro.site`, never a hardcoded literal) and is required by `@astrojs/sitemap`.
- **The sitemap is generated.** `@astrojs/sitemap` emits `sitemap-index.xml` at build. A page kept out of search is excluded in **two** places that must stay in sync: the `filter` in `astro.config.mjs` AND a `noindex` prop on `MarketingLayout` (which emits `<meta name="robots" content="noindex, follow">`).
- **Structured data goes through `StructuredData`.** JSON-LD is rendered only by `@/components/shared/structured-data` — pass it a ready-built schema object. `Organization` is site-wide (in `MarketingLayout`); a page-specific schema (e.g. `FAQPage`) is built in the page from data it already renders, never duplicated into a parallel literal.
- **One `<main>` per document.** `MarketingLayout` emits the single `<main id="main">`; pages must not open their own `<main>` (use a `<div>`).

---

## 9. Placeholder & TODO conventions

Every piece of placeholder content carries an unmistakable marker so a launch reviewer can't miss what's pending:

| Placeholder kind       | Marker                                        | Where                                |
| ---------------------- | --------------------------------------------- | ------------------------------------ |
| Plan feature labels    | `Plan feature one`, `Plus feature two`, etc.  | `PricingSection`, `ComparisonTable`  |
| Screenshot slots       | `[Screenshot: brief description]`             | Solutions pages × ~21 slots          |
| Avatar fallbacks       | gradient circle (no `avatarSrc`)              | `TestimonialCard`                    |
| OTA logos              | ~~`[GYG logo]`, `[Viator logo]`, `[Klook logo]`~~ | **Done Phase 15** — real `GygLogo`/`ViatorLogo`/`KlookLogo` ship under `decorative/ota-logos/` |
| Legal/AI-drafted prose | amber DRAFT banner                            | `LegalPageLayout` (2 legal pages)    |
| Address                | `[Address TBD before launch]`                 | `contact.astro`                      |

### TODO comments

Source-level `// TODO:` markers are tied to specific known follow-ups. Current alive markers (audit-confirmed):

- `// TODO: split when signup page exists` — near every `Paths.BOOK_DEMO` CTA that should eventually route to a different secondary destination (e.g. `Start Free Trial`, `View live demo`, `Download whitepaper`).
- `// TODO: replace placeholder feature copy with real plan details before launch` — `pricing.astro`, `PricingSection.astro`.

When you address a TODO, remove the comment in the same change. Orphaned TODOs lie.

---

## 10. Established patterns to preserve

These patterns shaped multiple phases. Don't deviate without a decision:

1. **Card composition over inheritance.** `Card` is unopinionated about padding; consumers (`PricingPlan`, `FeatureCard`) bring their own `p-7`. `interactive` adds hover-lift. The `featured` variant now ships an **animated conic-gradient border** via the `.card-animated-border` class — card's own bg is the gradient, an inset pseudo paints the white interior (Phase 17 — see comment block in `Card.astro` for the painting-order rationale). `topAccent` prop still exists but is ignored on featured (the border IS the accent). New "card-like" patterns extend Card via composition, not by adding variants.

2. **ClosingCTASection reuse.** Most marketing pages end with `<ClosingCTASection />` with default copy. The override surface (`eyebrow`, `description`, `primaryCtaLabel/Href`, `secondaryCtaLabel/Href`, `primaryCtaExternal`, `secondaryCtaExternal`, named `headline` slot) is available; pages opt in when per-page tone is needed. Default `secondaryCtaHref` is `Paths.START_TRIAL` (external, opens in a new tab, Phase 19).

3. **Decorative SVG conventions.** Bespoke `hsl()` values are fine inside `src/components/decorative/`. The wrapper `<div>` is `aria-hidden="true"`. SVG root has `viewBox` and `preserveAspectRatio` matched to the layout shape. Partner brand SVGs (`ota-logos/`) keep their brand hex literals as a documented exemption — they're not Travelity's palette.

4. **The home and Nav consume a single `nav-data.ts`.** Updating the desktop nav also updates the mobile drawer. Add new top-level links by editing the array, not by editing `Nav.astro` markup.

5. **Calendly is not a form.** `/book-demo` uses Calendly's **simple inline embed** pattern (`<div class="calendly-inline-widget" data-url="…" style="height:700px">` + `widget.js` async script), not our contact-form pattern. The booking is confirmed inside Calendly's iframe; our code only listens for `calendly.event_scheduled` `postMessage` (origin-checked) and redirects to `/thank-you`. **No `react-calendly`** — it was tried and dropped post-Phase-18; see §1 "What is NOT used" for the reasoning. The fixed 700px height with internal iframe scroll is deliberate — keeps Calendly's internal dropdowns on-screen.

6. **Clickable cards link the whole interior.** When a `Card` needs to navigate, wrap its body in `<a class="block no-underline p-7 h-full">` *inside* the Card (Card keeps its `.feature-card` class so any positional CSS keeps working). Pattern set by `home/features-section/FeatureCard.astro` in Phase 19.

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

- **iOS scroll-position preservation** when the mobile drawer opens (`body.overflow = 'hidden'` doesn't preserve scroll position on iOS).
- **`HeroVisual.photoSrc`** is the swap-point for a real travel photo; ships with a `MountainScene` SVG mock.
- **CalendlyWidget CRM endpoint** points at v1's URL (`my.travelity.app/api/v1/cem/request-demo`). Swap when v2 backend ships. Also flag: CORS may block from new deploy origins until allowlisted.
- **Calendly height (1050px)** is a fixed pick that fits the time-slot view. Calendly's iframe content height varies by view; we can't auto-size because the iframe is cross-origin.
- **Backend `ALLOWED_ORIGINS` allowlist** (Phase 24) — backend ops must include `https://www.travelity.app` (and apex `https://travelity.app` if served) so the browser doesn't block the contact POST on CORS. Coordination, not code.

---

## 13. Code quality baseline — SOLID, clean code, accessibility

Three baselines apply across every file. They aren't a PR checklist; they're the read on whether a change looks "right" in this codebase.

### 13.1 SOLID — component-flavored

- **Single-purpose components.** If a component branches on a prop into two visually distinct shapes, split it. Two named components read better than one with `if (variant === 'X')` blocks.
- **Open via slots, closed to internal edits.** Composition through named slots (`headline`, `dek`, `ctas`, `aside`) is how consumers extend a component. New layout needs usually mean a new slot, not a new prop.
- **Interface segregation.** Keep `Props` interfaces small. `Card` is unopinionated; `PricingPlan` brings the padding and content it needs. Don't pile every option onto every component.
- **Dependency direction.** Atoms (`ui/`) know nothing about pages. Pages compose. `shared/` sits between. Never import upward (e.g., `Button` importing from `pages/`).

### 13.2 Clean code

- **Name by intent, not implementation.** `audiences` beats `items`; `BookDemoVideo` beats `RightColumn`.
- **One reason to change per file.** Same as SOLID's first letter from another angle.
- **No commented-out code.** Delete it; git remembers.
- **Comments explain the why, not the what.** Non-obvious constraints, workarounds, the reason a choice was made over an obvious alternative. Identifiers should already describe the what.
- **Inline first; extract on the third repeat.** Two similar blocks are fine; three earns the abstraction.
- **No premature abstraction.** See §11.

### 13.3 Accessibility — semantic HTML first

- **Use the right element.** `<button>` for buttons, `<a>` for navigation, `<details>`/`<summary>` for disclosure, `<label htmlFor>` for form labels. Don't `role="button"` a `<div>`.
- **Decorative content is hidden from AT.** All decorative SVGs and icon-only visuals carry `aria-hidden="true"`.
- **Forms wire `aria-invalid` and `aria-describedby`** when fields can error; errors render with a stable id the input references.
- **Modal surfaces declare themselves.** Drawers/dialogs use `role="dialog"` + `aria-modal="true"` and lock body scroll while open (see §6.2.2).
- **Reduced-motion respect.** All transforms/keyframes carry a `prefers-reduced-motion: reduce` short-circuit. Color-only transitions exempt (§6.1).
- **Skip-to-content link** in `MarketingLayout` stays put. Don't remove without a replacement.
- **Color contrast** WCAG AA at minimum. Formal audit is a pre-launch task (PROJECT-STATE.md §9).

Violation of any of these in new code is usually a sign the change needs rework, not a stylistic preference to negotiate.

---

## 14. When in doubt

1. Read **PROJECT-STATE.md** to understand what already exists.
2. Read the **codebase** to confirm.
3. If the rule isn't here and the answer isn't obvious from §1–§13, ask the user.

The codebase is the source of truth. This file and PROJECT-STATE.md should describe it accurately at any given moment; if they don't, fix the docs in the same change as the code.
