# Website — offene Punkte

Stand: 2026-09-11. Erledigtes steht im Git-Log (`git log --since=2026-09-09`).
Reihenfolge ist Empfehlung: erst Struktur, dann Frameworks, dann Kür.

---

## 1. URL-basiertes i18n — der eine große Brocken

**Stand 2026-09-10: umgesetzt und auf `main` gemerged** (Branch `i18n-routes`,
16 Commits, jeder baut). Alles unten Beschriebene ist drin: `/{lang}/…` für sechs Sprachen,
Middleware (302 für `/`, 301 für alte URLs, Cookie nur bei Same-Origin-Referer),
`<html lang>`, hreflang + `x-default`, Sitemap mit allen Varianten, Metadaten pro
Sprache, Server-Rendering ohne Provider, `Article.translations` nach dem Vertrag,
alle UI-Texte, Event-Texte, Alt-Texte; Rechtstexte in de/en (siehe unten). Weitere
Entscheidungen: Portugiesisch ist **pt-BR**; ein untranslatierter Artikel bekommt
`canonical` auf `/en/…` und `<article lang="en">`; übersetzte 404-Seite.

**Rechtstexte** (entschieden 2026-09-10, Jürgen): Datenschutz und AGB gibt es
nur auf **Deutsch und Englisch**. `/de/…` zeigt Deutsch, alle anderen Sprachen
zeigen das englische Dokument mit Hinweis, Canonical auf `/en/…`, hreflang nur
für en/de, kein Sitemap-Eintrag (`src/lib/i18n/legal/`). Die deutsche Fassung
wurde am 2026-09-10 von Jürgen freigegeben.

**Artikel:** Die fünf Artikel von vor dem Press Tool (RENNSPORT, VCO Infinity,
ERL, Sim Racing Expo, IMSA) wurden einmalig händisch in de/es/pt/fr/it
übersetzt. Der MOZA-Artikel kam per PR #5 aus dem Press Tool in sechs Sprachen;
ab jetzt liefert das Tool jeden Artikel sechssprachig im selben PR und
veröffentlicht erst, wenn alle fünf Übersetzungen seine Prüfungen bestanden haben.
`preview.article_path` steht auf `/en/news/{slug}`.

**Merge auf `main`: 2026-09-10.** Danach offen:

- [ ] In der Google Search Console die Sitemap `https://racespot.tv/sitemap.xml`
  erneut einreichen; die alten URLs leiten per 301 weiter. Nach ein paar Tagen
  unter „Seiten" prüfen, ob die Sprachvarianten indexiert sind.
- [ ] Press Tool wieder auf `main` mit Auto-Merge stellen (Philips Session; sie
  wartet auf die Nachricht, dass `i18n-routes` auf `main` ist).

**Entschieden am 2026-09-10 (Jürgen):** sechs Sprachen (EN, DE, ES, PT, FR, IT),
**alle vollständig indexiert**, News-Artikel werden vom Press Tool in alle sechs
Sprachen geliefert. Arabisch/Chinesisch bewusst nicht (RTL-Umbau, eigene Fonts,
Muttersprachler-Review — später, wenn gewünscht). Ziel ist gute Auffindbarkeit
außerhalb Deutschlands/Europas, Aufwand ist zweitrangig gegenüber Sauberkeit.

**Problem.** Sprache wird im Browser aus `localStorage` gelesen; der Server rendert
immer Englisch. Folgen: Besucher sehen kurz Englisch (Flash), Google indexiert
**ausschließlich Englisch**, und 27 Komponenten müssen `'use client'` sein, nur um
`t()` aufzurufen.

**Lösung.** Sprache in die URL, alle sechs mit Präfix: `/en/…`, `/de/…`, `/es/…`,
`/pt/…`, `/fr/…`, `/it/…`. `/` erkennt `Accept-Language` (Cookie merkt die Wahl) und
leitet auf die passende Sprache; `x-default` zeigt auf `/en/`. Server rendert pro
Sprache; `hreflang` für alle sechs auf jeder Seite; `<html lang>` korrekt; Sitemap
mit allen Sprachvarianten; OG-Metadaten pro Sprache. Die meisten Komponenten werden
wieder Server Components; `LanguageProvider`/`localStorage` entfallen.

