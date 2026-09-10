# Racespot Website

Next.js (App Router) + Tailwind + next-i18next. `npm run dev` for local work
(see `.claude/launch.json`).

Remotes: `origin` = `RMH-Digital/racespot-website-claude` (the working repo — the
old `JuergenRacespot/...` URL only redirects). `production` still points at
`JuergenRacespot/racespot-gg`, whose `main` holds an unrelated history — do not
push there without checking what it actually is.

## Layout

Offene Arbeiten mit Begründung und Reihenfolge: [docs/TODO.md](docs/TODO.md).

- `src/app/[lang]/` — every page (`news`, `news/[slug]`, `broadcasts`, `calendar`,
  `events`, `services`, `live`, `about`, `contact`, `privacy`, `terms`, `imprint`);
  its `layout.tsx` is the root layout. `src/app/api/` and `sitemap.ts` stay outside.
- `src/middleware.ts` — language resolution and redirects (see i18n below).
- `src/components/` — `sections/`, `layout/`, `ui/`, `seo/`.
- `src/lib/articles.ts` — **all news articles live here, hardcoded** (see below).
- `src/lib/i18n/` — `translations.ts` (UI strings), `index.ts` (`t()`, locales,
  path helpers), `langs.ts` (dependency-free constants for the middleware),
  `seo.ts` (metadata/hreflang), `legal/` (privacy + terms as data).
- `public/` — images, fonts.

## i18n — URL-based, six languages

Every page lives under `/{lang}/…` with `lang` ∈ `en de es pt fr it`, all six
fully indexed. Decisions and the Press Tool contract: [docs/TODO.md](docs/TODO.md)
item 1. The rules that are easy to break:

- **The language is a route param, nothing else.** No context, no
  `localStorage`. Server components get `lang` as a prop and call
  `t(lang, key)` / `getT(lang)` from `@/lib/i18n`. The few client components
  (Header, Ticker, CalendarClient, BroadcastsClient, ContactForm, LiveEmbed,
  LiveOffline, VideoCard, LiveBanners, Hero) get `lang` handed in too.
- **Internal links go through `localePath(lang, '/news')`.** A bare
  `href="/news"` still works (the middleware 301s it to `/en/news`) but lands
  the reader in the wrong language — grep for `href="/` before committing.
- **Middleware** (`src/middleware.ts`): `/` → 302 to cookie / Accept-Language /
  `en` (with `Vary`); old URLs → 301 to `/en/…`; the `racespot-lang` cookie is
  set only when the visitor navigated within the site (same-origin Referer), so
  an external deep link never overwrites a choice. `langs.ts` exists so the
  middleware does not bundle the dictionary.
- **Metadata**: every page has `generateMetadata` built with
  `staticPageMetadata()` / `pageMetadata()` from `seo.ts`, which emits title,
  description, canonical, one `hreflang` per language plus `x-default` (→ `/en/`),
  `og:locale` and `og:url`. Titles/descriptions are `meta.*` keys in
  `translations.ts`. Next replaces nested `openGraph` instead of merging it, so
  pages state the whole object (the helper does).
- **Portuguese is pt-BR** (the copy is Brazilian): `hreflang="pt"`, `og:locale`
  `pt_BR`, dates via `pt-BR`.
- **Articles**: `localizeArticle(article, lang)` picks the translation or falls
  back to English; `articleLangs(article)` lists the languages that exist. An
  untranslated language renders English with canonical → `/en/…`, no `hreflang`,
  no sitemap entry, `<article lang="en">` and a one-line notice.
- **Sitemap** lists every page × language with `xhtml:link` alternates; articles
  only in the languages they exist in.
- **Legal texts** (`legal/privacy.ts`, `legal/terms.ts`): one `LegalDoc` per
  language, rendered by `LegalDocument`. The five translations are marked
  `REVIEW` — not approved by a person yet.

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
  slug: string; category: string; title: string; excerpt: string   // English
  date: string; readTime: string; image: string; imageAlt: string
  imageCredit?: string  // shown bottom-right on the hero
  author?: string       // byline; omitted = no byline shown
  sources?: { label: string; url: string }[]   // recorded, NOT rendered
  content: string[] | Block[]
  translations?: Partial<Record<'de'|'es'|'pt'|'fr'|'it', ArticleTranslation>>
}

