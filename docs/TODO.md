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

- [x] Sitemap in der Google Search Console eingereicht (2026-09-14): Status
  **Success**, 106 erkannte Seiten — genau die Zahl, die die Datei enthält.
  In ein bis zwei Wochen unter „Seiten" und „Leistung" nachsehen, ob die
  Sprachvarianten indexiert werden und nicht-englische Suchbegriffe auftauchen.
  Google Business Profile ist angelegt, Verifizierung steht noch aus.
- [x] Press Tool: **war nie offen**. Am 2026-09-14 in der echten Konfiguration
  gegengeprüft — `base_branch: main`, `article_path: /en/news/{slug}`,
  `auto_merge` auf Default (an). Der Eintrag stammte aus der Zeit, als die
  Pipeline kurzzeitig auf `i18n-routes` zeigte, und war danach längst
  zurückgestellt. Der Artikel vom 10.09. belegt, dass sie läuft.

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

## 2. Framework-Upgrades — abgeschlossen

**2a — Next 15.5 + React 19 (2026-09-14).** Schloss die Advisories, die 14.x
nicht mehr bekam; `npm audit` von 13 Funden (1 kritisch) auf 2.

**2b — Next 16, Tailwind 4, ESLint 9 (2026-09-15).**

- **Next 16**: baut standardmäßig mit Turbopack. Die Dateikonvention
  `middleware` heißt jetzt `proxy` — per offiziellem Codemod umgestellt,
  `src/proxy.ts` exportiert `proxy()`.
- **ESLint 9**: `next lint` gibt es nicht mehr, ESLint läuft direkt über
  `eslint.config.mjs` (Flat Config, von `eslint-config-next` direkt importiert).
  Zwei Regeln aus dem React-Compiler-Satz stehen bewusst auf *warn* — die
  Begründung steht in der Konfiguration: `set-state-in-effect` trifft elf
  Stellen, an denen das Muster korrekt und tragend ist, darunter die Fixes
  gegen die Hydration-Mismatches. Wo ein besseres Muster existiert, wird es
  genutzt (`useMounted()` ist ein `useSyncExternalStore`).
- **Tailwind 4**: Konfiguration wandert aus `tailwind.config.ts` (gelöscht) in
  einen `@theme`-Block in `globals.css`, PostCSS auf `@tailwindcss/postcss`,
  autoprefixer entfällt. 23 Dateien mit umbenannten Klassen. Gegen die
  Design-Tokens geprüft statt nach Augenmaß — alle Farben, Radien und Schriften
  lösen unverändert auf.

Damit sind auch die letzten beiden Audit-Funde weg.

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

- [x] **Von Jürgen gelesen und freigegeben (2026-09-14)** — Datenschutz und
  Nutzungsbedingungen. Eine anwaltliche Durchsicht der Haftungs- und
  Urheberrechtsklauseln bleibt empfehlenswert; sie sind bewusst konservativ
  formuliert, ersetzen aber keine Rechtsberatung.
- [x] USt-IdNr. im Impressum ergänzt (2026-09-14): **DE367742438**, geliefert von
  Jürgen. Offizielle Prüfziffer stimmt; VIES konnte sie an dem Tag nicht
  bestätigen, weil der deutsche Mitgliedsstaaten-Dienst ausgefallen war
  (`MS_UNAVAILABLE` — eine bekannt gültige Kontrollnummer scheiterte ebenso).
  Bei Gelegenheit gegenprüfen:
  `curl -s "https://ec.europa.eu/taxation_customs/vies/rest-api/ms/DE/vat/367742438"`

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

## 6. Kennzahlen — dynamisch seit 2026-09-14