**Alte URLs** (`/news/<slug>`, `/services`, …) → **301** auf `/en/…` (bestehende
Google-Treffer, LinkedIn-/X-Posts des Press Tools).

**Was heute schon übersetzt ist:** ~230 UI-Texte in `src/lib/i18n/translations.ts`.
**Noch nicht:** News-Artikel, Datenschutz, AGB, Impressum, Event-Texte
(`src/app/events/page.tsx`), Metadaten (`title`/`description` je Seite). Alles
davon muss mit — sonst gibt es gemischtsprachige Seiten, die in keiner Sprache
ranken. Rechtstexte: Übersetzung liefern, Freigabe durch Menschen.

### Datenvertrag Website ↔ Press Tool (gilt für beide Sessions)

`Article` in `src/lib/articles.ts` bleibt **ein Objekt pro Artikel** mit einem
stabilen, englischen `slug`, der in allen Sprachen identisch ist
(`/de/news/<slug>` = `/en/news/<slug>`). Die englische Fassung bleibt in den
bestehenden Feldern; die anderen fünf kommen in ein neues Feld:

```ts
type Lang = 'en' | 'de' | 'es' | 'pt' | 'fr' | 'it'

interface ArticleTranslation {
  title: string
  excerpt: string
  imageAlt: string
  content: Block[]          // gleiche Block-Typen, gleiche Inline-Syntax (**, *, [](url))
  readTime?: string         // weglassen = englischer Wert
}

interface Article {
  // … bestehende Felder unverändert (englisch) …
  translations?: Partial<Record<Exclude<Lang, 'en'>, ArticleTranslation>>
}
```

Regeln:
- Fehlt eine Sprache, rendert die Website den englischen Text **und setzt für
  diese Sprache kein `hreflang`** — niemals eine halbübersetzte Seite indexieren.
- `category`, `date`, `image`, `imageCredit`, `author`, `sources` sind
  sprachneutral und stehen nur einmal. Kategorienamen übersetzt die Website über
  `translations.ts`.
- Bild-`credit` in `Block`-Bildern bleibt sprachneutral; `alt` wird übersetzt.
- Das Press Tool liefert alle fünf Übersetzungen **im selben PR** wie den
  englischen Artikel. `preview.article_path` in
  `~/Press Tool/projects/racespot/project.yaml` wird `/en/news/{slug}` (die
  Social-Links bleiben englisch; Leser landen über `/en/` und können umschalten).

**Aufwand.** 3–4 Tage Website (eigener Branch `i18n-routes`, nicht auf `main` —
Push auf `main` deployt sofort). Press Tool parallel möglich, weil der Vertrag
oben steht; mergen erst, wenn die Website `translations` liest.

## 2. Framework-Upgrades — jetzt dringend (Stand 2026-09-11)

**2a — Next 14.2 → 15.5 + React 19 (sicherheitsrelevant, als Nächstes).**
`npm audit` zeigt für 14.x Advisories, deren Fix nur in **15.5.x** existiert; die
14er-Linie bekommt sie nicht mehr: *critical* RCE in der Image-Optimization-API bei
AVIF-Eingaben (Fix ≥ 15.5.24), *high* SSRF in Server Actions/Rewrites, mehrere DoS
über Server Components, Middleware-Bypass. Exposition begrenzt (kein AVIF-Output,
`/_next/image` nur lokale Pfade + YouTube-Thumbnails, keine Rewrites, Linux) — aber
kein Dauerzustand. Nicht direkt auf 16 (Turbopack-Default, `middleware`→`proxy`,
mehr Breaking Changes); 15.5 ist die Linie mit Fixes. Eigener Branch `next-15`,
alle sechs Sprachen + beide Kontakt-Tabs prüfen, dann mergen. ½–1 Tag.

**2b — später:** Next 16, Tailwind 3 → 4, framer-motion 11 → 13, ESLint 8 → 9
(Flat Config). Echte Migrationen, kein Zeitdruck.

## 3. Umami-Analytics einschalten