interface ArticleTranslation {
  title: string; excerpt: string; imageAlt: string
  content: Block[]      // same block kinds, same inline syntax
  readTime?: string     // omitted = English value
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'image'; src: string; alt: string; credit?: string }
```

Read the text fields through `localizeArticle(article, lang)` from
`src/lib/articleContent.tsx`, never directly — it picks the language, falls back
to English and normalises both `content` shapes (`toBlocks()` underneath). The
`slug` is English and identical in all languages; `category`, `date`, `image`,
`imageCredit`, `author`, `sources` and block-image `credit`s are stored once.
Keep the line `export const ARTICLES: Article[] = [` exactly as it is — the
Press Tool finds the array by that text. A `string[]` still means "plain
paragraphs", so every article written before blocks existed works untouched;
articles 2 onwards in the array are exactly that.

`text` may carry three inline constructs and no others: `**bold**`, `*italic*`
and `[label](url)`. They are parsed into React elements by `renderInline()`.
**Never** switch this to `dangerouslySetInnerHTML`: article text comes from an
automated pipeline reading third-party feeds, so it has to stay text, not
markup. If a fourth construct is ever needed, add it to that parser.

`category` must be a key of `CATEGORY_COLORS` (Events, Broadcast, Esports,
Motorsport, Industry, Company) — a category that is not a key renders without a
colour, and its name is translated through `category.<Name>` in
`translations.ts` (missing key = shown as is). The Press Tool pipeline
(`~/Press Tool`) mirrors this list in each project's `preview.categories`; add a
category in all three places or not at all.

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

## Deployment

Hosting ist **Coolify** auf Philips Hetzner-Server (`178.104.72.17`), App-UUID
`tpd5h47i4341j7qp6wemae8r`, Nixpacks, Node 20 (`engines` + `.nvmrc`). Es gibt
keinen anderen Hoster und keine andere Deploy-Pipeline.

**Push auf `origin/main` = Deploy.** Ein Webhook am GitHub-Repo
(`Settings → Webhooks`, Ziel `https://coolify.racespot.tv/webhooks/source/github/events/manual`)
stößt den Build an; Press-Tool-Merges laufen denselben Weg. Ein Build dauert
~1 min (gecacht) bis ~3 min (kalt). Prüfen: `curl -sI https://racespot.tv/ | grep -i strict-transport`
muss die Header aus `next.config.mjs` zeigen; die Deployment-Historie liest sich
über die Coolify-API (`/api/v1/deployments/applications/<uuid>`, Token liegt lokal
in `~/.config/presstool/coolify-token`, nie im Repo).

`npm start` ist `scripts/start.mjs`: startet `next start` und wärmt danach den
`next/image`-Cache (`scripts/warm-image-cache.mjs`) — der Cache liegt im
Container und ist nach jedem Deploy leer. Ohne Vorwärmen zahlt der erste
Besucher jeder Bildvariante den Encode.

### Bilder

- `public/images` enthält **nur** Dateien, die in `src/` referenziert sind.
  Neue Fotos vor dem Commit durch `npm run optimize-images` schicken (≤ 1920 px,
  JPEG q82, in place) — der Optimizer muss die Quelle sonst bei jeder Variante
  voll dekodieren.
- `next/image` liefert **nur WebP**. Kein AVIF: gemessen 1,6–2,9 s pro kaltem
  Encode auf dem geteilten Server gegen 0,16 s WebP, für ~10 % kleinere Dateien.
- `deviceSizes` in `next.config.mjs` und `WIDTHS` in `scripts/warm-image-cache.mjs`
  müssen übereinstimmen.

## Platform

Dieses Projekt läuft auf Philips Coolify-Instanz. Betriebsregeln, Domain- und
TLS-Setup, Verifikationsbefehle und bekannte Fallstricke stehen in
[COOLIFY-BASELINE.md](COOLIFY-BASELINE.md) — vor Infrastruktur-Eingriffen lesen.