Die gelbe Leiste zieht ihre Zahlen jetzt selbst: Broadcasts und Sendestunden
aus dem Master Schedule (letzte 365 Tage, nur `public = yes`), YouTube-Aufrufe
aus der Data API, Sprachen weiterhin gesetzt. Cache 12 h (YouTube 6 h, weil
die Abonnenten die einzige Zahl sind, die sich von selbst bewegt), Fallback auf
gemessene Werte, wenn eine Quelle ausfällt — die Leiste zeigt nie eine Null
(mit kaputten Keys gegengeprüft). Gerundet wird **immer ab**, damit die
angezeigte Zahl eine ist, die wir schlagen, nicht eine, die wir verteidigen
müssen — seit 2026-09-15 aber in **kleinen Schritten**: Broadcasts auf 10,
Follower auf 100 genau (`roundedDown(n, locale, step)`). Sonst stünde dort ein
Jahr lang unverändert „400+". Code: `src/lib/stats.ts`.

Messung vom 2026-09-14: 410 öffentliche Broadcasts, 1.071 Sendestunden,
104 Serien, 6.184.897 YouTube-Aufrufe, 34.200 Abonnenten, 4.581 Videos.

Seit 2026-09-14 zeigt die Leiste **Broadcasts · YouTube-Aufrufe · Follower ·
Sprachen**. Sendestunden (1.071) und Serien (104) werden weiter berechnet und
stehen in `SiteStats` bereit, falls eine Kachel getauscht werden soll.

**Follower gesamt: 57.559** — YouTube (34.200) kommt live aus der API, die
übrigen Plattformen stehen als `SOCIAL_FOLLOWERS` in `stats.ts`, geliefert vom
Team am 2026-09-14: X 9.728, Facebook 7.692, Instagram 3.072, Twitch 2.467,
TikTok 400. Die YouTube-Angabe des Teams deckte sich exakt mit der API, was für
die Qualität der übrigen spricht. Die Werte der übrigen Plattformen gelten als
**Untergrenze**: gewachsen ist erlaubt, geschrumpft wird nicht geraten. Jürgen
liefert gelegentlich neue Zahlen — dann hier und in `SOCIAL_FOLLOWERS` anheben,
nie auf Verdacht senken.

Die Quellen-Zeile unter der Leiste ist am 2026-09-15 auf Wunsch entfallen; der
Stand der Zahlen steht damit nur noch hier und im Code-Kommentar.

**„100M+ Impressionen pro Jahr" ist entfallen.** Für die Zahl gab es keine
Quelle — weder im Repo, noch in den Social-Reports (die messen einzelne
Kundenkampagnen wie VCO Infinity und Porsche Carrera Cup GB, nicht die
Gesamtreichweite von Racespot). An ihrer Stelle stehen Sendestunden, weil die
zählbar sind. Eine unbelegte Werbeaussage ist nach § 5 UWG angreifbar und
beschädigt die drei Zahlen daneben, die stimmen.

**Wenn eine echte Reichweitenzahl gewünscht ist:** Werte aus den TikTok-,
Instagram- und X-Analytics mit Zeitraum liefern, dann baue ich die Kachel
zurück. Verfügbar wären außerdem jederzeit live: Abonnenten (34.200),
produzierte Videos (4.581), abgedeckte Serien (104).

### Weiterhin von Hand gepflegt

- `src/app/[lang]/events/page.tsx`: Past Events hartkodiert; neue Events nur per Code.
- `Team.tsx`: drei Personen, Biografien in `translations.ts`.
- JSON-LD `foundingDate: '2013'`, Adresse Hürth — nur bei Umzug/Umfirmierung ändern.

## 7. Coolify-Hausmeisterei

- ~~Tote zweite Website-App löschen~~ — erledigt 2026-09-09.
- Lokaler Branch `analytics-page-views` (04.08., 1 Commit, weit hinter `main`; der
  alte Zähl-Endpunkt-Versuch, ersetzt durch Umami) kann gelöscht werden.
- Optional: persistentes Volume für `/app/.next/cache/images`. Der Cache wird beim
  Start ohnehin vorgewärmt (~30–60 s nach Deploy); ein Volume spart nur diese Minute.
- Philips `~/Press Tool/projects/racespot/NOTES.md` sagt noch „a merge does not build" —
  stimmt nicht mehr, Deploy läuft über den Repo-Webhook (siehe `CLAUDE.md`, Deployment).

