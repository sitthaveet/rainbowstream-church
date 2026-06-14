# Design Theme — "Prism" (Rainbow Stream)

A warm, editorial, light-driven identity for an LGBTQ+ affirming church. The
concept: **light refracted through a stream becomes a spectrum.** The rainbow is
at once the queer symbol and the biblical covenant — so the brand is the full
visible spectrum, used with restraint and reverence rather than as a loud flag.

The aesthetic is bold but calm: serif display gravitas, deep atmospheric
backgrounds, glow and depth, and one unforgettable object — the **prism points
medallion**. Restraint is the discipline: full spectrum is reserved for rare
signature moments; everyday interaction leans on a single rose→violet gradient.

## Color System

Colors are `oklch()` CSS custom properties exposed to Tailwind v4 via
`@theme inline`. Light and dark are full peers (`.dark` class, system-default,
toggleable) and `color-scheme` is set per theme so native controls match.

- **Neutrals** — warm paper in light (`background` ~0.99L, a whisper of rose at
  ~330°), deep plum-ink in dark (`background` ~0.16L, ~305°). The ink night is
  intentional: it lets spectral light glow.
- **Headings** — a deep, rich plum-ink (light) / luminous rose (dark). Always
  tinted, never plain black, but no longer timid.
- **The spectrum** — six refined prism stops as `--spectrum-1…6`
  (rose → coral → amber → jade → azure → violet), slightly more luminous in
  dark. Composed into three gradients:
  - `--gradient-spectrum` — linear, for beams, rules, and clipped hero text.
  - `--gradient-conic` — looped, for the medallion ring, QR frame, halos, the
    spectral loading ring.
  - `--gradient-brand` — rose→violet (the two ends only). Bold and legible
    behind white text; this is the **interactive** gradient (primary buttons).

Semantic tokens (use these, not raw colors): `background` / `foreground`,
`headings`, `accent` / `accent-foreground`, `shade`, `muted` /
`muted-foreground`, `success*`, `error*`, `quotes` / `quotes-border`,
`decoration` (bright rose, list markers + arrows), `link*` (azure — interactive,
distinct from the rose brand), and the ShadCN set (`card`, `primary`, `border`,
`ring`, …).

Principle: **spectrum = identity (rare, signature) · rose→violet = interactive ·
azure = links · desaturated plum-gray = structure.**

## Typography

Two Google Fonts, loaded via `next/font` as CSS variables, both with Latin +
Thai subsets. Thai is the primary language.

- **Display** (`--font-display`, Tailwind `font-display`, and all `h1–h6`):
  **Trirong** — an elegant high-contrast Thai+Latin serif. Weights 400 / 600.
  Editorial and characterful; the deliberate move away from generic geometric
  sans. Headings are `font-weight: 400` (600 only for rare emphasis),
  `line-height: 1.2`.
- **Body / UI** (`--font-sans` = `--font-serif` = default `body`): **Anuphan** —
  a clean, modern, loopless Thai+Latin sans. Weights 400 / 500 / 600 / 700.
  Quiet and highly legible for forms, labels, and running text.

Heading scale stays utility-driven per page (h1 `text-3xl`–`text-4xl`, section
titles `text-2xl`). Never apply negative letter-spacing — it breaks Thai.

## Signature Elements

- **Prism medallion** (home): a slowly-rotating conic spectral ring + blurred
  rotating glow, with the member's points shimmering (`text-spectrum`) at centre.
  The one thing people remember.
- **Spectral beam**: a flowing 1px `--gradient-spectrum` rule under the header
  (`animate-spectrum-flow`) and as the footer divider — the brand throughline.
- **Gradient-clipped text** (`.text-spectrum` / `.text-brand`): hero greeting
  name, success headline, points awarded.
- **Radiant check-in celebration**: 12 spectral light rays bursting from behind
  a glowing prism ring with a drawn-on (`pathLength`) gradient checkmark.
- **Section titles**: a short vertical spectral bar precedes the text.
- **Page headers** (`PageHeader`): small spectral eyebrow + serif title + a
  centered prism underline.

## Layout, Spacing & Shape

- Centered, single mobile-first reading column; `<main>` is `max-w-2xl`,
  `pt-28` to clear the fixed header. Consistent `p-4` / `gap-3–4`.
- `--radius: 1rem`; cards `rounded-2xl`, buttons/inputs `rounded-xl`. Borders are
  hairline, low-contrast, and translucent in dark.
- Vertical rhythm via `space-y-*` (home uses `space-y-12` between major bands).
- **Cards** are lifted, not boxed: `bg-card/70` + `backdrop-blur-sm` + a soft
  layered shadow; interactive cards add `hover:-translate-y-0.5` and a spectral
  shadow/border tint.

## Backgrounds & Texture

Never a flat fill. Every page sits on:
- **Aurora mesh** (`.bg-aurora`): three fixed spectral radial gradients + two
  large blurred floating orbs (`@keyframes float`), stronger in dark.
- **Film grain** (`.bg-grain`): a fixed SVG `feTurbulence` overlay at low opacity
  (`soft-light` in light, `overlay` in dark) for tactile depth.

## Components & Patterns

- **Button**: `primary` = `--gradient-brand` with a hover sheen sweep + colored
  shadow; `destructive` = solid error-accent + sheen; `secondary` / `outline` /
  `ghost` quiet. Spectral focus ring.
- **Callout**: translucent filled panel + inset ring; variants `default`,
  `accent`, `muted`, `success`, `error`.
- **Inputs**: translucent card fill, hairline border, spectral focus glow
  (`.ring-spectral`).
- **EmptyState**: dashed panel with a faint spectral wash and a circular icon.
- **Spinner**: `SpectralRing` — a masked, hollow, spinning conic-gradient ring.
- **EventCard**: a spectral left edge; lifts and tints on hover.
- **Lists / pills**: `+10` points render as a soft success pill; rose markers.

## Motion

Subtle, scroll-driven, and reserved for high-impact moments (Motion / Framer
Motion v12, `motion/react`). All custom CSS animations + the aurora orbs respect
`prefers-reduced-motion`.

- **Header**: shrinks on scroll (96→60px), logo scales down inside a rotating
  spectral halo, a blurred translucent background fades in.
- **Spectral flow**: gradients drift via `background-position`
  (`animate-spectrum-flow`); the medallion glow and halo spin slowly
  (`animate-spin-slow`); orbs `float`; glows `glow`-pulse.
- **Home load**: a single orchestrated staggered fade-up of each section.
- **Check-in**: spring-in prism ring, staggered ray burst, path-drawn check.
- Elsewhere, transitions are short (150–200ms) and limited to
  color / transform / opacity.
