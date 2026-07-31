# Racespot Website

Next.js (App Router) + Tailwind + next-i18next. `npm run dev` for local work
(see `.claude/launch.json`).

Remotes: `origin` = `RMH-Digital/racespot-website-claude` (the working repo — the
old `JuergenRacespot/...` URL only redirects). `production` still points at
`JuergenRacespot/racespot-gg`, whose `main` holds an unrelated history — do not
push there without checking what it actually is.

## Layout

- `src/app/` — routes (`news`, `news/[slug]`, `broadcasts`, `calendar`, `events`,
  `services`, `live`, `api/contact`, `api/live-streams`).
- `src/components/` — `sections/`, `layout/`, `ui/`, `seo/`.
- `src/lib/articles.ts` — **all news articles live here, hardcoded** (see below).
- `src/lib/i18n/` — translations. `public/` — images, fonts.

## Design tokens

Defined in `tailwind.config.ts` under `colors.rs` — don't hardcode hex values in
components: `yellow #F5C000`, `black #0A0A0A`, `dark #111111`, `gray #1A1A1A`,
`muted #777777`, `border #2A2A2A`, `live #E53E3E`. Fonts: `font-sans` = Inter,
`font-display` = Eurostile → Oswald → Arial Black.

## Fonts — has a known trap

The Eurostile `@font-face` rules in `src/app/globals.css` must point at the
`.woff2` files, never the `.ttf` (those are rejected by browsers and the failure
is silent). **Read `docs/FONTS.md` before touching them.**

## News articles

`src/lib/articles.ts` exports `ARTICLES: Article[]`, rendered by
`src/app/news/[slug]/page.tsx`. Adding an article = adding an object to that
array (newest first; `generateStaticParams` picks up slugs automatically).

```ts
interface Article {
  slug: string; category: string; title: string; excerpt: string
  date: string; readTime: string; image: string; imageAlt: string
  imageCredit?: string  // shown bottom-right on the hero
  author?: string       // byline; omitted = no byline shown
  sources?: { label: string; url: string }[]   // recorded, NOT rendered
  content: string[] | Block[]
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'image'; src: string; alt: string; credit?: string }
```

Read `content` through `toBlocks()` from `src/lib/articleContent.tsx`, never
directly — it normalises both shapes. A `string[]` still means "plain
paragraphs", so every article written before blocks existed works untouched;
articles 2 onwards in the array are exactly that.

`text` may carry three inline constructs and no others: `**bold**`, `*italic*`
and `[label](url)`. They are parsed into React elements by `renderInline()`.
**Never** switch this to `dangerouslySetInnerHTML`: article text comes from an
automated pipeline reading third-party feeds, so it has to stay text, not
markup. If a fourth construct is ever needed, add it to that parser.

`category` must be a key of `CATEGORY_COLORS` (Events, Broadcast, Esports,
Motorsport, Industry, Company) — a category that is not a key renders without a
colour. The Press Tool pipeline (`~/Press Tool`) mirrors this list in each
project's `preview.categories`; add a category in both places or not at all.

### What the body can carry (changed 2026-07-31)

Sub-headings, pull quotes, inline links, several images and a byline — all of it,
via `Block[]`. Before this the type was `content: string[]` and the renderer was
`content.map(p => <p>{p}</p>)`, which silently flattened everything the Press
Tool pipeline (`~/Press Tool`) writes: 2-4 sub-headings and up to 5 quotes per
article were being thrown away on the way in.

Styling deliberately matches that pipeline's own review preview, so what a
reviewer approves is what a reader gets:

| Block | Treatment |
|---|---|
| `h2` | display font, short yellow rule above (`before:` pseudo-element) |
| `quote` | 3px yellow left edge, yellow-tinted gradient fading right, attribution line under it |
| `image` | full-width figure, caption from `alt`, credit in mono after it |
| `p` | unchanged from before |

`sources` is carried but **not rendered**: RaceSpot keeps the origin as an
editorial record and in the Press Tool review panel, not under the article. Same
for the AI notice, which is why you will not find one here. Do not "helpfully"
add either to the page — see `editorial.link_sources_in_body` and
`editorial.ai_notice_enabled` in the pipeline's project config.
