# Website — offene Punkte

Stand: 2026-09-10. Was heute erledigt wurde, steht im Git-Log (`git log --since=2026-09-09`).
Reihenfolge ist Empfehlung: erst Struktur, dann Frameworks, dann Kür.

---

## 1. URL-basiertes i18n — der eine große Brocken

**Stand 2026-09-10: umgesetzt auf Branch `i18n-routes`** (neun Commits, jeder
baut). Alles unten Beschriebene ist drin: `/{lang}/…` für sechs Sprachen,
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
übersetzt. Der MOZA-Artikel bleibt englisch, bis das Press Tool ihn mit
`translations` neu ausspielt; künftige Artikel kommen mehrsprachig aus dem Tool.

**Bevor der Branch auf `main` geht:**

- [x] Deutsche Rechtstexte freigegeben (2026-09-10). Wenn Punkt 4 den Inhalt
  ändert: en und de zusammen nachziehen.
- [ ] **Press Tool:** `preview.article_path` in
  `~/Press Tool/projects/racespot/project.yaml` auf `/en/news/{slug}` setzen und
  `translations` im selben PR liefern (Vertrag unten). Bis dahin rendern die
  fünf anderen Sprachen den englischen Text ohne hreflang — das ist gewollt.
- [ ] Nach dem Deploy in der Google Search Console die Sitemap
  `https://racespot.tv/sitemap.xml` erneut einreichen; die alten URLs leiten per
  301 weiter.

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

## 2. Framework-Upgrades — nach Punkt 1

Next 14.2 → 16, React 18 → 19, Tailwind 3 → 4, framer-motion 11 → 13, ESLint 8 → 9
(Flat Config). Jeweils echte Migrationen mit Breaking Changes. Erst i18n, sonst
migriert man Code, der gleich danach umgebaut wird. Next 14.2.35 ist sicherheitsseitig
aktuell; kein Zeitdruck.

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

Beide Formulare sind live. Ungeprüft: ob `SMTP_USER`/`SMTP_PASS` in Coolify gesetzt
sind. Ohne sie fällt das Formular auf `mailto:` zurück (öffnet das Mailprogramm des
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

- **Tote zweite Website-App löschen**: UUID `i11m6pnwhz85y8oqyfrkuipm`
  (Status *exited*, sslip.io-Domain, alte Repo-URL, seit 16.03. unberührt). Danger Zone
  → Delete. Nicht `tpd5h47i…` — das ist die echte.
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
