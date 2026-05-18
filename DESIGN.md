# Design Theme — "Rainbow Stream" Style

  A warm, calm, editorial design built around an LGBTQ+ affirming identity.
  The aesthetic is gentle and welcoming rather than loud: soft pink/rose accents,
  generous whitespace, centered reading column, and quiet motion.

  ## Color System

  Colors are defined as CSS custom properties in `oklch()` and exposed to
  Tailwind v4 via `@theme inline`. Light and dark themes are full peers
  (`.dark` class, system-default, user-toggleable).

  Neutrals are near-perfectly desaturated grays (a hint of violet, ~285° hue).
  The brand identity comes from a **rose / pink accent family** (hues ~330–350°).

  Semantic tokens (use these, not raw colors):
  - `background` / `foreground` — page base; pure white in light, near-black in dark
  - `headings` — rose/magenta; all headings are tinted, never plain black
  - `accent` / `accent-foreground` — soft pink callout background + rose text
  - `shade` — very subtle gray fill for default callout boxes
  - `muted` / `muted-foreground` — low-emphasis surfaces and text
  - `success` (green family) and `error` (red family) — each has base / accent / foreground
  - `quotes` / `quotes-border` — rose-tinted text + soft pink left border for blockquotes
  - `decoration` — bright pink, used for list markers/bullets
  - `link` / `link-hover` / `link-underline` — a blue family, distinct from the rose brand
  - ShadCN tokens present: `card`, `popover`, `primary`, `secondary`, `border`,
    `input`, `ring`, `sidebar-*`, `chart-1..5`

  Principle: brand warmth = rose; interactive = blue; structure = desaturated gray.

  ## Typography

  Two Google Fonts, loaded as CSS variables, both with Latin + Thai subsets:
  - **Headings** (`--font-headings`, mapped to Tailwind `font-sans`): "Kanit",
    weight 400 only — geometric, light, used for all headings + small labels.
  - **Body** (`--font-body`, mapped to Tailwind `font-serif` and the default
    `body` font): "Noto Sans Thai Looped", weights 400 / 700.

  - Headings are `font-normal` (never bold) and colored with `text-headings`.
  - Heading scale: h1 `text-4xl`, h2 `text-3xl`, h3 `text-2xl`, h4 `text-xl`,
    h5 `text-lg`, h6 `text-md`.
  - Body paragraphs: `leading-7`, vertical rhythm via `not-first:mt-6`.
  - Bilingual-friendly: avoid heavy weights for display; rely on size + color.

  ## Layout

  - Centered, single-column reading experience. Outer page max-width `max-w-5xl`;
    MDX article content constrained tighter to `max-w-2xl` for readability.
  - Desktop: left sticky sidebar nav (`border-r`, `sticky top-18`); hidden below
    `lg`, replaced by a hamburger menu in the header.
  - Consistent `p-4` / `gap-4` page padding; section spacing in multiples of 4/6/8.
  - Header is `fixed`, full-width, with a centered logo.
  - Footer: centered, `border-t`, social brand icons.

  ## Spacing & Shape

  - `--radius: 0.625rem` base; Tailwind radius scale derived from it
    (`sm`, `md`, `lg`, `xl`). Callout boxes use `rounded-xl`.
  - Vertical rhythm leans on `not-first:mt-6` / `mt-8` rather than wrapper margins.
  - Borders are hairline and low-contrast (`border` token); used to divide
    regions (sidebar, header, footer) rather than to box content.

  ## Components & Patterns

  - **Callout box**: rounded-xl filled panel with optional leading/trailing slot;
    variants `default` (shade), `accent` (pink), `muted`, `success`, `error`.
  - **Blockquote**: rose text, 4px soft-pink left border, no background.
  - **Image + text block**: 2- or 3-column grid, image left/right, can render
    as a quote.
  - **Carousel**: horizontal snap-scroll, hidden scrollbar, arrows fade in on
    hover, optional auto-rotate.
  - **Links**: internal vs external auto-detected; underline offset-4,
    `decoration-2`, blue tint; external links append a small external-link icon
    at 50% opacity.
  - **Lists**: pink markers (`marker:text-decoration`).

  ## Motion

  - Subtle and scroll-driven, via Motion (Framer Motion v12, `motion/react`).
  - Signature interaction: header **shrinks on scroll** — logo scales down and
    translates up, header height collapses from 250px → 60px, and a blurred
    translucent background (`backdrop-blur-lg`, gradient `background/90 → /70`)
    fades in. Eased with `easeOut`.
  - Transitions elsewhere are short (`duration-150`) and limited to color/opacity.