## 7b. Hydration-Mismatches bei lokaler Zeit

React 19 meldet, was React 18 stillschweigend reparierte: Wer Datum oder Uhrzeit
schon beim ersten Rendern in der Zeitzone des Besuchers formatiert, erzeugt
einen Unterschied zwischen Server-HTML (UTC) und Browser. React wirft `#418`
und baut den Teilbaum neu — sichtbar kaputt ist nichts, sauber ist es nicht.

**Das Muster** steht jetzt in `src/lib/hooks/useLocalTime.ts`: `useLocalFormat(lang)`
liefert `locale` aus der Route (nie aus `navigator`) und `timeZone: 'UTC'` bis
zum Mount, danach `undefined` (= Zone des Besuchers). Server und erster
Client-Durchgang erzeugen damit denselben String; nach dem Mount springt die
Zeit einmal auf lokal. Bewusst so und nicht „bis zum Mount leer lassen", damit
die Inhalte im Server-HTML bleiben und indexiert werden.

**Erledigt:**
- `Hero.tsx` (2026-09-14)
- `LiveOffline.tsx` und `LiveEmbed.tsx` (2026-09-14) — gegengeprüft mit
  `TZ=UTC npx next start` aus einem Europe/Berlin-Browser: Server-HTML 17:00,
  nach Hydration 07:00 PM, Konsole sauber.

**Erledigt: `CalendarClient.tsx`** (2026-09-14). Dort reichte das Muster allein
nicht, weil nicht nur die Formatierung zeitzonenabhängig ist, sondern auch die
Einordnung: In welchen Tag und Monat ein Rennen fällt, unterscheidet sich
zwischen UTC und Europe/Berlin. Gelöst über `zonedParts(date, timeZone)` —
Kalenderteile eines Zeitpunkts in einer gegebenen Zone, via `Intl` — das jetzt
Gruppierung, „ist heute"-Markierung und den Startmonat speist. `timeZone` ist
bis zum Mount `'UTC'` und wird durch alle Unterkomponenten gereicht
(ListView, EventRow, CalendarGridView, DayCell, EventCard).

Gegengeprüft mit `TZ=UTC npx next start` aus einem Europe/Berlin-Browser:
Server-HTML 17:00, nach Hydration 19:00, Startmonat korrekt September,
Listenansicht 21 Einträge mit Ortszeit, Monatswechsel funktioniert, Konsole
sauber. **Damit ist die Klasse von Fehlern auf der ganzen Seite erledigt.**

## 8. Kleinere technische Punkte

**Erledigt 2026-09-15:**

- **`/live` war beim Erstaufruf langsam** (~1,3 s). Ursache: Die
  Live-Erkennung lud bei *jedem* Request ungecacht die komplette
  YouTube-Kanalseite (`cache: 'no-store'`), und im Normalfall — nichts ist
  live — passiert das immer. Jetzt 60 s Cache (wie `CACHE_LIVE` anderswo) plus
  4-Sekunden-Timeout. Gemessen: erster Aufruf 0,90 s, zweiter **0,07 s**. Ein
  startender Stream erscheint weiterhin binnen einer Minute, weil der Client
  ohnehin alle 60 s pollt.
- **Lint hängt im Build**: `npm run build` ist jetzt `eslint . && next build`.
- **`www.racespot.tv/sitemap.xml` und `/robots.txt`** wurden direkt ausgeliefert,
  statt wie alles andere auf die Hauptdomain umzuleiten. Der Proxy-Matcher
  schloss sie aus; jetzt greift die 301 auch dort, die Sprachlogik überspringt
  sie weiterhin.

**Bewusst offen: `CalendarClient.tsx` aufteilen** (619 Zeilen). Die Datei ist
klar gegliedert und wurde am 2026-09-14 umfassend umgebaut (Zeitzonen). Sie
direkt danach ohne fachlichen Anlass zu zerlegen, bringt Regressionsrisiko ohne
sichtbaren Nutzen. Beim nächsten inhaltlichen Eingriff mitnehmen.

