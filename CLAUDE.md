# Racespot Website

Next.js (App Router) + Tailwind + next-i18next. `npm run dev` for local work
(see `.claude/launch.json`). Deployed from the `origin` remote
(`racespot-website-claude`); the `production` remote (`racespot-gg`) holds an
unrelated history — check before pushing there.

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
  content: string[]     // one plain-text paragraph per entry
}
```

`category` must be a key of `CATEGORY_COLORS` (Events, Broadcast, Esports,
Industry, Company).

### Known limitations of this shape

`content` is rendered as `content.map(p => <p>{p}</p>)`, so the article body can
carry **only plain paragraphs**. There is no way to express:

- sub-headings inside an article
- blockquotes / pull quotes
- **links inside the body text** (so a "source:" link cannot be clickable)
- more than one image (only the `image` hero)
- an **author byline** — the `Article` type has no author field

This matters for the Press Tool pipeline (`~/Press Tool`), which generates
articles with sub-headings, quotes, per-persona bylines and mandatory source
links for third-party material. Extending `Article` with `author`, `sources` and
a richer `content` type (markdown or block list) is the agreed next step before
that pipeline can publish here.
