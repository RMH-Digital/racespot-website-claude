# Website — offene Punkte

Stand: 2026-09-14 (Upgrade und News-Umbau live). Erledigtes steht im Git-Log (`git log --since=2026-09-09`).
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

## 2. Framework-Upgrades

**2a — Next 15.5 + React 19: erledigt 2026-09-14.** Next 14.2 bekam die Fixes
nicht mehr; `npm audit` ging von 13 Funden (1 kritisch: RCE in der
Image-Optimization-API, dazu SSRF und mehrere DoS) auf **2**, und Next steht
nicht mehr darunter. Migration: `params` ist ein Promise (15 Seiten + Layout),
`headers()` ebenfalls, framer-motion auf 13. Nebenbei `target: ES2017` in der
tsconfig und `outputFileTracingRoot` gepinnt — eine verirrte `package-lock.json`
im Home-Verzeichnis ließ Next die falsche Projektwurzel raten. Build-Zeit von
~20 s auf 3,5 s.

**2b — offen, kein Zeitdruck:** Next 16 (Turbopack als Standard,
`middleware` → `proxy`), Tailwind 3 → 4, ESLint 8 → 9 (Flat Config). Die zwei
verbliebenen Audit-Funde (moderate + high in postcss, beide über Next
transitiv) verschwinden erst mit Next 16.

## 3. Umami-Analytics — eingeschaltet 2026-09-11

Instanz: `https://stats.apps.racespot.tv` (Let's Encrypt, healthy). Website
`racespot.tv`, ID `0e77e402-57dd-4a86-ad05-334961f02de7`. Script-URL und ID stehen
als Defaults in `src/components/seo/Analytics.tsx` (öffentliche Werte); nur
Production-Builds rendern das Tag, `data-domains` ignoriert fremde Hostnames.
Abschalten: `NEXT_PUBLIC_UMAMI_DISABLED=1` in Coolify. UTM-Tags des Press Tools
erscheinen in Umami als Quelle.

Rest: Der alte DNS-Eintrag `stats.racespot.tv → 178.104.72.17` zeigt ins Leere
(503) und kann bei All-Inkl gelöscht werden.

## 4. Datenschutzerklärung — neu geschrieben 2026-09-14

Der alte Text war eine Webshop-Vorlage: Er nannte PayPal, Stripe, Mailchimp,
CleverReach, Help Scout, Google Analytics, Tag Manager, Google Ads, etracker,
Matomo, Facebook Pixel, einen Newsletter mit Double-Opt-in, Kundenkonten,
Bonitätsprüfung, Profiling, Cross-Device-Tracking und ein Cookie-Banner —
nichts davon existiert. Gleichzeitig fehlten **Cloudflare Turnstile** und die
**YouTube-Einbindungen** komplett, also genau die zwei Dienste, bei denen
tatsächlich Daten an Dritte fließen.

Neu beschrieben ist, was die Seite wirklich tut: Hetzner-Logfiles, Umami
(cookielos, selbst gehostet), Turnstile am Formular (IP → Cloudflare, USA),
YouTube (`/live` regulär, `/events` im No-Cookie-Modus), E-Mail über
Microsoft 365, Sprach-Cookie, selbst gehostete Schriften, Social-Icons als
reine Links. Dazu Rechtsgrundlagen, Speicherfristen, Widerspruchsrecht und die
zuständige Aufsichtsbehörde (LDI NRW). Deutsch und Englisch parallel.

**Regel ab jetzt:** Ein neues Skript, Embed oder Tracker heißt, diese Datei im
selben Commit zu ändern (steht als Kommentar in `legal/privacy.ts`).

**Impressum** (`src/app/[lang]/imprint/page.tsx`): geprüft, inhaltlich korrekt
(Anschrift, Geschäftsführer, AG Köln HRB 118561, Kontakt). Keine Änderung nötig.
Die USt-IdNr. fehlt — falls vorhanden, gehört sie nach § 5 Abs. 1 Nr. 6 TMG dazu.

## 4b. AGB → Nutzungsbedingungen, ersetzt 2026-09-14

**Entscheidung Jürgen (Variante b):** Die Webshop-AGB sind raus, an ihrer Stelle
stehen Nutzungsbedingungen für die Website. Die alten Klauseln beschrieben
Bestellvorgang, Versandkosten, Lieferung, Zahlung, Eigentumsvorbehalt,
Kundenkonto und Produktgewährleistung — nichts davon findet auf racespot.tv
statt. Produktionsaufträge laufen weiter über Einzelverträge, die der neue Text
ausdrücklich unberührt lässt.

Neuer Inhalt: Geltungsbereich, „nichts hier ist ein verbindliches Angebot",
Urheberrecht an Texten/Fotos/Videos (inkl. Verbot des systematischen Auslesens
zum KI-Training), Marken Dritter, redaktionelle Inhalte ohne Richtigkeitsgewähr,
Inhalte Dritter und Links (§§ 7–10 DDG), Verfügbarkeit, gestufte Haftung,
Verweis auf den Datenschutz, Änderungen, Recht und Gerichtsstand Köln,
salvatorische Klausel. Deutsch und Englisch.

Umbenannt: `footer.terms` und `meta.terms.*` heißen in allen sechs Sprachen
jetzt „Nutzungsbedingungen" / „Terms of Use" statt „AGB".

**Nebenbefund, mit erledigt:** Das Impressum verlinkte die
EU-Online-Streitbeilegungsplattform, die **am 20. Juli 2025 abgeschaltet**
wurde — toter Link und falsche Aussage. Entfernt; die Erklärung nach § 36 VSBG
(keine Teilnahme an Verbraucherschlichtung) bleibt.

- [ ] **Beide Texte lesen und freigeben.** Die frühere deutsche AGB-Fassung war
  von Jürgen freigegeben; diese hier ist neu und ungelesen. Für Haftungs- und
  Urheberrechtsklauseln ist eine anwaltliche Durchsicht ratsam — sie stehen
  bewusst konservativ, aber ich bin keine Rechtsberatung.
- [ ] USt-IdNr. im Impressum ergänzen, falls vorhanden (§ 5 Abs. 1 Nr. 6 DDG).

## 5. Kontaktformular in Produktion einmal echt durchtesten

Formulare am 2026-09-11 überarbeitet (Website/Adresse optional, Dropdowns für
Rennen 1–30 und Dauer h/min, übersetzte Feld-Fehlermeldungen, Fehlercodes vom
Server). Ungeprüft bleibt: ob `SMTP_USER`/`SMTP_PASS` in Coolify gesetzt sind. Ohne sie fällt das Formular auf `mailto:` zurück (öffnet das Mailprogramm des
Besuchers) — funktioniert, ist aber nicht das Gewollte. Einmal eine Broadcast-Anfrage
absenden und prüfen, ob sie bei `contact@racespot.tv` **und** als Kopie beim Absender
ankommt. Falls nicht: Env-Vars in Coolify setzen (Namen in `.env.example`).

## 5b. News-Darstellung — erledigt 2026-09-14

Startseite: Der News-Abschnitt sitzt jetzt direkt über „Partner & Netzwerke"
und führt mit dem neuesten Artikel als breiter Karte, darunter die nächsten
drei im bisherigen Kartenstil. Zweispaltig erst ab 1024 px.

News-Seite: Kategoriefilter über der Liste (`NewsBrowser.tsx`, die einzige
Client-Komponente dort). Der Server übersetzt und übergibt eine schlanke Form
**ohne Artikeltexte** — sonst landeten alle Artikelinhalte im Client-Payload.
Ohne Filter unverändertes Layout, mit Filter kein Feature-Artikel.

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
