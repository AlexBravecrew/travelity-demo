# PROJECT-STATE.md — Travelity Marketing Site

> **Read this at the start of any session before writing or reviewing code.** This document captures the current state of the project, the conventions established across 11 build phases, and what remains. It supersedes earlier handoff docs (`HANDOFF-PROMPT.md` was for the _initial_ build; this is for _ongoing_ work).
>
> **Last updated:** Phase 28 — site-wide image-preview lightbox (`shared/lightbox/`, gallery-capable) wired into `/features`; `/solutions` trimmed from 6 outcome cards to 3. Earlier in this batch: Phase 27 Intercom, Phase 26 SEO foundation.

---

## TL;DR — What this project is

Astro 6 marketing site for **Travelity**, a multi-tenant SaaS booking platform serving travel businesses (Tour Operators, Transfer Providers, Travel Agencies, Independent Guides). Site lives at `travelity.app`. Built across 11 phases plus post-build iteration through Phase 19; structurally complete.

**Status:** every page exists, every link resolves, every form works. Pre-launch tasks remaining are content/operations, not engineering. See [§9 Pre-launch checklist](#9-pre-launch-checklist).

---

## 1. Stack — locked

| Layer          | Choice                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Astro 6 (file-based routing, static-by-default with hybrid mode for Actions)                                                  |
| Styling        | Tailwind v4 (CSS-first via `@theme` in `src/styles/global.css`)                                                               |
| Type system    | TypeScript 5.x strict                                                                                                         |
| Islands        | **None.** React was removed entirely in Phase 25 (the lone `ContactForm` island went native). No `.tsx`, no `client:*` directives anywhere. The site is fully static prerendered HTML + small bundled `<script>`s. |
| Analytics      | GA4 + Google Ads via `gtag.js`, loaded inside a Web Worker via `@astrojs/partytown` (Phase 23). CookieYes is the consent management platform (certified CMP, IAB TCF); Consent Mode v2 default-denied wired into the bridge. |
| Live chat      | Intercom messenger (workspace `xmobvz3r`), ported from v1 (Phase 27). Anonymous visitor, loaded via a consent-gated inline `<script>` — boots only on CookieYes `functional` consent. |
| Server runtime | `@astrojs/node` adapter (mode: standalone). Swap-friendly to Vercel/Netlify/Cloudflare.                                       |
| Forms          | Native Astro + vanilla JS. The contact form (`src/components/contact/`) posts directly to `api.travelity.app/api/v1/public/contact` (Phase 24); validation is a small client script (Phase 25). No server-side Action in this repo. |
| Icons          | `@lucide/astro` only — Astro components, consumed through the `@/icons` barrel. (`lucide-react` removed in Phase 25 with React.) |
| Node           | 22+                                                                                                                           |

**No SPA libraries.** No TanStack Query, React Router, Axios, Redux/Zustand/Jotai. **No React** (removed Phase 25). **No CSS-in-JS.** **No `tailwind.config.js`** (Tailwind v4 is config-less; tokens live in `@theme`).

---

## 2. Site shape — 12 prerendered pages + branded 404

| Path           | Phase   | Notes                                                                                       |
| -------------- | ------- | ------------------------------------------------------------------------------------------- |
| `/`            | 3a-3d   | Home: Hero (video) → Channels → Features (6 of 9 cards, clickable) → Reviews (5 polaroid cards, hover-swap on desktop, scroll-snap carousel on mobile/tablet) → Pricing (hover-swap active card) → GoLive → ClosingCTA |
| `/solutions`   | 22, 28  | Compact top title + 3 `OutcomeCard`s in a 3-up grid (2-up tablet, 1 mobile) + ClosingCTA. Replaces the Phase-5 six-page cluster. The cards carry the canonical Increase / Prevent / Manage outcomes, anchored `#increase-sales` / `#prevent-overbookings` / `#manage-all-bookings`. (Phase 28 dropped the 3 placeholder duplicate cards: 6 → 3.) |
| `/features`    | 19      | Compact top title + 9 CapabilitySections (alternating flip) + ClosingCTA. Anchor IDs match home card slugs. Placeholder copy + shared placeholder.svg per section. |
| `/pricing`     | 8, 21   | Full `<PricingSection />` (header + 3 plan cards, identical to home — hover-swap active card from Phase 21) → ComparisonTable (4 groups, 13 rows) → ClosingCTASection |
| `/book-demo`   | 7,16,18 | Single two-column section: left = headline + lead + 4 CoverageItems; right = Calendly inline widget (native v1 embed, 700px fixed height). Post-Phase-18 cleanup. Conversion fires Google Ads conversion event on `event_scheduled` (Phase 23). |
| `/thank-you`                | 7       | Static post-booking destination                                                             |
| `/legal/privacy`            | 9       | AI-drafted GDPR-aware privacy policy                                                        |
| `/legal/terms`              | 9       | AI-drafted Terms of Service                                                                 |
| `/our-story`                | 10      | Founder narrative — 3 editorial sections (Origin / Team / Mission) with alternating bg, eyebrow + display h2 with italic-em per section |
| `/faq`                      | 10      | 12 Q&As across 3 categories (Getting started / Pricing & plans / Bookings & channels). Security & data category retired. |
| `/contact`                  | 11,24,25 | Native Astro form, 3 user fields (name/email/message) + Turnstile + honeypot, posts directly to `api.travelity.app/api/v1/public/contact`. No React, no Astro Action. |
| `/404` (catch-all)          | —       | Branded "Page not found" served by `src/pages/404.astro`. Astro routes any unmatched path here automatically. Eyebrow + italic-em headline + 2 CTAs (Home / Contact). |

**Retired in Phase 18:** `/audiences/tour-operators`, `/audiences/transfer-providers`, `/audiences/accommodation-hosts`, `/audiences/independent-guides`. The four audience pages and their dedicated shared components (`pain-grid`, `solution-map`, `feature-pillars`, `workflow`, `plan-rec`) were deleted. Audience routing lives now only in the home Hero dek (italic teal phrase listing the four types).

**Retired in Phase 22:** `/solutions/booking-engine`, `/solutions/widget`, `/solutions/integrations`, `/solutions/proposals`, `/solutions/reporting`, `/solutions/security`. The six-page Solutions cluster collapsed into a single outcome-oriented `/solutions` page. `ProductHero`, `CrossSell`, `SocialProof` shared components were deleted with the cluster (no remaining consumers).

**Retired post-Phase-24:** `/legal/dpa` and `/legal/cookies`. The Data Processing Agreement and Cookies Policy pages were removed in a code-quality cleanup; only `/legal/privacy` and `/legal/terms` remain. Their `LEGAL_DPA` / `LEGAL_COOKIES` path constants and the unused `/legal/subprocessors` link inside the old DPA were deleted with them.

**Intentionally 404:** `/help`, `/help-center`, `/guides`, `/privacy`, `/terms`, `/dpa`, `/cookies`, `/legal/dpa`, `/legal/cookies`, the four `/audiences/*` paths, and the six `/solutions/<sub>` paths. All resolve to the branded `404.astro` page with a 404 status. Set up real redirects before going live if external campaigns indexed any of those.

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
│   │   ├── analytics/               # GA4 + Google Ads via Partytown + Consent Mode v2 (Phase 23)
│   │   ├── intercom/                # Consent-gated Intercom live chat (Phase 27)
│   │   └── footer/                  # 3-col grid [2fr_2fr_3fr]: brand+socials / Get-in-touch (plain-text email + phone, non-clickable) / nested Company+Resources. Dark ink.
│   │
│   ├── home/                        # Home-page sections (Phase 3a-3d)
│   │   ├── hero/                    # Hero only — HeroVisual/BookingFlowCard/AudienceChips deleted Phase 18 (video on right now)
│   │   ├── channels-section/        # Orbit diagram: hub + 5 nodes + flowing dashed pulses (Phase 15)
│   │   ├── features-section/        # FeatureCard requires href; renders first 6 of 9 entries (Phase 19)
│   │   ├── reviews-section/         # 5 polaroid customer review cards on a dark teal-blue band; desktop hover-swap, <lg scroll-snap carousel with infinite-loop clones + dot pagination (replaced retired ParallaxBreak)
│   │   ├── pricing-section/         # Header + 3 plan cards (Phase 21 hover-swap active card; reused as-is on /pricing — hideHeader prop exists but is unused)
│   │   ├── golive-section/          # 4-col onboarding
│   │   └── closing-cta-section/     # Final conversion strip (primary/secondaryCtaExternal props, Phase 19)
│   │
│   ├── shared/                      # Cross-page components
│   │   ├── capability-section/      # 2-col with `flip` prop — used on /features only (was on /solutions through Phase 22; superseded by OutcomeCard there)
│   │   ├── coverage-list/           # /book-demo "what we'll cover" (Phase 7)
│   │   ├── comparison-table/        # Pricing feature comparison (Phase 8); excluded cells now red X (Phase 23)
│   │   ├── faq-accordion/           # Native <details>-based FAQ (Phase 8)
│   │   ├── legal-page-layout/       # Shared chrome for 2 legal pages (Phase 9)
│   │   ├── structured-data/         # JSON-LD <script> emitter (Phase 26)
│   │   └── lightbox/                # Site-wide image-preview modal (Phase 28) — Lightbox + LightboxImage + lightbox.client.ts
│   │   # NOTE Phase 18: pain-grid, solution-map, feature-pillars, workflow,
│   │   # plan-rec deleted with the audience cluster.
│   │   # NOTE Phase 22: product-hero, cross-sell, social-proof deleted with
│   │   # the Solutions cluster.
│   │
│   ├── decorative/                  # Bespoke SVG components
│   │   └── ota-logos/               # GygLogo + ViatorLogo + KlookLogo (Phase 15)
│   │   # NOTE: mountain-scene deleted Phase 18 with HeroVisual.
│   │
│   ├── book-demo/                   # /book-demo page-specific (Phase 16, simplified post-18, conversion-wired Phase 23)
│   │   └── CalendlyWidget.astro     # Native v1 inline embed at 700px; postMessage → gtag conversion + /thank-you redirect
│   │
│   ├── solutions/                   # /solutions page-specific
│   │   └── outcome-card/            # Screenshot-panel-top peer tile (image + eyebrow + italic-em title + body); 3-up grid on /solutions
│   │
│   └── contact/                     # /contact page-specific (Phase 25 — native, ex-React)
│       ├── ContactForm.astro        # form markup + Turnstile loader + <script> import
│       ├── ContactSuccess.astro     # success card (revealed by JS on 204)
│       ├── contact.client.ts        # validation + fetch submit handler
│       └── index.ts                 # barrel
│
├── pages/
│   ├── index.astro                  # /
│   ├── solutions.astro              # 3 OutcomeCards in a 3-up grid; replaces the retired Phase-22 six-page cluster
│   ├── features.astro               # Phase 19 — 9 anchored CapabilitySections + placeholder screenshots
│   ├── legal/                       # 2 Legal pages (privacy + terms)
│   ├── _internal/                   # Underscore-prefixed: showcase (not built)
│   ├── book-demo/index.astro
│   ├── contact.astro
│   ├── pricing.astro
│   ├── faq.astro
│   ├── our-story.astro
│   ├── thank-you.astro
│   └── 404.astro                   # Branded catch-all "Page not found"
│   # NOTE Phase 18: audiences/ subfolder deleted (4 pages retired).
│   # NOTE Phase 22: solutions/ subfolder deleted (6 pages retired); solutions.astro added.
│
├── assets/                          # Photos / large raster assets — imported via `astro:assets` + <Image />
│   # NOTE Phase 24: src/actions/ retired with the contact action — form now POSTs directly to api.travelity.app.
│   └── reviews/                     # review-01..05 (.jpg/.png) — customer photos for the home Reviews section
│
├── icons/
│   └── index.ts                     # Single barrel for ~30 lucide icons; .astro files import only from here
│
├── layouts/
│   └── MarketingLayout.astro        # <head>: meta, canonical + OG (from Astro.site), Organization JSON-LD
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

Following this is not optional. Violations should be flagged in code review.

### 4.1 Token rule

- All colors in components use `hsl(var(--token-name))` or Tailwind utilities that resolve to tokens (`bg-paper`, `text-ink`, `text-travelity-teal`).
- **No hex codes** in `src/components/` or `src/pages/`. Verify with: `grep -rE "#[0-9a-fA-F]{6}" src/components/ src/pages/` → 0 matches.
- **Exemption:** decorative SVGs (`MountainScene`, `ParallaxScene`, the booking-flow card's pulse) may use bespoke `hsl()` literals because their colors are landscape/effect-specific and don't reuse elsewhere.
- **Exemption:** AI-drafted legal pages' DRAFT banner uses raw amber `hsl()` because warning colors aren't part of the brand palette.

### 4.2 Class name rule
- All components have a `class` prop that is merged via `cn()`.

### 4.3 Icon barrel rule

- **Every component** imports icons from `@/icons` (the barrel). Never directly from `@lucide/astro`. (Pre-Phase-25 `.tsx` React islands imported `lucide-react` directly — that path is gone with React.)
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

Every animation, hover-lift, and transition has a `@media (prefers-reduced-motion: reduce)` override that disables it. Verified for: ChannelHub's pulse, all card hover lifts, FAQ icon rotations, the mobile drawer slide + backdrop fade, the featured PricingPlan's animated conic-gradient border, the ReviewsSection polaroid hover-swap (tilt/scale/halo) and pagination-dot transitions, the GoLiveSection per-step icon animations.

### 4.6 Reusable URL constants

All internal URLs come from `src/lib/utils/paths.ts`:

```ts
export const Paths = {
    HOME: '/',
    SOLUTIONS: '/solutions', // collapsed cluster, Phase 22
    BOOK_DEMO: '/book-demo',
    START_TRIAL: 'https://admin.travelity.app', // external (Phase 19)
    PRICING: '/pricing',
    FEATURES: '/features', // Phase 19
    LEGAL_PRIVACY: '/legal/privacy',
    LEGAL_TERMS: '/legal/terms',
    // ... etc
    CONTACT: '/contact',
    THANK_YOU: '/thank-you',
    FAQ: '/faq',
    OUR_STORY: '/our-story',
} as const;
```

Naming convention: namespaced prefixes (`LEGAL_*`) for grouped routes; flat names for one-offs (`PRICING`, `CONTACT`, `FEATURES`, `SOLUTIONS`). External destinations carry a `// external` marker comment and consumers pass `external={true}` to `Button` / `LinkInline` (see §8.3 of `rules-astro.md`). The `AUDIENCE_*` and `SOLUTIONS_*` namespaced constants were removed in Phase 18 / Phase 22 respectively as their clusters collapsed.

### 4.7 Folder/file naming

- Folders: `kebab-case` (`pricing-section/`, `book-demo/`)
- Components: `PascalCase.astro` (`PricingPlan.astro`, `ContactForm.astro`)
- Helpers: `kebab-case.ts` (`nav.client.ts`, `book-demo-schema.ts`)
- Each component folder has an `index.ts` barrel re-exporting its public surface
- Test/preview pages live under `src/pages/_internal/` (Astro skips underscore-prefixed paths from the build)

### 4.7a Image strategy — `src/assets/` vs `/public/`

Two image roots, picked by purpose:

| Where | Use for | How referenced |
| --- | --- | --- |
| `src/assets/` | Raster photos (customer review polaroids, future product screenshots). Source can be multi-MB — Astro optimizes at build time. | `import img from '@/assets/foo/bar.jpg'` + `<Image src={img} widths={[...]} sizes="..." />` from `astro:assets`. The runtime serves a responsive `srcset` via Netlify's Image CDN (`/.netlify/images?...`); the original is the source-of-truth and is never shipped directly. |
| `/public/` | Decorative SVGs / placeholder graphics, icons too bespoke for the lucide barrel, anything that should be served verbatim with no processing. | Reference by absolute path: `<img src="/features/placeholder.svg" />`. |

Rule: if it's a photograph or any raster that needs responsive sizing, it goes through `src/assets/` + `<Image />`. If it's already small (SVG, ≤ ~20KB icon), it goes in `/public/`.

### 4.8 Tailwind v4 — no config file

Tokens live in `src/styles/global.css` inside an `@theme` block. There is **no `tailwind.config.js`** and there will not be one — Tailwind v4 is config-less by design.

To add a new token:

```css
@theme {
    --color-travelity-teal-hover: hsl(194 56% 47%); /* example */
}
```

…then use it as `bg-travelity-teal-hover` etc.

### 4.9 Astro Actions — retired (Phase 24)

No Astro Actions in the repo. The `contact` Action was removed in Phase 24 when the contact form was rewired to POST directly from the browser to `api.travelity.app/api/v1/public/contact`. The `src/actions/` folder is gone; `astro:actions` no longer imported anywhere.

Calendly bookings also don't go through any backend in this repo: the widget's `event_scheduled` listener fires a `gtag('event', 'conversion', …)` call (Phase 23 — Google Ads conversion `AW-…/o6zNCP7t0fYaEOO1yZhA`, with `value: 0, currency: 'EUR'`) gated on `event_callback` + 1s timeout, then redirects to `/thank-you`.

The marketing site is now fully prerendered + static; the Netlify adapter could in theory drop to `static` mode (currently `@astrojs/netlify` stays because Astro 6's hybrid default doesn't hurt).

### 4.10 Hydration directives — none (Phase 25)

No `client:*` directives anywhere. There are no React islands; `ContactForm` — the last one — went native in Phase 25. Client-side behavior ships as Astro-bundled `<script>` tags (`nav.client.ts`, `contact.client.ts`, the analytics/Calendly inline scripts), not as hydrated framework components. If a future feature genuinely needs component state, weigh a small `<script>` against re-adding a framework — prefer the script unless the interaction is complex enough to justify the runtime.

### 4.11 Analytics (Phase 23)

`src/components/chrome/analytics/Analytics.astro` injects the analytics chain into `<head>` on every prerendered page in production. Five script blocks in deterministic order:

1. **Consent Mode v2 default = `denied`** (inline main thread) — `gtag('consent', 'default', { ad_storage, analytics_storage, ad_user_data, ad_personalization: 'denied', wait_for_update: 500 })`. Establishes the baseline before any Google script runs.
2. **CookieYes script** (sync main thread, before gtag.js) — Google-certified CMP integrated with IAB TCF. Required since Jan 2024 for personalized Google Ads in EEA/UK/CH. Banner UI + category config live in the CookieYes dashboard.
3. **gtag.js** loaded inside the **Partytown Web Worker** via `type="text/partytown"` — moves ~28KB of Google JS off the main thread.
4. **gtag config** (main thread, Partytown-forwarded) — `gtag('config', GA4_ID)` + `gtag('config', ADS_ID)`.
5. **CookieYes → Consent Mode v2 bridge** (inline main thread) — listens for `cookieyes_consent_update` and maps `accepted` array to `gtag('consent', 'update', { ... })`.

Partytown integration is configured in `astro.config.mjs` with `forward: ['dataLayer.push', 'gtag']` so call sites in any component (e.g. `CalendlyWidget.astro`'s conversion event) can use `window.gtag(...)` normally on the main thread; Partytown bridges to the worker transparently.

**Dev guard**: the component returns `null` when `import.meta.env.DEV === true`. No analytics scripts inject during `astro dev` — prod GA4/Ads never see dev sessions.

**Env vars** (build-time inlined; v1 prod IDs are fallbacks):
- `PUBLIC_GA4_ID` (default `G-4SDEHMDC2F`)
- `PUBLIC_GOOGLE_ADS_ID` (default `AW-17231403747`)
- `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` (default `o6zNCP7t0fYaEOO1yZhA`)
- `PUBLIC_COOKIEYES_CLIENT_ID` (default `a13b12d7f7983235806273d7`)

**Footer "Cookie preferences" button** uses CookieYes's standard `class="cky-banner-element"` to re-open its preferences modal — no custom wiring needed.

**Possible CookieYes / Partytown conflict**: if CookieYes auto-blocker mode is enabled in the dashboard, it may rewrite the partytown-typed script's `type` attribute on consent grant, defeating the worker offload. Consent gating still works (Consent Mode v2 is the source of truth) — only the performance benefit is lost. Disable auto-blocker in CookieYes if you want the worker to stick.

---

### 4.12 Intercom live chat (Phase 27)

`src/components/chrome/intercom/Intercom.astro` ports v1's marketing-site Intercom. Rendered once in `MarketingLayout`'s `<head>`, beside `<Analytics />`.

- **Anonymous visitor only.** No `user_id`, no `user_hash` / identity verification — nothing logs in on the marketing site. (v1's _auth app_ used identity + a `company` mapping; none of that applies here.)
- **Consent-gated.** v1 loaded Intercom unconditionally — cookies before consent, a GDPR exposure. Here the `widget.intercom.io` script is injected only after CookieYes grants the `functional` category — read from the stored `cookieyes-consent` cookie (returning visitor) or live via the `cookieyes_consent_update` event. If CookieYes files Intercom under a different category slug, change the check in `Intercom.astro`.
- **Env-driven**: `PUBLIC_INTERCOM_APP_ID` (fallback `xmobvz3r` — the v1 workspace), `PUBLIC_INTERCOM_REGION` (`us`/`eu`/`ap`, fallback `us`). The app ID is a public identifier, not a secret — the messenger ships it to the client either way.
- **Dev guard**: returns `null` when `import.meta.env.DEV` — no widget during `astro dev`, mirroring `Analytics.astro`.
- **Event**: `CalendlyWidget.astro` fires `Intercom('trackEvent', 'demo_booked')` on a confirmed booking (no-op if Intercom hasn't booted).

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
3. **Gradient text-fill** — historically on ProductHero (Solutions) and PlanRec (audiences): blue→teal linear-gradient with `background-clip: text`, applied via scoped `:global(em)` on the headline class. Both consumers retired (PlanRec Phase 18, ProductHero Phase 22). Pattern documented as a precedent — reach for it if a future product page needs the richer feel.

The duality is intentional but unresolved. **Open: consolidation review** if a fourth variant emerges.

### 5.4 Spacing rhythm

- Page sections: `py-10 md:py-14` (canonical — every section, every page → 40px mobile / 56px desktop per side, ~80/112px gap between adjacent sections). The earlier values were `py-16 md:py-24` → `py-12 md:py-16` → briefly `py-6 md:py-8` (too tight) → settled at `py-10 md:py-14` after a desktop-feel review against Linear/Stripe-scale section gaps. The home Hero keeps its own `pt-8 pb-4` because it sits directly under the nav and has its own `min-h`.
- **Closing CTA exception**: `ClosingCTASection` uses `py-14 md:py-20` (~1.4× the standard tier) to give the final conversion strip deliberate weight as the page's last moment. Applies wherever `ClosingCTASection` is used (home + 6 other pages — see §2).
- Card padding: `p-6` (small), `p-7` (default — feature cards, plan cards), `p-9` or `p-7 md:p-9` (forms, plan-rec)
- Container: `container mx-auto px-6` plus a `max-w-*` constraint when the content is narrower than the page

### 5.5 Animation timings (locked)

| Component            | Animation                                | Duration / Easing                                                                               |
| -------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| BookingFlowCard      | 3-step + prevented pill choreography     | Step 1: 0.3s. Step 2: 1.4s. Prevented: 1.9s. Step 3: 2.5s. Total ~3s. cubic-bezier(0.4,0,0.2,1) |
| ChannelHub           | Pulse breath                             | 4s ease-in-out infinite (gentler — Phase 15 retune; was 3s)                                     |
| Card hover           | translateY-1 + shadow                    | 240ms cubic-bezier(0.4,0,0.2,1)                                                                 |
| FaqItem              | Plus → minus rotation                    | 200ms (CSS transition; native `<details>` for state)                                            |
| ReviewsSection card (desktop) | Hover-swap tilt/scale/halo      | transform + box-shadow: 600ms cubic-bezier(0.4,0,0.2,1); overlay opacity 350ms ease-out         |
| ReviewsSection carousel (<lg) | Scroll-snap + infinite-loop wrap | wrap fires 120ms after last scroll event (snap-settle debounce); dot updates rAF-throttled    |
| Featured PricingPlan | Elevated translateY-3 + scale 1.02 (lg+) | Same as Card hover transition                                                                   |

---

## 6. Forms — one wired

### 6.1 Pattern (ContactForm — native, Phase 25)

The contact form is plain Astro markup plus one client script. Files in `src/components/contact/`:

- **`ContactForm.astro`** — the `<form novalidate>` with 3 user fields (`name`, `email`, `message`), the off-screen honeypot `<input name="website">`, the `<div class="cf-turnstile">` widget, an error-alert `<div>`, and a hidden `<div id="ct-success">` wrapping `ContactSuccess`. Also carries the Turnstile loader `<script>` and a `<script>` that imports `contact.client.ts`.
- **`ContactSuccess.astro`** — the success card; rendered hidden, revealed by JS on a `204`. Has a `[data-success-email]` span the script fills.
- **`contact.client.ts`** — validation + submit. Bundled by Astro (Vite inlines `import.meta.env.PUBLIC_*`).

Behavior:

- **Validation** is client-side UX only — the backend is authoritative. Per-field check on `blur`, on `submit`, and on `input` after a field has first errored (mirrors the old React `onTouched`). Constraints: name 2–100, email valid + max 254, message 10–2000. Values are `.trim()`-ed before checking. Errors toggle `aria-invalid="true"` on the input (which drives the red border via an `aria-[invalid=true]:` Tailwind variant) and fill a per-field `<p id="ct-*-error">`.
- **Turnstile gating** (Phase 25.1): the submit button ships `disabled`. The `.cf-turnstile` widget carries `data-callback` / `data-expired-callback` / `data-error-callback` naming global handlers in `contact.client.ts` — `onTurnstileSuccess` captures the token and enables the button; expiry/error clear the token and re-disable it. A submit with no token short-circuits to "Please complete the verification below."
- **Submit** builds `{ name, email, message, turnstileToken, website }` and does a direct `fetch` POST to `${PUBLIC_API_URL}/api/v1/public/contact`. `turnstileToken` comes from the Turnstile callback; `website` (honeypot) is read from `FormData` at submit time.
- **Status handling**: `204` → hide the form, reveal + focus the success card, inject the email; `429` → "Too many requests. Please try again in a moment."; everything else → "Could not send. Please try again." (backend collapses honeypot / CAPTCHA / field-validation failures into one generic 400 — UI must not differentiate). No retry-on-429.
- On any non-success the widget is reset (`window.turnstile.reset()`, tokens single-use) and the button stays **disabled** until the fresh challenge passes. Submit button shows `Sending…` during the request.

### 6.1.1 Turnstile loader

The Cloudflare Turnstile widget script (`https://challenges.cloudflare.com/turnstile/v0/api.js`, `async defer`) is body-injected inside `ContactForm.astro` itself (Phase 25 — co-located with the component it serves; Calendly precedent for body-injected third-party scripts). It auto-discovers `<div class="cf-turnstile" data-sitekey={…}>` and renders the challenge; the token reaches the page via the `data-callback` handler.

### 6.1.2 Env vars

- `PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key (public/safe). **Required** — `ContactForm.astro` throws at build time if unset (Phase 25.1), so a misconfigured deploy fails loudly instead of shipping an inert CAPTCHA. Local builds need a `.env`; Cloudflare's dummy "always passes" key `1x00000000000000000000AA` works for dev.
- `PUBLIC_API_URL` — Travelity API base URL. Falls back to `https://api.travelity.app` in `contact.client.ts` if unset. Override to `http://localhost:3000` for local backend dev. Backend ops must add the calling origin to `ALLOWED_ORIGINS` for CORS; otherwise the browser blocks the request before it reaches the handler.

### 6.2 Calendly — native v1 inline embed (Phase 16, simplified post-18)

`/book-demo` embeds Calendly directly with their **simple inline pattern** (mirrors v1's working setup): `<div class="calendly-inline-widget" data-url={url} style="min-width:320px;height:700px;">` + the `widget.css` link + `widget.js` async script. **No `react-calendly` wrapper** — the React package was tried and dropped in the post-Phase-18 cleanup; its `<InlineWidget>` couldn't pass `resize: true` (causing some dropdowns to clip), and switching to `resize: true` via the advanced JS API turned out to break Calendly's internal dropdown positioning. The fixed 700px height with **internal iframe scrolling** is the deliberate fix — Calendly's dropdowns position relative to the iframe viewport, so an internally-scrolling iframe keeps them on-screen.

A small inline `<script>` listens for `message` events with `origin === 'https://calendly.com'` and `data.event === 'calendly.event_scheduled'`. On a confirmed booking it fires the **Google Ads conversion** event (Phase 23) via `window.gtag('event', 'conversion', { send_to: AW-…/o6zNCP7t0fYaEOO1yZhA, value: 0, currency: 'EUR', event_callback })`, then redirects to `/thank-you` either when `event_callback` fires or after a 1s timeout fallback (covers ad-blocker / gtag-unavailable). A re-entry guard prevents double-navigation. No CRM sync (the v1 `my.travelity.app/api/v1/cem/request-demo` POST was removed post-Phase-18).

`PUBLIC_CALENDLY_URL` env var still overrides the default `calendly.com/travelity-sales/30min?text_color=…&primary_color=…` URL. The Google Ads conversion target is built from `PUBLIC_GOOGLE_ADS_ID` + `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` at build time via Astro's `define:vars`.

### 6.3 Email delivery — handled by travelity-api (Phase 24)

Email delivery is now the backend's job. `POST /api/v1/public/contact` on `api.travelity.app` validates input, runs Cloudflare Turnstile server-side, and emails the support team. The frontend has no knowledge of routing rules.

**By-subject routing dropped.** The earlier plan was to route `Sales/Support/Partnership/Other` to `sales@/support@/partnerships@/hello@travelity.app`. The Phase 24 backend takes only `name/email/message/turnstileToken/website` and emails one address. If by-subject routing comes back, it needs a backend field + frontend subject UI; both are gone today.

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

- [ ] **Set `PUBLIC_TURNSTILE_SITE_KEY`** in Netlify env (and `.env` for any build) — pulled from Cloudflare dashboard → Turnstile → Site. **The build throws if it's unset** (Phase 25.1), so this is non-optional.
- [ ] **Confirm `PUBLIC_API_URL`** points at the right backend (`https://api.travelity.app` for prod — the code default). Override per environment as needed.
- [ ] **Backend `ALLOWED_ORIGINS`** must include `https://www.travelity.app` (and apex `https://travelity.app` if served) — otherwise the browser blocks the POST with a CORS error before it ever reaches the handler. Coordinate with backend ops.
- [x] **Wire real email service** — Phase 24. The contact form posts directly to `api.travelity.app/api/v1/public/contact`; backend handles email + CAPTCHA verification. (Subject-based routing dropped — see §6.3.)
- [ ] **301 redirects** from old URLs: `/help` and `/help-center` → `/faq` (or `/contact`), `/guides` → `/` (retired in the bulk-cleanup commit), `/privacy` → `/legal/privacy`, `/terms` → `/legal/terms`, `/dpa` · `/cookies` · `/legal/dpa` · `/legal/cookies` → `/legal/privacy` (DPA + Cookies pages retired post-Phase-24), the four retired `/audiences/*` paths (Phase 18 — probably redirect to `/` or `/features`), and the six retired `/solutions/<sub>` paths (Phase 22 — redirect to `/solutions`). Only needed if external campaigns indexed those paths.
- [ ] **Replace `[Address TBD]`** in `/contact` email strip with BraveCrew Inc.'s registered address.
- [ ] **Confirm role-based emails exist:** `sales@`, `support@`, `partnerships@`, `hello@`, `privacy@`, `dpo@`, `security@`, `legal@travelity.app`.
- [ ] **Add prod + preview domains to CookieYes whitelist** (Phase 23). Production `travelity.app` is already configured. For Netlify deploy previews or staging, add the relevant domain pattern in CookieYes dashboard → Organizations & Sites; otherwise the banner refuses to render. `localhost:3000` was added for local prod-preview testing.
- [ ] **Verify the CookieYes `functional` category** (Phase 27). The Intercom chat widget boots only on `functional` consent. In the CookieYes dashboard confirm: a category with slug `functional` exists, it's an opt-in toggle (not "always active"), and Intercom's cookies (`intercom-id-*` / `intercom-session-*`) are filed under it. If Intercom sits under a different slug, update the gate in `Intercom.astro`.
- [ ] **Update privacy legal copy** to name GA4, Google Ads, and CookieYes by name (Phase 23 deferred this — see §6.2). GDPR specificity requires naming the data processors. (The standalone Cookies Policy page was retired post-Phase-24.)
- [x] **Resolve Start-Free-Trial destination** — Phase 19. All four Start Free Trial CTAs now point at `Paths.START_TRIAL = https://admin.travelity.app` (external, opens in new tab).
- [x] **Wire Google Ads conversion on Calendly bookings** — Phase 23. `CalendlyWidget.astro` fires `gtag('event', 'conversion', …)` with `value`/`currency`, gated redirect via `event_callback` + 1s timeout fallback.
- [x] **SEO foundation** — Phase 26. `@astrojs/sitemap` + `robots.txt`, canonical/OG from `Astro.site`, Organization + FAQPage JSON-LD, `/pricing` `<h1>`, one `<main>` per page, `/thank-you` `noindex`.
- [x] **Add `public/og-default.png`** — Phase 26. 1200×630 social-share card: the Travelity wordmark on a branded white background (soft teal glow + blue→teal accent bar). Built by rasterizing a composed SVG with `sharp`.

### Must-haves (content / legal)

- [ ] **Lawyer review of both `/legal/*` pages.** AI-drafted boilerplate. Specific TBDs inline:
    - Privacy: DPO contact, EU representative, retention specifics
    - Terms: governing-law jurisdiction (twice in "Governing law" section)
- [ ] **PO review of `/our-story` narrative.** Real copy is in; verify specifics about team, founding, customers, hiring/funding are accurate before launch.
- [ ] **PO review of FAQ entries** on `/faq` (12 Q&As across 3 categories) — particularly OTA integration list, plan availability claims, support promises.
- [ ] **Replace `Plan feature one`** placeholder copy in `PricingPlan.astro`. Same for the 13-row placeholder in `/pricing`'s ComparisonTable.

### Should-haves (content)

- [ ] **Real product screenshots** for the 5 simpler Solutions pages. Drop assets in `/public/`, swap `[Screenshot: …]` placeholder divs in CapabilitySection visual slots.
- [ ] **Real screenshots for `/features`** (Phase 19). All 9 sections currently point at the shared `/public/features/placeholder.svg`. Drop per-section images in `/public/features/` and update each `<img src>` in `src/pages/features.astro`.
- [ ] **Real headline / lead / bullet copy for the 9 `/features` sections.** Top-of-file TODO comment tracks this. Placeholder strings ship today.
- [x] **Real OTA logos** in ChannelDiagram — done in Phase 15. `GygLogo`, `ViatorLogo`, `KlookLogo` ship as Astro components under `src/components/decorative/ota-logos/`.

### Nice-to-haves

- [ ] **Lighthouse audit + tuning.** LCP, CLS, font loading. Probably already healthy.
- [ ] **Analytics integration.** Plausible / Fathom / GA4 — pick one and wire it.
- [ ] **Mobile menu polish** (Phase 2 carry-forward): animation timing, accordion item density, scrim, iOS scroll-position preservation.

---

## 10. Phase narratives (13–28)

Brief context for each post-build phase. Newer phases on top. **Phase 20 is not listed — an orange-accent test was prototyped and reverted before commit.**

### Phase 28 — Image-preview lightbox + `/solutions` trim

- **Site-wide lightbox** — new `src/components/shared/lightbox/`: `Lightbox.astro` (the overlay), `LightboxImage.astro` (a click-to-zoom image), `lightbox.client.ts` (behavior), `index.ts`. `MarketingLayout` renders `<Lightbox />` once, so any page can use `<LightboxImage>` with no extra wiring.
- **Native `<dialog>`** — `showModal()` gives the top layer, Esc-to-close, and focus trapping for free. Dark `::backdrop` scrim; backdrop-click closes; the `close` event is the single cleanup point (restores scroll). No open/close animation → no `prefers-reduced-motion` code needed.
- **Gallery model** — `<LightboxImage>` triggers sharing a `group` value form one gallery; the modal's prev/next + ←/→ keys + counter cycle within the group. A single-image group hides the nav controls. Designed so adding more images to a section later (same `group`) lights up navigation with zero modal changes.
- **`LightboxImage`** wraps an `astro:assets` `<Image>` in a zoom-cursor `<button>`; `getImage()` generates a full-size modal variant capped at the source's intrinsic width (no upscaling).
- **`/features`** — all 9 sections now use `<LightboxImage group={slug}>` (one image per section today → single-image groups).
- **Icon barrel** — added `ChevronLeftIcon` / `ChevronRightIcon` for the modal nav.
- **`/solutions` trimmed 6 → 3** — the 3 anchor-less placeholder cards that mirrored cards 1-3 were removed. The page now shows only the canonical Increase / Prevent / Manage outcome cards.

### Phase 27 — Intercom live chat

- **Ported v1's marketing-site Intercom** as `src/components/chrome/intercom/Intercom.astro` (+ `index.ts`), rendered in `MarketingLayout`'s `<head>` beside `<Analytics />`. Anonymous visitor — no identity, no `user_hash` (matches v1's marketing site; the v1 auth-app identity / `company` mapping is irrelevant here).
- **Consent-gated** — the fix for v1's main gap. v1 loaded Intercom unconditionally, dropping cookies before consent. v2 injects the `widget.intercom.io` script only after CookieYes grants the `functional` category (stored cookie, or the live `cookieyes_consent_update` event).
- **Env-driven**: `PUBLIC_INTERCOM_APP_ID` (fallback `xmobvz3r`), `PUBLIC_INTERCOM_REGION` (fallback `us`). v1 hardcoded the workspace ID.
- **Dev guard**: renders nothing in `astro dev`, mirroring `Analytics.astro`.
- **`trackEvent('demo_booked')`** added to `CalendlyWidget.astro`'s `event_scheduled` handler so a booking surfaces in Intercom.
- **No React**: the v1 porting audit assumed a React island (`client:idle`); v2 has no React (Phase 25), so it's a plain Astro `<script>` mirroring `Analytics.astro`. The audit's view-transition / CSP / identity-verification items don't apply. See §4.12.

### Phase 26 — SEO foundation

- **`site` + sitemap**: `site: 'https://travelity.app'` added to `astro.config.mjs`; `@astrojs/sitemap` emits `sitemap-index.xml` + `sitemap-0.xml` at build. A `filter` drops `/thank-you` and `/404` (10 routes ship).
- **`public/robots.txt`** added — allows all, points crawlers at the sitemap.
- **Canonical/OG**: `MarketingLayout`'s `siteUrl` now derives from `Astro.site` (the config `site`), not a hardcoded literal. New optional `noindex?: boolean` prop emits `<meta name="robots" content="noindex, follow">`; `/thank-you` passes it.
- **Structured data**: new `shared/structured-data/StructuredData.astro` renders a JSON-LD `<script>`. `MarketingLayout` injects an `Organization` schema site-wide; `/faq` adds a `FAQPage` schema.
- **`/faq` refactor**: the 12 Q&As moved from inline `<FaqItem>` markup to a typed `faqGroups` array — one source now feeds both the accordion and the FAQPage schema, so they can't drift.
- **`/pricing` `<h1>`**: the page had none (it reused the home `PricingSection`, whose top heading is an `<h2>`). Added a compact intro section carrying the page `<h1>`; `PricingSection` now gets `hideHeader` so the title isn't rendered twice.
- **Nested `<main>` fixed**: every page wrapped its content in a `<main>` while `MarketingLayout` already emits `<main id="main">` — an invalid duplicate. Pages now use a `<div>`; one `<main>` per document.
- **Favicon**: `public/favicon.svg` re-squared — `viewBox` `0 0 125 99` → `0 -13 125 125` so the mark isn't letterboxed in the icon slot.
- **Pending**: `public/og-default.png` still needs a real 1200×630 card — see §9.

### Phase 25 — Contact form goes native; React removed

- **`ContactForm` ported from a React island to native Astro.** New folder `src/components/contact/` (`ContactForm.astro`, `ContactSuccess.astro`, `contact.client.ts`, `index.ts`), replacing `src/components/forms/contact/` which was deleted along with the `forms/` folder.
- **Why**: after Phase 24 removed the Astro Action, the React Hook Form + zod stack existed solely for client-side validation of one 3-field form — its original justification (a zod schema shared between client and server) was gone. React was the only island in an otherwise fully static site.
- **Validation** is now a small `contact.client.ts` script: per-field checks on `blur` / `submit` / post-error `input`, same messages and constraints as the old zod schema. Error state drives the red border via an `aria-[invalid=true]:` Tailwind variant rather than React class toggling.
- **Dependencies removed (9)**: `react`, `react-dom`, `@astrojs/react`, `@types/react`, `@types/react-dom`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `zod`. Plus `eslint-plugin-jsx-a11y`. `npm install` pruned 61 packages from the tree.
- **Config cleanup**: `react()` integration dropped from `astro.config.mjs`; `jsx` / `jsxImportSource` removed from `tsconfig.json`; `eslint.config.js` lost the `jsx-a11y` plugin and its TS block narrowed `**/*.tsx` → `**/*.ts`.
- **Icon barrel**: added `CircleCheck as CheckCircleIcon` (lucide's successor to the deprecated `CheckCircle2`) — `ContactSuccess.astro` now pulls icons from `@/icons` instead of `lucide-react`.
- **Turnstile loader** moved from `contact.astro` into `ContactForm.astro` (co-located with the component it serves).
- **Result**: zero React islands, zero `client:*` directives. The site is fully static prerendered HTML + bundled `<script>`s.

**Phase 25.1 — follow-up after reference-spec review:**

- **API base URL env var renamed** `PUBLIC_TRAVELITY_API_BASE_URL` → `PUBLIC_API_URL` (matches the team reference spec). `contact.client.ts` now falls back to `https://api.travelity.app` when unset.
- **Turnstile gating**: the submit button ships `disabled` and is enabled only by the `onTurnstileSuccess` callback. The widget wires `data-callback` / `data-expired-callback` / `data-error-callback`; the token is captured from the callback (not read from a hidden `FormData` input). A tokenless submit short-circuits with a "complete the verification" message. On non-success the widget resets and the button stays disabled until the new challenge passes.
- **`PUBLIC_TURNSTILE_SITE_KEY` now required**: `ContactForm.astro` throws at build time if it's unset, so a misconfigured deploy fails loudly. A gitignored `.env` carries the key for local builds (Cloudflare's dummy "always passes" key `1x00000000000000000000AA` for dev).

### Phase 24 — Contact form → live `travelity-api`, Astro Action retired

- **Form rewired to fetch `https://api.travelity.app/api/v1/public/contact` directly** from the React island. Replaces the prior `actions.contact(values)` call. Backend validates input, runs Cloudflare Turnstile server-side, and emails the support team.
- **`src/actions/index.ts` deleted**; `src/actions/` folder gone. No `astro:actions` imports remain in the codebase. Astro Actions integration in `astro.config.mjs` was zero-config (built into Astro 6), so no config edit needed.
- **`subject` field dropped** from the form, schema, success card, and barrel exports. The backend endpoint accepts only `name/email/message/turnstileToken/website` (`forbidNonWhitelisted: false`); subject would have been silently dropped on the wire. PROJECT-STATE.md §6.3's earlier subject-routing intent is **gone** — if it comes back, both the backend and the form need work.
- **Cloudflare Turnstile** integrated client-side. Widget div `<div class="cf-turnstile" data-sitekey={PUBLIC_TURNSTILE_SITE_KEY}>` renders inside the React island. Loader script (`https://challenges.cloudflare.com/turnstile/v0/api.js`, async + defer) lives in `src/pages/contact.astro` body, mirroring the Calendly precedent — no layout `<head>` slot needed.
- **Honeypot field** `name="website"` added as an off-screen `<input>` (`position: absolute; left: -9999px; tabindex=-1; aria-hidden; autocomplete=off`). Backend rejects (generic 400) if it's populated.
- **Status handling**: `204` → success card (in-place swap, no redirect); `429` → "Too many requests. Please try again in a moment."; everything else → "Could not send. Please try again." Honeypot vs CAPTCHA vs field-validation failures all return the same generic 400 by backend design — the UI does not differentiate. `window.turnstile.reset()` runs on every non-success branch (tokens are single-use). No retry-on-429.
- **Zod schema tightened**: `email.max(254)`, `message.max(2000)` to match backend; `name`/`message` mins kept at 2/10 for UX (tighter than backend's 1/1).
- **Env vars added** (`.env.example`): `PUBLIC_TURNSTILE_SITE_KEY` + the API base URL (named `PUBLIC_TRAVELITY_API_BASE_URL` in Phase 24, renamed `PUBLIC_API_URL` in Phase 25.1).
- **Pre-launch dependency** added: backend ops must include `https://www.travelity.app` (and apex if served) in `ALLOWED_ORIGINS` — otherwise the browser blocks the POST with a CORS error before it reaches the handler.

### Phase 23 — Analytics integration (GA4 + Google Ads via Partytown + CookieYes + Consent Mode v2)

- **`src/components/chrome/analytics/Analytics.astro`** wires GA4 + Google Ads into every prerendered page via a 5-step `<head>` injection. Same GA4/Ads/CookieYes IDs as v1 (`G-4SDEHMDC2F`, `AW-17231403747`, CookieYes client `a13b12d7f7983235806273d7`). All ID strings are env-var-driven (`PUBLIC_GA4_ID`, `PUBLIC_GOOGLE_ADS_ID`, `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`, `PUBLIC_COOKIEYES_CLIENT_ID`) with v1-prod fallbacks. See §4.11 for the full chain.
- **Consent Mode v2 default-denied** baseline established BEFORE any Google script — v1 had no consent-mode signals, so Google Ads in EEA/UK/CH was being limited to non-personalized ads (since Jan 2024). Bridge listener maps CookieYes's `cookieyes_consent_update` event to `gtag('consent', 'update', { ... })`.
- **Partytown integration** added via `@astrojs/partytown@^2.1.7` with `forward: ['dataLayer.push', 'gtag']`. gtag.js (~28KB) runs in a Web Worker; call sites use `window.gtag(...)` normally on the main thread.
- **Dev guard**: Analytics returns `null` when `import.meta.env.DEV === true`. No analytics scripts inject during `astro dev`. Same gate covers CookieYes.
- **Dev server port** changed from Astro default `4321` → `3000` so `npm run dev` and `npx serve dist` share the same URL (one CookieYes whitelist entry covers both).
- **Calendly conversion** wired in `CalendlyWidget.astro`: replaces the prior `// TODO(analytics)` comment with a real `gtag('event', 'conversion', …)` call carrying `value: 0, currency: 'EUR'`. Navigation gated on `event_callback` + 1s timeout fallback + re-entry guard — fixes v1's racy redirect that could drop conversions.
- **Footer "Cookie preferences" button** uses CookieYes's standard `class="cky-banner-element"` to re-open the preferences modal.
- **Pricing card excluded-feature icon** changed from `MinusIcon` (gray) → red X (`XIcon` + `text-destructive`). Same change applied to `ComparisonTable.astro` (both card-list and mobile-stacked layouts). `MinusIcon` removed from `src/icons/index.ts` as orphaned.
- **Note on CookieYes auto-blocker vs Partytown**: if auto-blocker mode is enabled in the CookieYes dashboard, it may rewrite `type="text/partytown"` on consent grant, defeating the worker offload. Consent gating still works (Consent Mode v2 is the source of truth). Disable auto-blocker in the dashboard if the worker offload matters.

### Phase 22 — Retire 6-page Solutions cluster, ship single `/solutions` page

- **Solutions cluster deleted**: `/solutions/booking-engine`, `/widget`, `/integrations`, `/proposals`, `/reporting`, `/security` (6 pages). Replaced with one outcome-oriented page at `/solutions` (`src/pages/solutions.astro`) containing 3 CapabilitySections: **Increase Sales**, **Prevent Overbookings and Revenue Loss**, **Manage All Bookings in One Place**. Compact top title + ClosingCTASection. Placeholder copy + shared `/public/solutions/placeholder.svg`; user replaces per-section as real screenshots arrive.
- **Orphaned shared components retired** (no remaining consumers after the cluster deletion): `product-hero/`, `cross-sell/`, `social-proof/`. Same discipline as Phase 18's audience-component sweep.
- **`/_internal/phase-4-preview.astro`** deleted — it was a testbed for the three components above.
- **Nav**: Solutions becomes a flat link `{ label: 'Solutions', href: Paths.SOLUTIONS }`. No dropdown, no sub-row on `/solutions`.
- **Footer**: Solutions column removed. Grid `[2fr_1fr_1fr_1fr]` → `[2fr_1fr_1fr]` (brand + Resources + Company).
- **Paths**: 6 `SOLUTIONS_*` constants removed, single `SOLUTIONS: '/solutions'` added.
- Net diff: −1795 lines, +153 lines.

### Phase 21 — Pricing hover-swap active card + suppress duplicate `/pricing` title

- **`/pricing` duplicate title fix**: the page hero already shows "Plans for every size of operation." — `PricingSection.astro` was then rendering the same headline via its inner `SectionHeader`. Added an opt-out `hideHeader?: boolean` prop; `pricing.astro` passes it (`<PricingSection hideHeader />`). Home behavior unchanged (header still shows).
- **Hover-swap pricing cards**: previously the middle card was statically "featured" (gradient ring + elevation). Now: middle card is the active card **by default** (no hover); on hover of any other card, that card becomes active and the middle de-activates; on mouseleave, middle re-activates. Pure CSS via `:has()`: `.pricing-cards:not(:has(.pricing-plan:hover)) .pricing-plan:nth-child(2)` + `.pricing-cards .pricing-plan:hover` both apply the same active styles (conic-gradient bg, animated angle, transparent border, teal shadow, `lg`-breakpoint `translateY(-12px) scale(1.02)`).
- **Style block is `is:global`** — Astro's `:global()` wrapper inside `:has()` failed to match (middle card lost both elevation and ring entirely). `.pricing-cards` is unique to this section so unscoping is safe.
- **PricingPlan simplified**: dropped the `featured` prop and all its effects (Card variant switch, static `lg:-translate-y-3 lg:scale-[1.02]`, internal teal accents on name and check icons). Internal content stays uniform; only outside styling changes on hover. Badge renders whenever `badgeLabel` is set; "Most popular" stays pinned to the middle card as a static plan label.

### Phase 19 — `/features` page + Start Free Trial → admin.travelity.app

- **New page**: `src/pages/features.astro`. Compact top section (Eyebrow + italic-em h1 + 1-line dek) followed by 9 `CapabilitySection`s alternating flip (sections 2/4/6/8 flipped). Each section's `id` matches the home FeaturesSection card slugs (`channel-manager` → `team-collaboration`) and carries `scroll-mt-[var(--nav-height)]` so home-deep-links land below the sticky 68px nav. `ClosingCTASection` at the bottom with defaults.
- **Home FeaturesSection trimmed to 6 of 9**: `features.slice(0, 6)` in the render so only the first six cards appear on `/`. The full nine entries stay in the array as a record (slug definitions co-located with the home consumer). Dek copy updated "Nine core capabilities..." → "Six of our core capabilities... The full set lives on the Features page."
- **Placeholder image**: `public/features/placeholder.svg` (1280×720). Shared by all 9 sections via `<img src="/features/placeholder.svg">`. User swaps per-section paths as real screenshots arrive.
- **Nav additions**: "Features" flat link added between Solutions and Pricing in `nav-data.ts`. "Start Free Trial" outline button added before "Book a demo" in `Nav.astro` (desktop) and `MobileMenu.astro` (mobile drawer, stacked above Book a demo). Both desktop + mobile use the same button.
- **Start Free Trial site-wide → `https://admin.travelity.app`**: new `Paths.START_TRIAL` constant. All four Start Free Trial CTAs (Nav, MobileMenu, Hero, ProductHero, ClosingCTASection) point at it with `external={true}` (target=_blank + rel=noopener noreferrer). Three pending `// TODO: split when signup page exists` comments resolved.
- **`ClosingCTASection` API**: added `primaryCtaExternal?: boolean` and `secondaryCtaExternal?: boolean` props (secondary defaults to `true` to match the new default external href).
- **FeatureCard.astro** now requires `href`. Renders Card → `<a class="block no-underline p-7">` so the entire card interior is the click target; `.feature-card` class stays on the Card so the `:nth-child` color rotation still works.
- New: `Share2Icon` in the icon barrel (Channel Manager). New: `Paths.FEATURES` and `Paths.START_TRIAL`.

### Post-Phase-18 cleanup — book-demo merge, Calendly native embed, Resources nav drop

Three loose-end edits committed together as `9c8bbe6`:

- **`/book-demo` merged into one section**: previously had ProductHero + "What we'll cover" + "#schedule" anchored CalendlyWidget across three sections. Now a single two-column section — left column has the combined eyebrow + headline + lead + 4 CoverageItems (overridden to `mx-0 max-w-none` so the list left-aligns), right column has the Calendly widget directly. Removed: `BookDemoVideo` (no longer used on this page), the `#schedule` anchor, the redundant "Pick a time" CTA, the scroll-mt offset.
- **`react-calendly` removed**: `CalendlyWidget.tsx` deleted. Replaced with `CalendlyWidget.astro` using Calendly's **simple inline embed** pattern (`<div class="calendly-inline-widget" data-url>` + widget.js auto-discovery) at the same fixed 700px height v1 uses — chosen specifically because internal iframe scroll keeps Calendly's internal dropdowns on-screen (the bug we hit when trying the JS API with `resize: true`). `react-calendly` removed from `package.json`. Site is down to **1 React island** (only `ContactForm` left). CRM-sync POST also removed (per product direction).
- **Resources dropdown removed from nav**: top-level Resources entry deleted from `nav-data.ts`. Both desktop nav and mobile drawer lose it automatically (single source). FAQ / Our Story remain reachable via the Footer's Resources column. (Subsequent bulk-cleanup commits also retired `/guides` and `/help-center` outright.)

### Phase 18 — home hero + retire audiences + layout density pass

- **Home hero redesigned**: dropped the `BookingFlowCard` + `HeroVisual` (gradient sky / mountain mock) entirely. Right column is now `BookDemoVideo` (the YouTube walkthrough). Left column: eyebrow + headline that wraps after "business" (`<br>`) + larger dek ("Bookings, channels, OTA integrations…") + a separate "Built for: Tour Operators | Transfer Providers | Travel Agencies | Independent Guides" line styled bold teal with `|` separators. The pill-chip `AudienceChips` component deleted.
- **Audiences cluster retired**: 4 audience pages + 5 audience-only shared components (`pain-grid`, `solution-map`, `feature-pillars`, `workflow`, `plan-rec`), `MountainScene`, `BookingFlowCard`, `HeroVisual`, `AudienceChips`, the `AUDIENCE_*` paths, and the Audiences `FooterColumn` (footer grid `5→4` cols). Roughly −2050 lines.
- **Container max-width: 1280px**. Tailwind v4 `container` overridden via `@utility container { margin-inline: auto; max-width: 1280px; }` in `global.css` — replaces the v4 default which grew to 1536px at the `2xl` breakpoint.
- **Section padding consolidated**: every section across every page is now `py-12 md:py-16` (48/64px). Retires the prior three-tier system (`py-16 md:py-24`, `py-24`, `py-16 md:py-20`). Home `Hero` keeps its own `pt-8 pb-4` because it sits directly under the nav and has its own `min-h`. Hero's inner-grid `py-8` removed (was duplicating the wrapper padding). ChannelsSection's asymmetric `pt-16 pb-24 md:pt-20 md:pb-28` collapsed to the canonical tier.
- **Rules doc additions**: §4.4 *Native Tailwind sizing* — prefer scale utilities (incl. v4 dynamic spacing — `min-h-135` for 540px etc.) over arbitrary-value brackets. Carve-outs: ch-units, off-scale design values, exotic tracking. §13 *Code quality baseline* — SOLID, clean code, semantic-HTML accessibility (old §13 → §14).

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

- **Pinned secondary row** (44px, sticky `top: 68px` directly under the main nav). On `/solutions/*` and `/our-story|/faq`, the row is present in SSR HTML and shows the section's child links as horizontal underline-tabs. Active child has a 2px teal `border-bottom` and `aria-current="page"`.
- **Active nav indicator** in the top row: the parent section renders `text-travelity-teal`. Flat top-level links (Pricing) also render teal when on their own page.
- **Hover-swap behavior**: hovering a different top-level trigger swaps the visible panel in the sub-row via instant `display:none/flex` (the original cross-fade was dropped — it caused content overlap during transition). 100ms open intent + 120ms close delay. On pages with no pinned section, hovering slides the sub-row down via `max-height` transition (0 → 44px, 220ms) on the sub-row itself.
- **Layout/sticky**: sub-row owns `overflow-hidden` + `max-height` directly (an ancestor with `overflow:hidden` would have killed `position: sticky`).
- **`--nav-height` CSS variable**: 68px default, 112px under `:root:has([data-nav-root][data-has-subnav])`. Phase 17 added the `@media (min-width: 768px)` gate.
- New files: `NavSubRow.astro`, `nav-active.ts`. Deleted: `NavDropdown.astro`, `NavDropdownItem.astro`. Type rename: `NavDropdownItemData` → `NavSubItemData`.

### Phase 13 — brand / logo swap

Logo system reworked. Phase 13 also bundled a Phase 12 audit ride-along (see commit `e5bda15`).

## 11. What's next

The remaining engineering pass:

1. Verify clean code passes: lint, format, type-check, build, no dead code, no unused exports, no orphaned imports, no `console.log` left from removed Action handlers.
2. Anything else (real content, real photos, backend CORS allowlist, Turnstile site key per environment) is content/operations work — see §9.

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