**Server (Philip / Coolify).** `stats.racespot.tv` zeigt korrekt auf den Server, aber
Traefik liefert sein Default-Zertifikat und **503** — der Umami-Container ist nicht
erreichbar. Prüfen: läuft er, ist er healthy, Domain in Coolify **mit `https://`**
eingetragen (sonst kein Let's Encrypt).

**Website.** In Umami Website `racespot.tv` anlegen, ID kopieren, in Coolify beim
Website-Projekt `NEXT_PUBLIC_UMAMI_SRC=https://stats.racespot.tv/script.js` und
`NEXT_PUBLIC_UMAMI_WEBSITE_ID=<ID>` setzen, redeployen. Die Komponente
`src/components/seo/Analytics.tsx` rendert das Script dann automatisch (vorher: nichts).
UTM-Tags aus dem Press Tool erscheinen in Umami direkt als Quelle.

**Datenschutzerklärung** (`src/app/privacy/page.tsx`) im selben Zug bereinigen — siehe 4.

## 4. Datenschutzerklärung und Impressum inhaltlich prüfen

`privacy/page.tsx` ist datiert „April 20, 2024" und nennt **Google Analytics, Google
Tag Manager, etracker, Matomo, Facebook Pixel**, Newsletter mit Web-Beacons und
Kundenkonten — nichts davon existiert auf der Seite. Das ist eine Vorlage, kein
Abbild der Realität. Braucht eine inhaltliche Entscheidung (was nutzt ihr wirklich?),
dann Text anpassen, Datum setzen. Cookies: die Seite setzt aktuell **keine** außer
Turnstile-Cookies von Cloudflare und `localStorage` für die Sprache.

## 5. Kontaktformular in Produktion einmal echt durchtesten

Formulare am 2026-09-11 überarbeitet (Website/Adresse optional, Dropdowns für
Rennen 1–30 und Dauer h/min, übersetzte Feld-Fehlermeldungen, Fehlercodes vom
Server). Ungeprüft bleibt: ob `SMTP_USER`/`SMTP_PASS` in Coolify gesetzt sind. Ohne sie fällt das Formular auf `mailto:` zurück (öffnet das Mailprogramm des
Besuchers) — funktioniert, ist aber nicht das Gewollte. Einmal eine Broadcast-Anfrage
absenden und prüfen, ob sie bei `contact@racespot.tv` **und** als Kopie beim Absender
ankommt. Falls nicht: Env-Vars in Coolify setzen (Namen in `.env.example`).

## 6. Inhalte, die jährlich veralten

- `StatsBar` / About: „400+ Broadcasts", „100M+ Impressions", „6.2M+ YouTube Views" —
  hartcodiert in `src/components/sections/StatsBar.tsx` und `src/app/about/page.tsx`.
  Einmal im Jahr prüfen.
- `src/app/events/page.tsx`: Past Events hartcodiert; neue Events kommen nur per Code.
  Reicht, solange es 1–2 pro Jahr sind.
- `Team.tsx`: drei Personen, Bios in `translations.ts`.
- JSON-LD `foundingDate: '2013'`, Adresse Hürth — ok, nur bei Umzug/Umfirmierung ändern.

## 7. Coolify-Hausmeisterei

- ~~Tote zweite Website-App löschen~~ — erledigt 2026-09-09.
- Lokaler Branch `analytics-page-views` (04.08., 1 Commit, weit hinter `main`; der
  alte Zähl-Endpunkt-Versuch, ersetzt durch Umami) kann gelöscht werden.
- Optional: persistentes Volume für `/app/.next/cache/images`. Der Cache wird beim
  Start ohnehin vorgewärmt (~30–60 s nach Deploy); ein Volume spart nur diese Minute.
- Philips `~/Press Tool/projects/racespot/NOTES.md` sagt noch „a merge does not build" —
  stimmt nicht mehr, Deploy läuft über den Repo-Webhook (siehe `CLAUDE.md`, Deployment).

## 8. Kleinere technische Punkte

- `/live` hat `force-dynamic` und braucht beim ersten Aufruf ~1,3 s (YouTube-Live-Check
  serverseitig). Akzeptabel; wenn es stört: Live-Erkennung komplett in den Client
  (der pollt ohnehin alle 60 s) und die Seite statisch machen.
- `CalendarClient.tsx` (619 Zeilen, framer-motion) ist die größte Client-Komponente
  (41 kB). Kandidat für Aufteilen, wenn man sowieso beim i18n-Umbau drin ist.
- ESLint läuft jetzt (`npm run lint`), war vorher nie konfiguriert. Bei Gelegenheit als
  Pre-Commit-Hook oder im Coolify-Build (`npm run lint && next build`) verankern.
