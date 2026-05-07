# Travelity Marketing Site

The marketing site at `travelity.app`. Astro 6 + Tailwind v4 + TypeScript.

## Run

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # production build → dist/
npm run preview      # preview prod build
npm run check        # astro check (TypeScript)
npm run lint         # eslint
npm run format       # prettier write
```

## Where things live

```
src/
├── components/
│   ├── ui/             Atoms — Button, Tag, Eyebrow, Card, etc.
│   ├── chrome/         Site-wide — Nav, Footer, ThemeToggle
│   ├── home/           Home-page sections — Hero, Channels, Features, etc.
│   ├── shared/         Cross-page — ProductHero, AudienceHero, CapabilitySection
│   └── decorative/     SVG illustrations — TravelityLogoMark, MountainScene
├── content/            Astro content collections
├── icons/              Icon barrel (single source of truth — see icons/index.ts)
├── layouts/            Page shells (MarketingLayout)
├── lib/utils/          cn(), Paths, format helpers
├── pages/              File-based routes
└── styles/             global.css with @theme tokens
```

## Design docs

The full design package lives in the project knowledge:

- `design-system.md` — tokens, typography, motion, accessibility
- `tech-stack.md` — Astro/Tailwind/shadcn config
- `home-page-structure.md` — section-by-section home spec
- `component-inventory.md` — every component the site needs
- `build-plan.md` — 11-phase build plan
- `rules-astro.md` — project rules (overrides others on conflict)

## Conventions

- **Icons:** import from `@/icons`, all named with `Icon` suffix (`ArrowRightIcon`, `LockIcon`)
- **Paths:** import from `@/lib/utils/paths`, never hardcode URL strings
- **Tokens:** consume via `hsl(var(--travelity-blue))` or Tailwind utility (`text-travelity-blue`); never hardcode hex
- **Components:** Astro by default. React islands only when state is genuinely needed (forms, theme toggle, etc.)
- **No warm-direction tokens.** No `--travelity-coral`, no `--travelity-cream`. Those were rolled back.
