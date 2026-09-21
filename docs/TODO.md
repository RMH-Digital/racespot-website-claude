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

## 3b. Web Vitals — eingeschaltet 2026-09-22

`data-performance="true"` am Umami-Tag in `src/components/seo/Analytics.tsx`.
Damit misst der Browser jedes Besuchers die Core Web Vitals (LCP, INP, CLS,
FCP, TTFB) und schickt sie mit dem Seitenaufruf mit. Ohne das Attribut sammelt
Umami nichts, auch auf einer Version, die es könnte. Voraussetzung ist Umami
≥ 3.1; die Instanz wurde dafür am 2026-09-21 von 3.0.3 auf **3.4.0** gehoben
(gemessen vorher und nachher, Sicherung unter `/root/backups/`, Daten
unversehrt: 1.409 → 1.412 Ereignisse).

**Warum überhaupt:** Googles CrUX meldet erst ab einer Verkehrsschwelle, die
diese Seite nicht erreicht — Felddaten gäbe es sonst gar nicht. Lighthouse
füllt die Lücke mit einem synthetischen Einzellauf, also einem Laborwert, nicht
dem, was Besucher erleben.

**Datenschutz mitgezogen**, wie es die Hausregel verlangt: je ein Absatz in
Abschnitt 5 auf Deutsch und Englisch (`src/lib/i18n/legal/privacy.ts`). Er sagt,
dass Zeitangaben in Millisekunden erhoben werden, dass der Browser sie misst,
und dass sie etwas über die Seiten aussagen, nicht über die Person. Keine neuen
personenbezogenen Daten, weiterhin ohne Cookies und ohne IP.

### Der Commit heißt anders, als er ist

Beides steckt in **`4b7ab0d` „Say why the replay index came back empty"**. Eine
parallel laufende Sitzung hat `git add -A` benutzt und die beiden noch nicht
festgeschriebenen Dateien mit eingesammelt. Der Commit enthält vier Dateien:

| Datei | Inhalt |
|---|---|
| `src/lib/replays.ts` | worum es in der Nachricht geht |
| `src/lib/youtube.ts` | etwas Drittes |
| `src/components/seo/Analytics.tsx` | Web Vitals eingeschaltet |
| `src/lib/i18n/legal/privacy.ts` | Datenschutzerklärung erweitert |

Die Historie wurde bewusst **nicht** umgeschrieben: der Commit war bereits
gepusht und ausgeliefert, ein Force-Push hätte einen weiteren Deploy ausgelöst.
Dieser Abschnitt ist der Ersatz — wer wissen will, seit wann und warum
Ladezeiten erhoben werden, findet es hier statt im Git-Log.

**Lehre:** Laufen zwei Sitzungen im selben Repo, fasst `git add -A` fremde
Arbeit mit an. Dateien einzeln hinzufügen, oder vor dem Commit `git status`
lesen. Bei einer Datenschutzerklärung ist die Nachvollziehbarkeit kein
Schönheitsfehler, sondern Teil des Dokuments.

**Offen:** Die Werte erscheinen erst mit echten Besuchen, und die Startseite
liefert bis zu fünf Minuten die vorgerenderte Fassung (`revalidate = 300`).
Nach ein bis zwei Tagen ist genug da, um sie im Analytics-Hub
(`~/Racespot Analytics`) auszuwerten.

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

### Abschnitt 7 nachgezogen — 2026-09-21

Der Text beschrieb den Datenschutzmodus nur für die Events-Seite. Seit dem
eigenen Player (7i) öffnet sich eine Aufzeichnung auf Startseite, Broadcasts,
Events, Kalender und in Artikeln.

Nachgemessen statt angenommen: Die Vorschaubilder laufen über `next/image` und
kommen damit vom eigenen Server — auf `/broadcasts` achtzehn Stück, jedes über
`/_next/image`. Der Browser des Besuchers erreicht vor dem Klick auf Wiedergabe
also keinen Google-Host. Der alte Text untertrieb zu unseren Ungunsten.

Deutsch und Englisch gemeinsam geändert, Stand-Datum auf den 21.09. gesetzt,
von Jürgen freigegeben. Nebenbei die Backticks um `youtube-nocookie.com`
entfernt: Die Rechtstexte kennen keine Code-Auszeichnung, sie standen wörtlich
auf der Seite.

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
Server).

**Am 2026-09-15 über die Coolify-API geprüft:** `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS` und `CONTACT_EMAIL` sind gesetzt. Der
`mailto:`-Notnagel greift also nicht, das Formular versendet echt.

**Erledigt:** Hugo und Aaron haben am 2026-09-15 jeweils Testanfragen
abgeschickt (von Jürgen bestätigt). Damit ist der Weg Formular → SMTP →
Postfach in der Praxis belegt. Punkt geschlossen.

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

**Getauscht am 2026-09-16 (Jürgen):** YouTube-Aufrufe raus, **Sendestunden
der letzten 12 Monate** rein — aus derselben Quelle wie die Broadcasts
(Master Schedule, `public = yes`, Dauer als Tagesbruch × 24, gemessen 1.071),
in Zehnerschritten abgerundet wie die Broadcasts. Begründung: Sendestunden
sagen, was wir tun; Lebenszeit-Aufrufe sagen vor allem, wie lange es den Kanal
gibt. **Angesehene Stunden** (Watch Time) wären die bessere Zahl, sind aber
über die öffentliche YouTube-Data-API nicht verfügbar — dafür braucht es die
YouTube-Analytics-API mit OAuth des Kanalinhabers.

**Website-Seite dafür fertig (2026-09-16):** `youtubeWatchHours()` in
`stats.ts`, Kachel „Angesehene Stunden, letzte 12 Monate" sobald die drei
Variablen `YOUTUBE_OAUTH_CLIENT_ID / _SECRET / _REFRESH_TOKEN` in Coolify
stehen, sonst weiter Sendestunden. Das Token holt `npm run youtube-auth`
einmalig mit dem Brand-Konto; die komplette Anleitung mit den zwei Fallen
(Testing-Status verfällt nach 7 Tagen, persönlicher statt Brand-Kanal) steht
in [docs/YOUTUBE-ANALYTICS.md](YOUTUBE-ANALYTICS.md). **Offen: Jürgen führt
die Schritte 1–5 aus.**

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
- Optional, **nicht gemacht**: persistentes Volume für `/app/.next/cache/images`.
  Der Cache wird beim Start ohnehin vorgewärmt (~30–60 s nach Deploy); ein
  Volume spart genau diese Minute. Dafür einen Eingriff an der laufenden
  Container-Konfiguration vorzunehmen — noch dazu nachts und ohne dass jemand
  zusieht — steht in keinem Verhältnis. Beim nächsten Coolify-Termin mitnehmen.
- **Zwei überholte Stellen in den Notizen des Press-Tool-Projekts**
  (`~/Press Tool/projects/racespot/NOTES.md`). Das ist die Arbeitsdatei jenes
  Projekts — „racespot — project notes", mit Themen, Autoren und Quellen —, die
  seine eigenen Sitzungen pflegen. Sie gehört **nicht** Philip: er gibt Artikel
  frei und hat die DNS-Einträge gemacht, mehr nicht. (Diese Fehlzuschreibung
  stand seit einer früheren Sitzung hier und wurde von Jürgen am 2026-09-15
  korrigiert — schon zum zweiten Mal in dieselbe Richtung.) Bearbeitet habe ich
  sie nicht: fremdes Projekt, 80 KB, zuletzt am 2026-09-15 um 08:31 geändert.
  - Zeile 557: „Until then a merge does not build; trigger with the API deploy
    call above." Für **dieses** Repo stimmt das nicht mehr. Der GitHub-App-Hook
    zeigt zwar weiterhin auf den geschlossenen Port 8000, aber seit dem
    2026-09-11 hängt ein **Repo-eigener** Webhook an
    `RMH-Digital/racespot-website-claude` — ein Push auf `main` deployt. In
    dieser Sitzung so rund zehnmal nachgewiesen.
  - Zeile 558: die zweite Website-App `i11m6pnwhz85y8oqyfrkuipm` „can be
    deleted" — die ist am 2026-09-09 bereits gelöscht worden.

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

## 7c. UI/UX-Audit — umgesetzt 2026-09-15

Vollständiger Durchgang durch alle 12 Seiten × 6 Sprachen, gemessen im Browser
(Kontrast, Trefferflächen, Überlauf, Überschriftenfolge, Fokus, Bewegung).
Ergebnis danach: **72 Seiten, 0 Kontrastfehler, 0 Text unter 11 px, genau ein
`h1` pro Seite, keine übersprungene Überschriftenebene.**

**Kritisch, behoben:**

1. **Header-CTA war zwischen 1024 und ~1300 px abgeschnitten.** Gemessen auf
   `/de` bei 1024 px: „Angebot anfragen" endete 126 px hinter dem rechten Rand,
   22 von 148 px sichtbar, und weil der Header `fixed` ist, gibt es keine
   Scrollleiste, über die man ihn erreicht hätte. Englisch 87 px.
   Zwei Ursachen, beide behoben: die Desktop-Leiste schaltete bei `lg` (1024)
   ein, obwohl sie erst ab 1280 passt (jetzt `xl`), und der CTA-Text war in den
   romanischen Sprachen ein ganzer Satz. Dafür gibt es jetzt
   `nav.getQuoteShort` (Devis, Orçamento, Presupuesto, Preventivo, Anfragen) —
   nur in der Kopfzeile, die Langform bleibt auf den Seiten-CTAs.
   Nachgemessen bei 1280 px: alle sechs Sprachen passen, nichts ragt heraus.
2. **`--color-rs-muted` war #777777** = 4,42:1 auf #0A0A0A und 4,22:1 auf
   Karten, beides unter AA. Jetzt **#8A8A8A** (5,7 bzw. 5,5:1). Betraf fast
   jeden Fließtext. Ebenfalls hochgezogen: Platzhalter im Formular (waren 50 %
   Deckkraft), Hinweistexte (70 %), die `·`-Trenner und die Service-Nummern
   (standen auf `text-rs-border`, 1,3:1 — praktisch unsichtbar).
3. **Keine `prefers-reduced-motion`-Behandlung.** Jetzt ein Block, der
   Animationen und Übergänge kappt und das weiche Scrollen abschaltet. Dazu
   `.pause-on-hover` auf Ticker und Partner-Marquee: Hover oder Tastaturfokus
   halten das Band an (WCAG 2.2.2).

**Wichtig, behoben:** Skip-Link mit `id="content"` auf `<main>` · ein
einheitlicher gelber `:focus-visible`-Ring (vorher gab es *keine* Fokusregel im
Projekt; `focus:outline-hidden` an den Feldern ist raus) · Trefferflächen:
Burger 36×31 → 44×44, Social-Icons 36 → 44, `btn-sm` → `min-h-11`, `btn-ghost`
21 → 41 px (über `py-2.5 -my-2.5`, damit das Layout stehen bleibt),
Footer-Links 16 → 33 px, Kalender-Monatspfeile 32 → 44, **Kalender-Event-Punkte
6–8 px → 24×24** (Punkt bleibt optisch gleich, der Button ist jetzt eine
24er-Box) · `aria-required` auf allen Pflichtfeldern (das Formular ist
`noValidate`, die Pflicht stand nur als Sternchen da) · Tab-Leiste im Formular
mit Roving-Tabindex und Pfeiltasten.

**Feinschliff, behoben:** zwei `h1` auf `/live` · Footer-`h4` → `h2` plus
`<nav>`-Landmark · Artikelspalte 48rem → 44rem (≈78 → ≈71 Zeichen je Zeile) ·
Sprach-Dropdown schließt mit Escape und gibt den Fokus zurück, das falsche
`aria-haspopup="menu"` ist weg, Flaggen-Emoji sind `aria-hidden` · mobiles Menü
mit Escape, Scroll-Sperre und Fokusrückgabe · Live-Abfrage pausiert in
Hintergrund-Tabs (`visibilitychange`) · Kalender startet unter 768 px in der
Listenansicht (das Monatsraster ist 700 px breit; eine ausdrückliche Wahl des
Nutzers gewinnt immer) · Uhr-Emoji durch SVG ersetzt · 10-px-Labels auf 11 px ·
Tailwind-3-Rahmen-Shim entfernt, nachdem über alle 13 Seitentypen **null**
Elemente darauf angewiesen waren.

**Zwei Befunde haben sich beim Nachprüfen als falsch erwiesen:**

- Das Minuten-Auswahlfeld hat *doch* einen Namen — `ariaLabel` kommt über die
  `Select`-Komponente, mein erster Test hat nur nach `<label for>` gesucht.
- `prefetch={false}` im Footer **halbiert die Prefetch-Last nicht**, wie
  ursprünglich behauptet. Gemessen: 15 RSC-Prefetches beim Laden, danach
  unverändert 15 — die kommen aus den Links oberhalb der Falz (Hero,
  AudienceFork, Sektions-Links). Was die Änderung wirklich bringt: die drei nur
  im Footer verlinkten Routen (`privacy`, `terms`, `imprint`) werden nicht mehr
  vorgeladen, also ~6 Server-Renders weniger, sobald jemand nach unten scrollt.
  Der Rest ist Next-Standardverhalten und der Preis für sofortige Navigation.

**Bewusst offen:**

- Der Partner-Marquee bekommt **keine** sichtbare Pause-Schaltfläche
  (Entscheidung Jürgen, 2026-09-15). Er pausiert bei Hover und steht bei
  `prefers-reduced-motion` still; ein Tastaturnutzer kann ihn nicht anhalten,
  weil kein fokussierbares Element darin liegt. Das ist die bewusst in Kauf
  genommene Lücke zu WCAG 2.2.2 — bei einem rein dekorativen Logoband, dessen
  Inhalt sich wiederholt, vertretbar.
- Restliche Trefferflächen zwischen 24 und 44 px: Ticker-Label (34 px hoch, das
  ist die Bandhöhe), Hero-„Next Broadcast"-Zeile (32), Footer-Rechtslinks (29).
  Alle über dem WCAG-Minimum von 24 px und breit genug; 44 px hätte hier
  Layouts verschoben.
- ~~Flaggen im Sprachwähler~~ — **am 2026-09-15 entfernt.** Der Knopf zeigt nur
  noch das Kürzel, das Ausklappmenü Kürzel plus Sprachnamen (`DE Deutsch`). Das
  `flag`-Feld ist mitsamt seinem letzten Aufrufer aus `LANGUAGES` verschwunden.
  Nebeneffekt: Der Header wurde schmaler, was der Enge zwischen 1280 und
  1440 px zugutekommt.

## 7d. SEO-Audit — umgesetzt 2026-09-15

Durchgang über alle 72 Seiten plus 42 Artikel-URLs: Metadaten, strukturierte
Daten, Sitemap, Weiterleitungen, hreflang, Robots.

**Titel und Beschreibungen**

- `meta.site.title` hieß „Racespot.tv — <Claim>", und die Startseite
  unterdrückte den Marken-Suffix. Ergebnis war ein `og:title`
  „Racespot.tv — … | Racespot.tv" — Marke doppelt. Der Claim steht jetzt
  vorn ohne Marke, das Template hängt sie einmal an. Nebeneffekt: die vier
  romanischen Fassungen waren 64–70 Zeichen und wurden abgeschnitten; sie
  liegen ohne den Superlativ jetzt bei 50–55. Alle sechs Startseiten
  zwischen 50 und 59 Zeichen.
  Achtung für später: Next wendet ein `title.template` nur auf **Kind**-Segmente
  an. `[lang]/page.tsx` liegt im selben Segment wie das Layout, das das Template
  definiert — die Startseite muss ihre Marke deshalb selbst setzen.
- Artikelbeschreibungen kamen ungekürzt aus dem Excerpt und waren 200–240
  Zeichen, wurden also mitten im Wort abgeschnitten. `clampDescription()`
  schneidet am letzten Satzende, sonst an der Wortgrenze. Alle 42
  Artikel-URLs liegen jetzt zwischen 99 und 156 Zeichen.
- Drei Beschreibungen waren zu **kurz** (41–68 Zeichen, unter ~70 ersetzt
  Google sie durch eigenen Text): `live`, `privacy`, `imprint` — neu
  geschrieben in allen sechs Sprachen.
- Artikeltitel: `titleWithBrand()` lässt bei langen Schlagzeilen den
  Marken-Suffix weg, statt die Schlagzeile abschneiden zu lassen.
- Die 404-Seite trug den Titel der Startseite. Jetzt „Page not found"
  (nicht übersetzbar — `not-found.tsx` bekommt keine Route-Parameter — aber
  die Seite ist ohnehin `noindex`, und die Überschrift ist übersetzt).

**Strukturierte Daten**

- **Neu: Broadcast-Termine als `Event`** auf `/calendar`. Die einzige Stelle
  der Website, die ein Event-Rich-Result verdienen kann: echte geplante
  Produktionen mit Anfang, Ende und Ort zum Zusehen. Nur zukünftige Termine,
  maximal 30, als ein `@graph`, Organizer per `@id`-Referenz auf den
  Organization-Knoten. `VirtualLocation` zeigt auf dieselbe `/live`-Seite, auf
  die auch der Kalender selbst verlinkt; das Null-Euro-Angebot bildet ab, dass
  die Übertragungen frei sind.
  Erste Fassung waren 37 KB JSON-LD = 21 % der Seite; nach dem Straffen 19 KB
  bei 139 KB Seitengröße.
- **Neu: `BreadcrumbList`** auf Artikeln (Racespot.tv › News › Schlagzeile)
  und auf dem Kalender. Ersetzt die URL im Suchergebnis durch einen Pfad.
- **Organization** trug nur „Hürth, DE". Jetzt vollständige Anschrift wie im
  Impressum plus `vatID` und `legalName` — Suchmaschinen gleichen
  Unternehmensangaben gegen das Impressum ab.

**Sitemap**

`lastModified` war für alle 106 URLs die Build-Zeit. Damit behauptet jeder
Deploy, sämtliche Inhalte hätten sich geändert — Google stuft ein solches
`lastmod` als unbrauchbar ein. Jetzt: redaktionelle Seiten tragen ihr echtes
Inhaltsdatum (Tabelle `CONTENT_UPDATED` in `sitemap.ts`, beim Ändern des
Textes mitziehen), Artikel ihr Veröffentlichungsdatum, datengetriebene Seiten
weiterhin die Build-Zeit. Verteilung danach: neun verschiedene Daten von
2025-10-15 bis 2026-09-15.

**Kleinigkeiten**

`twitter:site`/`creator` auf `@RaceSpotTV` (Karten waren anonym; musste in
`pageMetadata` **und** ins Layout, weil Next verschachtelte Metadaten ersetzt
statt zusammenzuführen) · `preconnect` auf `i.ytimg.com` und `img.youtube.com`,
von wo die Video-Vorschaubilder kommen.

**Geprüft und in Ordnung, nichts zu tun:** Weiterleitungen (`/` → 302 `/en`,
alte URLs → 301, `www` → 301, Slash-Variante → 308) · hreflang vollständig und
wechselseitig, `x-default` auf `/en` · alle 7 Artikel in allen 6 Sprachen
übersetzt, keine Fallback-Seite im Index · robots.txt mit TDM-Vorbehalt ·
OG-Bilder alle vorhanden und 1200×630 · alle Bilder mit `alt` · HSTS ·
Core Web Vitals (CLS 0, TTFB 0,12 s).

**Erledigt 2026-09-15: `seoTitle` eingeführt und nachgetragen.** Das Feld
steht auf `Article` und auf jeder Übersetzung, das Press Tool schreibt es ab
sofort mit. Die sieben bereits veröffentlichten Artikel habe ich von Hand
nachgezogen: 32 der 42 Sprachvarianten hatten eine Schlagzeile über 55
Zeichen und haben jetzt einen Kurztitel, die anderen zehn passten schon und
sind bewusst leer geblieben — der Fallback auf die Schlagzeile ist ja der Zweck.

Gemessen, nicht geschätzt: Titel-Tags vorher 48–86 Zeichen mit zwölf über 70,
jetzt **52–69** und keiner über 69, alle mit Markennamen. `titleWithBrand()`
hat dabei ein Budget von 46 auf **55** bekommen — 46 stammte aus der Zeit vor
den Kurztiteln und ließ alles ab 47 Zeichen den Markennamen grundlos fallen,
sodass ein 47-Zeichen-Titel völlig anders behandelt wurde als ein
45-Zeichen-Titel.

## 7e. Favicons — repariert 2026-09-15

Hinweis kam aus einer Press-Tool-Session: die Icon-Dateien auf racespot.tv sind
kaputt. Nachgemessen, stimmt alles:

| Datei | war | deklariert |
|---|---|---|
| `favicon-32.png` | **1×1** | 32×32 |
| `favicon-48.png` | **2×2** | 48×48 |
| `icon-192.png` | **37×37** | 192×192 |
| `icon-512.png` | **262×262** | 512×512 |
| `apple-touch-icon.png` | **32×32** | 180×180 |
| `favicon-16.png` | 16×16 ✓ | 16×16 |
| `favicon.ico` | **fehlte** (404) | — |

Alle stammen aus einem einzigen Commit vom März 2026 und waren von Anfang an
falsch. Browser skalieren stillschweigend, was sie bekommen, deshalb sah man
nur einen unscharfen Fleck im Tab statt eines Fehlers.

Reparatur: `scripts/generate-icons.mjs` (`npm run generate-icons`) erzeugt den
ganzen Satz aus `assets/icon-master.png` — der größten sauberen Kopie, 262 px,
aus der alten `icon-512.png` gerettet. Weil die Marke zweifarbig ist, wird sie
einmal auf 2048 hochgerechnet und hart geschwellt, bevor irgendeine Zielgröße
entsteht: gleiche Geometrie überall, Kantenglättung aus genau einem sauberen
Verkleinern. Neu dabei: `favicon.ico` (16+32+48 in einer Datei) und ein
`icon-maskable-512.png`, dessen R innerhalb der Android-Safe-Zone liegt —
adaptive Icons beschneiden zum Kreis, ein randfüllendes R verlöre die Ecken.

**Farbe korrigiert (Jürgen, 2026-09-15).** Das R war `#DAA520` auf `#000000` —
CSS-„goldenrod" auf Reinschwarz, offenkundig ein Generator-Standard und nicht
das Marken-Gelb. Es steht jetzt auf **`#F5C000` auf `#0A0A0A`**, also auf den
Design-Tokens aus `globals.css`. Die *Form* kommt weiterhin aus dem Master;
dessen alte Farben stehen in `generate-icons.mjs` nur noch als
`MASTER_YELLOW`/`MASTER_BLACK`, um die Form aus der Datei auszulesen.

## 7f. Ladeanzeige bei Navigationen — neu 2026-09-15

Zwei Aufgaben in einer Komponente.

**Als Ladeanzeige** bei Navigationen, die länger als 250 ms brauchen. Das ist
selten: live gemessen dauert ein Seitenwechsel **45–123 ms, Median 73** — null
von sieben Navigationen erreichen die Schwelle. Die Anzeige ist also im
Normalbetrieb unsichtbar und meldet sich nur, wenn wirklich etwas hängt
(kalter Container nach einem Deploy, schlechte Mobilverbindung). Genau richtig
für einen Fortschrittsbalken, aber der Grund, warum Jürgen sie nie zu sehen
bekam.

**Als Intro**, einmal pro Session auf der ersten geöffneten Seite, fest 900 ms
— so wie rmh-digital.de es macht. Diese Hälfte ist reine Choreografie und
hängt an nichts. Sie kostet ehrlich gesagt eine knappe Sekunde vor dem Hero
für Erstbesucher; `INTRO_MS = 0` schaltet sie ab und lässt nur die Ladeanzeige
übrig.

`src/components/layout/NavigationProgress.tsx`: ein schwarzer Vollbild-Vorhang
mit „RACESPOT" unten links und einer dreistelligen Zahl unten rechts in großer
Eurostile und Markengelb, dazu die gelbe Fortschrittslinie am unteren Rand.
Bei Ankunft fällt er nach unten weg — Zahl und Fortschrittslinie sitzen am
unteren Rand, sie verlassen das Bild also zuletzt und in der Richtung, in der
das Auge ohnehin steht.

**Vorlage ist rmh-digital.de** (`Preloader` in
`_next/static/chunks/app/[locale]/page-*.js`). Deren Fassung ist ein Intro:
GSAP-Timeline, fest 0,85 s, einmal pro Session über
`sessionStorage['rmh:preloaded']`, bei `prefers-reduced-motion` übersprungen,
danach `yPercent: -100`. Die Zahl dort ist Choreografie und hängt an nichts.
Hier hängt sie an der echten Navigation — das war Jürgens eigentliche
Anforderung („wenn eine Seite mal etwas länger braucht").

Entscheidungen und Fallen:

- **Erst nach 250 ms.** Darunter wird die Komponente gar nicht erst gerendert
  (geprüft: Deckkraft bleibt 0). Sonst blitzt bei jedem Klick ein Vorhang auf.
- **Bis 90, dann Halt.** Wie weit die Anfrage ist, weiß niemand. Bei Ankunft
  springt sie auf 100, hält 260 ms, dann gleitet der Vorhang weg.
- **Der Zähler ist kein React-State.** Er war es — und bewegte sich nicht:
  während der laufenden Route-Transition hat React die Updates pro Frame nicht
  durchgerendert, die Zahl stand auf 000 und sprang bei Ankunft auf 100. Die
  Animation-Frames liefen die ganze Zeit (105 Stück in 1,5 s gemessen), React
  hat nur nicht neu gerendert. Jetzt schreibt die rAF-Schleife direkt in die
  beiden Knoten.
- **Die Bewegung ist ein Inline-`transform`, keine Tailwind-Utility.** Zwei
  Anläufe: `transition-[transform]` feuert nie, weil Tailwind 4 über die
  `translate`-Eigenschaft bewegt. Die Transition auf `translate` umzustellen
  half auch nicht — dieser Wert wird aus Custom Properties gebaut
  (`translate: var(--tw-translate-x) var(--tw-translate-y)`), und obwohl
  `--tw-translate-y` korrekt auf `-100%` sprang, stand der berechnete Wert die
  vollen 620 ms bei `0%`: der Vorhang verschwand am Ende einfach. Lokal sah es
  nach einer sehr langsamen Bewegung aus, live bewegte sich gar nichts — beides
  gemessen. Ein schlichtes `transform` am Element macht genau das, was man
  erwartet (gemessen: −5 → −62 → −383 → −563 px über 12 Frames).
- **`w-full` auf der Zeile.** `container-rs` zentriert sich mit `margin: auto`,
  und ein Auto-Margin auf der Querachse hebt `align-items: stretch` auf — ohne
  `w-full` schrumpfte die Zeile auf Inhaltsbreite und die Zahl stand mitten im
  Bild statt rechts.
- **Keine CSS-Transition auf dem Balken.** Der Wert ändert sich jeden Frame,
  eine jeden Frame neu gestartete Transition kommt nie an (blieb bei 56 %).
- **Kein Intro in unsichtbaren Tabs — und das war ein echter Fehler.** Beim
  Testen lief der Zähler nie los; eine Sonde in der Schleife zeigte, dass
  `requestAnimationFrame` **kein einziges Mal** feuerte, bei
  `document.visibilityState === 'hidden'`. Browser halten Animation-Frames in
  unsichtbaren Dokumenten komplett an. Da der Vorhang sein Ende ausschließlich
  aus dieser Schleife bekam, wäre er dort **für immer** stehen geblieben:
  schwarze, scroll-gesperrte Seite für jeden, der die Website in einem
  Hintergrundtab öffnet — etwas völlig Alltägliches. Jetzt startet das Intro
  bei verstecktem Dokument gar nicht erst (und verbraucht auch das
  Session-Flag nicht), und ein `setTimeout` beendet es unabhängig von der
  Schleife, falls der Tab mittendrin in den Hintergrund wandert.

- Zurück/Vorwärts zählen mit; nach 15 s ohne Ankunft blendet sie sich ab, damit
  weder Vorhang noch Scroll-Sperre hängen bleiben. Für Screenreader eine
  Statusmeldung statt einer sich sechzigmal pro Sekunde ändernden Zahl.

## 7g. Broadcast-Erinnerungen, Stufe 1: Kalender — fertig 2026-09-15

Die billige, ehrliche Hälfte der Reminder-Idee. **Der Alarm steckt in der
Datei** und wird vom Kalender des Lesers ausgelöst — wir speichern nichts,
fragen nichts ab, es gibt keine Einwilligung und nichts zu löschen.

Zwei Wege, beide aus denselben Daten (`getCalendarEvents()`):

| | |
|---|---|
| Einzeltermin | `/api/calendar/<id>?lang=de` → `.ics` zum Download, Dateiname aus dem Seriennamen |
| Abo-Feed | `webcal://racespot.tv/schedule.ics` → kompletter Zeitplan, hält sich selbst aktuell |

Beide mit `VALARM`, Erinnerung 15 Minuten vor Beginn. Knöpfe: pro Event im
Kalender (Liste 44 px, Monatsraster 24 px — mehr passt in eine 97-px-Zelle
nicht) und ein Abo-Block über dem Kalender mit `webcal:`-Knopf, „Link
kopieren" und der ausgeschriebenen Adresse für alle, bei denen beides nicht
greift.

**Dabei einen echten Fehler gefunden und behoben:** `sheets.ts` vergab
`id: String(row[17] || Math.random())`. Für einen React-Key, der eine
Renderphase lebt, egal — für einen Kalender-Feed tödlich: die UID ist das
Erkennungsmerkmal, an dem ein abonnierter Kalender einen bereits bekannten
Termin wiedererkennt. Mit Zufalls-IDs hätte jede Aktualisierung wie ein
komplett neuer Satz Broadcasts ausgesehen und erneut benachrichtigt. Jetzt
FNV-1a über Serienname + Startzeit, geprüft: über zwei Abrufe identisch,
alle 101 eindeutig.

`src/lib/ics.ts` hält sich an RFC 5545: CRLF, Faltung bei 75 **Oktetten**
(nicht Zeichen — ein Umlaut ist länger, als er aussieht, und darf nicht
mitten durchgeschnitten werden), Escaping von `\ ; ,` und Zeilenumbrüchen.
Geprüft: 101 VEVENT mit 101 VALARM, längste Zeile exakt 75 Oktette, keine
nackten LF, Blöcke ausbalanciert.

Einschränkung, die man kennen sollte: Apple und Google aktualisieren
Abo-Feeds in ihrem eigenen Takt, meist alle paar Stunden. Kurzfristige
Änderungen kommen verzögert an. `REFRESH-INTERVAL` und `X-PUBLISHED-TTL`
stehen auf 6 h, sind aber nur Wünsche.

**Umgebaut am 2026-09-16 (Jürgen):**

- Der erklärende Abo-Block über dem Kalender ist weg. Stattdessen **ein
  Knopf „Zeitplan abonnieren" rechts in der Steuerleiste**, die Erklärung
  als Hover-Tipp. Kein „Link kopieren" mehr — Rechtsklick → „Link kopieren"
  bietet jeder Browser auf einem Link an, der Tipp sagt das für den
  Google-Kalender-Fall.
- **Abo pro Serie.** `/schedule.ics?series=<Name>` filtert den Feed auf eine
  Serie, exakt so geschrieben wie im Master Schedule (mit Saison, also
  „Radical e-Cup - 2026 Season 4"); eine beendete Saison läuft leer, statt
  einen Nachfolger zu raten. Der Kalender-Knopf an jedem Termin ist jetzt ein
  **Menü mit zwei Einträgen**: „In den Kalender" (nur diese Übertragung, `.ics`)
  und „Serie abonnieren" (`webcal://…?series=`).
- **Hover-Tipps** (`src/components/ui/Tip.tsx`): an jedem Termin in Raster
  und Liste (voller Serienname, Beschreibung, Datum, lokale Start–Endzeit,
  „Klick öffnet die Live-Seite"), an der Zeitzonen-Anzeige, an den vier
  Kennzahlen der Startseite (Herkunft und Rundung — das, was vorher als
  Kleingedrucktes unter den Zahlen stand), plus native `title`-Attribute an
  allen Icon-Knöpfen (Monatspfeile, Sprachwahl, Burger, Footer-Icons,
  Event-Pfeile, Ticker-Label). Tipp und Menü werden per Portal in `body`
  gerendert und fest positioniert, weil das Monatsraster seine Zellen mit
  `overflow: hidden` beschneidet — innerhalb der Zelle wäre beides ein
  Streifen. Der Tipp zeigt sich bei Maus und Tastaturfokus (nur
  `:focus-visible`, sonst holt ihn der Klick, der das Menü öffnet, sofort
  zurück) und verschwindet bei `mousedown`. Das Menü folgt beim Scrollen
  seinem Knopf, statt zu schließen — die Seite scrollt weich, und ein Klick
  während des Ausrollens hätte sonst ein Menü geöffnet, das sofort wieder
  zu war.
- **Steuerleiste (2026-09-16, Jürgen):** Der Monat steht wieder **exakt
  mittig** — ab `xl` ein Dreispalten-Grid `1fr auto 1fr`, darunter bekommt der
  Monat eine eigene zentrierte Zeile oben. Und die **Pfeile bewegen sich nicht
  mehr**: Vorher war das Label `min-w-[140px]`, aber „septiembre de 2026" in
  Eurostile Extended ist über 300 px breit, also sprang der rechte Pfeil je
  nach Monat und Sprache. Jetzt liegen alle zwölf Monatsnamen der Sprache in
  derselben Grid-Zelle, elf davon `invisible` — die Box ist so breit wie der
  breiteste, ohne Zahl im Code. Gemessen (es, 1440): Pfeile bei 564/828 px
  über sieben Monate, Mitte 718 = Mitte der Leiste. Die Zeitzone steht jetzt
  links neben dem Ansichts-Umschalter, damit rechts nur der Abo-Knopf liegt,
  der auf Spanisch die Breite braucht.

### Stufe 2, geplant am 2026-09-15, nicht gebaut: Newsletter und Race Reminder, komplett selbst betrieben

**Entschieden (Jürgen, 2026-09-15):** kein fremder Dienst. Alle Daten bleiben
auf eigenen Servern. Zwei getrennt wählbare Themen — **Newsletter**
(Pressemitteilungen und News) und **Race Reminder** (Erinnerung vor
Broadcasts) —, je eine Checkbox, einzeln kündbar.

**Aufwand: rund neun Arbeitstage auf der Website-Seite**, dazu Wartezeiten
(DNS, Freigabe der Rechtstexte) und **laufender Betrieb von etwa einer Stunde
im Monat** — Bounces, Zustellbarkeit, Backups nachsehen. Das ist gut doppelt
so viel wie mit einem Anbieter; die Differenz ist exakt das, was ein Anbieter
sonst übernimmt: Warteschlange, Bounce-Behandlung, Ruf der Absenderadresse.

#### Eine Unterscheidung, die den Plan bestimmt

„Selbst betreiben" heißt zweierlei, und nur eines davon ist teuer:

- **Die Daten selbst halten** — Adressen, Einwilligungen, Themen, Protokolle.
  Das ist eine Postgres-Datenbank neben der Website und kostet einen halben Tag.
- **Die Mails selbst zustellen** — ein eigener Mailserver mit eigener IP. Das
  ist der Ruf einer Adresse bei Gmail, Microsoft und GMX, der über Wochen
  aufgebaut werden muss, Hetzner-IP-Bereiche auf Sperrlisten, Port 25 bei
  Hetzner erst auf Antrag, Reverse-DNS, tägliche Pflege. Zwei Tage extra und
  das Risiko, dass Erinnerungen im Spam landen, den niemand sieht.

**Vorschlag:** das erste ja, das zweite nein. Versendet wird über den
**bestehenden SMTP-Zugang bei All-Inkl** — das ist unser eigenes Postfach beim
Hoster, den wir ohnehin bezahlen, kein Marketing-Dienst, der die Liste sieht.
Die Adressliste verlässt Hetzner nie; All-Inkl sieht jede Mail so, wie jeder
Mailserver eine Mail sieht. Das Stundenlimit des Postfachs steht im KAS und
wird zur Obergrenze der Warteschlange. Ein eigener Mailserver bleibt als
späterer Schritt möglich, ohne dass irgendetwas anderes umgebaut werden muss —
es ist ein Konfigurationswert.

#### Wo die Daten liegen

**Hetzner, als Postgres-Dienst in Coolify**, eigene Instanz (nicht die von
Umami), im selben Docker-Netz wie die Website, ohne offenen Port. Coolify
sichert Datenbanken planmäßig.

**Backup (entschieden 2026-09-16, Jürgen: alles bei Hetzner, keine Kopie im
Büro).** Zwei Ebenen, beide bei Hetzner:

- Die **täglichen Server-Backups** (7 Slots, seit August aktiv) sichern die
  ganze Maschine samt Datenbank-Volume — bereits bezahlt.
- Dazu ein **logischer Dump** über Coolifys Datenbank-Backups, täglich, auf
  eine **Hetzner Storage Box** (BX11, 1 TB, 3,81 €/Monat). Nicht für die
  Sicherheit, sondern für die Wiederherstellung: Aus dem Server-Backup kommt
  nur der ganze Server von gestern zurück, aus dem Dump nur die
  Abonnentenliste — in Minuten, ohne die anderen Apps anzufassen.

Produktivbetrieb oder Kopie im Büro: bewusst nicht. Ein öffentlicher Dienst,
der ins Büronetz schreibt, wäre ein offener Weg von außen nach innen; für
eine Sicherungskopie reicht die Storage Box im selben Rechenzentrum.

#### Schema

| Tabelle | Inhalt |
|---|---|
| `subscribers` | E-Mail (klein geschrieben, eindeutig), Sprache, Status `pending / active / unsubscribed`, angelegt, bestätigt, Einwilligungs-IP, Version des angezeigten Textes, Abmelde-Token |
| `subscriptions` | Abonnent × Thema (`newsletter` / `reminders`), bei Reminders optional die Serien |
| `mail_queue` | Empfänger, Betreff, HTML, Text, Header, Status `queued / sent / failed`, Versuche, nächster Versuch, Fehlertext |
| `reminder_log` | Event-ID (die stabile aus `sheets.ts`) × Zeitpunkt — verhindert die doppelte Erinnerung |
| `newsletter_issues` | Ausgabe: enthaltene Artikel, Betreff je Sprache, Status `preview / approved / sent` |
| `bounces` | Adresse, hart/weich, Zeitpunkt, Rohtext |
| `suppressions` | Hash abgemeldeter und hart gebouncter Adressen — bleibt nach dem Löschen der Person, damit sie nie wieder angeschrieben wird |

#### Ablauf für den Leser

1. Formular unter dem Kalender-Abo-Block und im Footer: E-Mail, zwei
   Checkboxen **Newsletter** und **Race Reminder**, unter Reminder aufklappbar
   die Serien (Standard: alle). Sprache aus der URL. Honeypot, Turnstile und
   Rate-Limit wie beim Kontaktformular.
2. Bestätigungsmail mit signiertem Link (48 h). Erst der Klick setzt den Status
   auf `active` und schreibt Zeitpunkt, IP und Textversion — der
   Einwilligungsnachweis nach § 7 UWG. Unbestätigte Einträge werden nach sieben
   Tagen gelöscht.
3. **Race Reminder:** eine Stunde vor jedem Broadcast der gewählten Serien, in
   der Sprache und Zeitzone des Lesers, mit Link zu `/live` und dem Termin als
   `.ics` im Anhang (Builder aus Stufe 1).
4. **Newsletter:** einmal wöchentlich eine Ausgabe mit den Artikeln der letzten
   sieben Tage — **automatisch in allen sechs Sprachen**, weil das Press Tool
   jeden Artikel sechssprachig liefert. Keine Artikel, keine Ausgabe.
5. Jede Mail trägt Abmeldelinks **pro Thema und für alles**, signiert, ohne
   Login, plus `List-Unsubscribe` nach RFC 8058 — Gmail und Apple Mail zeigen
   den als eigenen Knopf.

#### Redaktion ohne Admin-Oberfläche

Eine Bedienoberfläche zum Schreiben und Freigeben wäre der teuerste Einzelteil
und wird nicht gebaut. Stattdessen: Der Wochen-Cron stellt die Ausgabe
zusammen und schickt eine **Vorschau an `contact@racespot.tv`** mit zwei
signierten Links — **„Senden"** und **„Diese Woche überspringen"**. Klickt
24 Stunden lang niemand, wird gesendet. Wer eine Ausgabe ändern will, ändert
den Artikel im Press Tool; die Vorschau zieht nach.

Verwaltung der Abonnenten über kleine, protokollierende Skripte im
Coolify-Terminal: Zahl je Thema und Sprache, Export, **Löschung einer Person
auf Verlangen** (Art. 17 DSGVO — landet als Hash in `suppressions`), Sperren
einer Adresse. Dazu eine Statusseite hinter Basic-Auth mit Zahlen und den
letzten Fehlern der Warteschlange.

#### Versand und Bounces — das, was ein Anbieter sonst übernimmt

- **Warteschlange:** Jede Mail wird erst in `mail_queue` geschrieben, nie
  direkt gesendet. Ein Coolify-„Scheduled Task" läuft jede Minute im
  Website-Container (`node scripts/mail-worker.mjs`), nimmt bis zu N Mails,
  hält das Stundenlimit ein, wiederholt Fehler mit wachsendem Abstand, gibt
  nach fünf Versuchen auf und protokolliert. Ein Deploy mitten im Versand ist
  ungefährlich — der Zustand liegt in der Datenbank.
- **Return-Path** je Mail `bounce+<id>@racespot.tv` (Catch-all bei All-Inkl).
  Ein zweiter Task holt dieses Postfach per IMAP ab, liest die Fehlermeldungen
  (RFC 3464), ordnet sie über die ID zu und deaktiviert nach einem harten oder
  drei weichen Bounces.
- **Eigener Absender**, nicht `contact@` — schützt das Kontaktpostfach,
  falls der Ruf einmal leidet. `news@racespot.tv` oder `press@racespot.tv`
  (Jürgen, 2026-09-15: eines von beiden); **eine** Adresse für beide Themen,
  damit sich der Ruf nicht auf zwei Adressen verteilt. SPF ist da, **DKIM im KAS
  aktivieren, DMARC-Eintrag setzen** — DNS macht Philip. Danach Google
  Postmaster Tools eintragen, um Beschwerden und Ruf zu sehen.

#### Die Bauteile

| Teil | Tage |
|---|---|
| Postgres in Coolify, Schema, Migrationen, Verbindung aus der Website, täglicher Dump auf die Storage Box | 1 |
| Anmeldung: Formular mit zwei Themen und Serienwahl, drei API-Routen, Token, Bestätigungsmail, Statusseite `/{lang}/newsletter` | 1,5 |
| Warteschlange und Worker: Tabelle, Drosselung, Wiederholung, Vorlagen (Bestätigung, Reminder, Newsletter) in sechs Sprachen, Text- und HTML-Fassung | 1,5 |
| Race Reminder: stündlicher Task, Fenster 60–120 min, `reminder_log`, `.ics`-Anhang | 0,5 |
| Newsletter: Wochen-Task, Zusammenstellung aus `ARTICLES`, Vorschau mit Senden/Überspringen, Ausgaben-Protokoll | 1 |
| Bounces: Postfach, IMAP-Abholung, DSN-Auswertung, Deaktivierung, Unterdrückungsliste | 1 |
| Zustellbarkeit: DKIM, DMARC, Postmaster Tools, Tests mit echten Postfächern (Gmail, Outlook, Apple, GMX), Spam-Score | 1 |
| Verwaltung: Skripte, Statusseite, Löschung auf Verlangen | 0,5 |
| Recht und Texte: Datenschutz de+en (heute steht dort wörtlich „keinen Newsletter"), Einwilligungstext, Verarbeitungsverzeichnis, ~60 Schlüssel × 6 Sprachen | 0,5 + Freigabe |
| Betriebshandbuch: was tun bei Bounce-Welle, Sperrliste, vollem Postfach, Wiederherstellung aus dem Backup | 0,5 |

**Reihenfolge:** Datenbank → Anmeldung mit Bestätigung → Warteschlange →
Reminder → Newsletter → Bounces → Zustellbarkeit → Recht. Nach dem dritten
Schritt kann man schon Adressen sammeln, auch wenn noch nichts verschickt
wird; nach dem vierten läuft der Reminder. Nichts geht live, bevor die
Datenschutzerklärung freigegeben ist.

#### Annahmen, die sich ändern lassen

- Newsletter **wöchentlich** als Zusammenfassung. Sofortversand einzelner
  Pressemitteilungen wäre derselbe Mechanismus mit anderem Auslöser (Kategorie
  `Company`), ein halber Tag mehr.
- Serien **einzeln wählbar plus „alle"** als eigene Option — entschieden
  (Jürgen, 2026-09-15). „Alle" ist ein Flag, keine Liste aller Serien, damit
  eine neue Serie im Master Schedule automatisch mit erinnert wird.
- Erinnerung **eine Stunde** vorher. Ein zweiter Zeitpunkt (Vortag) wäre ein
  zweites Fenster im selben Task.

**Der Einwand von Stufe 1 gilt weiter:** Für angesetzte YouTube-Streams gibt es
die Erinnerungsglocke kostenlos. Der eigene Reminder ist der Grund, aus dem
jemand eine **Adresse** hinterlässt — und genau die gehört dann uns, auf
unserem Server. Dafür sind neun Tage der Preis.

## 7i. Aufzeichnungen, eigener Player, Follow-Leiste — 2026-09-16

**Anlass (Jürgen):** Vergangene Monate im Kalender waren leer, vergangene
Broadcasts verlinkten nach YouTube, und es gab außer den Footer-Icons keinen
Ort, der zum Abonnieren einlud.

**Vergangene Broadcasts im Kalender.** `getCalendarEvents()` behält jetzt
die letzten 365 Tage (`CALENDAR_PAST_DAYS`), vorher nur Kommendes und Live.
Für die Aufzeichnung dazu gibt es **keine Spalte im Master Schedule** — 3.209
vergangene öffentliche Zeilen, kein einziger YouTube-Link. Die Zuordnung
kommt deshalb vom Kanal selbst (`src/lib/replays.ts`): Upload-Playlist des
Kanals bis zum Stichtag durchblättern, pro 50 Videos `liveStreamingDetails`
holen, und ein beendeter Stream, der binnen drei Stunden um den geplanten
Start losging, ist die Aufzeichnung. Titel entscheiden nur bei mehreren
Kandidaten — das Sheet sagt „Porsche Club of America S16 - Club", YouTube
sagt „PCA Sim Racing Series 16 | Event 2 | Club Class at Portland". Index per
`unstable_cache` 24 h, ~20 Quota-Einheiten am Tag. **Gemessen: 372 von 412
vergangenen Broadcasts zugeordnet (90 %)**; die Lücke sind vor allem die
„eNASCAR … BS+ Team Stream"-Zeilen, die auf einem fremden Kanal laufen.
Ohne Zuordnung führt der Klick zur Stream-Liste des Kanals auf YouTube, und
das YouTube-Icon neben der Uhrzeit bleibt — abgedunkelt, mit demselben Ziel
und dem Tipp „Keine Aufzeichnung gefunden" — damit jeder vergangene Termin
denselben Knopf an derselben Stelle hat. Nachgeprüft am Beispiel eNASCAR
(Jürgen, 2026-09-16): Das Sheet sagt „RaceSpot's YT", die Streams liegen aber
auf dem Kanal **BSCOMPETITION**; auf unserem Kanal gibt es sie nicht. Das ist
keine Lücke im Matching, sondern eine Frage, auf welchem Kanal gesendet wurde.

**Der Player** (`src/components/video/VideoPlayerProvider.tsx`): ein Dialog
über der Seite, `youtube-nocookie.com`, Escape/Backdrop schließen, Fokus geht
zum Schließen-Knopf und zurück zum Auslöser, Seite dahinter scrollt nicht.
Öffnet sich von: vergangenen Terminen im Kalender (Raster und Liste),
`VideoCard` (Startseite, Broadcasts) und `PlaylistCard` (Broadcasts, als
`videoseries?list=`). „Auf YouTube öffnen" bleibt im Dialog für Kommentare
und Verlauf. **Offen: Datenschutzerklärung.** Abschnitt 7 nennt Live
(`youtube.com`) und Events (`youtube-nocookie.com`); der Player ist derselbe
nocookie-Modus, jetzt aber auch auf Startseite, Broadcasts und Kalender —
ein Satz, de und en zusammen, Freigabe Jürgen.

**Follow-Leiste** (`src/components/ui/FollowUs.tsx`): „Auf YouTube abonnieren"
ist ein Link mit `sub_confirmation=1` — YouTube fragt selbst „Abonnieren?",
kein Google-Skript auf unserer Seite. Daneben ein dezenter Knopf „Weitere
Kanäle", der die fünf anderen Profile als Auswahl aufklappt; alle Ziele in
neuem Tab. Die Kanalliste liegt jetzt einmal in `src/lib/socials.tsx`
(Footer liest daraus). Platziert: Startseite unter den letzten Broadcasts,
Broadcasts-Seite im Abschnittskopf, Live-Seite unter dem Stream bzw. im
Offline-Block (ersetzt den alten Abo-Link, `live.subscribe` weg), und im
Player unter dem Video.

**Nachgezogen am selben Tag (Jürgen):**

- **Die Glocke.** Der Index führt jetzt auch die **angesetzten** Streams
  (`scheduledStartTime`, noch kein `actualStartTime`); kommende Termine
  werden im selben Drei-Stunden-Fenster darauf gematcht. Im Kalender-Menü
  eines Termins steht dann als dritter Eintrag „🔔 Auf YouTube erinnern
  lassen" → die Watch-Seite des angesetzten Streams, wo die YouTube-Glocke
  sitzt. Auf der Live-Seite im Offline-Zustand derselbe Knopf für den
  nächsten Broadcast, wenn er schon angesetzt ist. Cache-Schlüssel des Index
  auf `-v2`, weil die Einträge das Feld `finished` bekommen haben.
- **Startseite ohne Extra-Platz** — zweiter Anlauf, nachdem die Zuschauer-
  Karte Jürgen nicht gefiel: „Auf YouTube abonnieren" sitzt jetzt **rechts im
  Kopf des Abschnitts „Neueste Broadcasts"**, neben „Alle Broadcasts →" —
  dort, wo die Videos sind; die weiteren Kanäle hinter einem ···-Icon
  (`FollowUs compact`). Die Kopfzeile gab es schon, also kein neuer Block.
  Unter `sm` ausgeblendet wie der Link daneben.
- **Hero und Ticker:** Neben dem nächsten Broadcast im Hero und hinter jedem
  Termin im gelben Laufband ein 24-px-Kalender-Icon mit demselben Menü wie
  im Kalender (Eintrag, Serie, Glocke). Im Laufband in Schwarztönen
  (`tone="light"`), und das Band **pausiert, solange ein Menü offen ist**
  (`.pause-on-hover:has([aria-expanded="true"])`), sonst liefe der Knopf
  unter seinem Menü weg. Der Knopf steht außerhalb des Links, weil ein Button
  in einem Anker nicht erlaubt ist.
- **After-Movie ohne Bild (Jürgen):** Für dieses Video gibt es kein
  `maxresdefault.jpg` (404), nur `sddefault`. `VideoPoster` fragt jetzt die
  größte Version an und fällt bei Fehler auf `sddefault`, dann `hqdefault`
  zurück; 4:3-Standbilder werden per `object-cover` von ihren Balken befreit.
- **„Latest Broadcasts leitet zu YouTube" (Jürgen):** Live nachgestellt —
  die drei Karten sind Buttons ohne Link, der Klick öffnet den Player mit
  `youtube-nocookie`-Frame. Wahrscheinlich eine vor dem Deploy geladene Seite;
  falls es wieder auftritt: welches Video, welches Gerät.
- **Events-Seite:** Der After-Movie war ein iframe, das beim Laden mitkam.
  Jetzt ein Standbild mit Play (`VideoPoster`), das denselben Player öffnet —
  nichts von YouTube lädt, bevor jemand drückt. Damit läuft **jedes Video
  der Website** über den einen Player; einzige Ausnahme bleibt der
  Livestream auf `/live`, der weiter direkt eingebettet ist (Chat daneben).

## 7j. UI-Durchgang über alle Seiten — 2026-09-16

Auf Jürgens Wunsch alle zwölf Seiten in 1280 und 375 px per DOM-Prüfung
durchgesehen (Überlauf, Überschriften, Alt-Texte, unbenannte Bedienelemente,
Ziele unter 24 px, Text unter 11 px, unbeschriftete Eingabefelder, englische
Reste auf deutschen Seiten). Kein horizontaler Überlauf, keine
Überschriftenlücke, keine Bilder ohne Alt. Gefunden und behoben:

| Wo | Was | Fix |
|---|---|---|
| Live (offline) | Countdown-Einheiten 10 px | 11 px |
| Kalender | Karussell-Pfeile in den Tageszellen 20 px; Replay-Marke 10 px | 24 px; 11 px |
| Events | Foto-Punkte 6×4 px, ohne Namen | 24-px-Knopf um den Punkt, `aria-label` „Foto 2 / 5", `aria-current` |
| Broadcasts | Suchfeld nur mit Platzhalter; „12 videos", „48 playlists" englisch | `aria-label`; Zählungen übersetzt mit Ein-/Mehrzahl (`count()`) |
| Artikel | Fotocredit 10 px | 11 px |

Bewusst gelassen: Textlinks in Fließtext (Kontakt, Datenschutz, Impressum)
sind 17–20 px hoch — Links im Satz sind von der Zielgrößen-Regel ausgenommen.

**Nachgemeldet von Jürgen am 2026-09-17, behoben:**

- **Live-Chat weiß auf weiß.** YouTubes `live_chat`-Embed kommt im hellen
  Theme; mit `color-scheme: dark` der Seite wurde daraus Weiß auf Weiß. Jetzt
  `&dark_theme=1` an der Embed-URL, `color-scheme: dark` am Frame, dunkler
  Container (kein weißer Blitz beim Laden), `title` am Frame. Nur bei laufendem
  Stream sichtbar — beim nächsten Live-Termin einmal ansehen.
- Der erste Deploy dieser beiden Fixes fiel wieder dem SSH-Abriss zum Opfer
  (fünfter Fall, Details in COOLIFY-BASELINE 6.5); der leere Commit danach
  lief durch.
- **YouTube-Icon im Knopf zu tief.** Eurostile sitzt hoch in seiner Zeile —
  die Versalien enden weit über dem Unterlängenraum —, ein auf die Zeile
  zentriertes Icon landet daher gut 1,5 px unter den Buchstaben. Regel in
  `globals.css`: jedes `svg` direkt in `.btn-primary/.btn-outline/.btn-ghost`
  rückt 1,5 px nach oben. Gemessen: Icon-Mitte vorher 384,2 px, nachher
  382,7 px bei Versalien-Mitte ≈ 382,5 px.

**Kalender-Verhalten nachgeschärft (Jürgen, 2026-09-17):**

- **Klick auf einen kommenden Termin öffnet das Erinnerungs-Menü** (Eintrag,
  Serie, Glocke) statt der Live-Seite — die ganze Karte bzw. Zeile ist jetzt
  die Fläche für dasselbe Menü, das hinter dem kleinen Icon steckt
  (`EventLink` mit `onOpenMenu`, `AddToCalendar` gibt seinen Auslöser per
  `triggerRef` heraus). Live-Termine führen weiter zur Live-Seite, vergangene
  in den Player. Tipp und Hover-Label sagen es: „Klick öffnet die
  Erinnerungs-Optionen", „Erinnern →".
- **Tage mit mehreren Streams** öffnen auf dem, der live ist, sonst auf dem
  nächsten noch kommenden, sonst auf dem ersten (`defaultIndex` in `DayCell`,
  auch beim Monatswechsel neu berechnet).
- **„Als Nächstes"** markiert den einen, allerersten kommenden Broadcast der
  ganzen Liste — derselbe, den der Hero nennt — in Raster und Liste
  (`UpNextBadge`). Bewusst nicht „der nächste des Tages": das wäre auf jedem
  Tag ein anderer und hieße nichts mehr.

**„Live" überall aus einer Quelle (Jürgen, 2026-09-17):** Der Kalender zeigte
LIVE, während Header und Ticker längst offline waren. Zwei Quellen, die
auseinanderlaufen mussten: Das Master Schedule kennt nur den **Plan** — sein
`isLive` heißt „zwischen geplantem Start und 90 Minuten nach geplantem Ende",
berechnet beim Rendern der Seite (bis zu 5 Minuten alt) — und bleibt wahr,
lange nachdem ein Stream vorzeitig geendet hat. YouTube weiß, was **tatsächlich**
läuft, minütlich gepollt vom `LiveStatusProvider`; Header, Hero und Ticker
hörten schon darauf, der Kalender nicht.

`src/components/sections/calendar/status.ts` versöhnt beides — eine Antwort
für Badge, Klickziel, Tipp, Hover-Label, Tages-Vorauswahl, „Als Nächstes",
Live-Banner und Ticker-Zeilen: vor dem geplanten Start → kommend; im Fenster
und YouTube live → **live**; im Fenster ohne YouTube → 15 Minuten lang noch
kommend (verspäteter Start), danach vergangen (vorzeitig beendet); nach dem
Fenster → vergangen. Uhr ist der Zeitpunkt des letzten Polls (`polledAt`),
damit im Render keine Wanduhr gelesen wird und alle Konsumenten im selben
Moment umschalten. Vor dem Mount gelten die Sheet-Flags, damit Server- und
erster Client-Render übereinstimmen. Ticker-Zeilen für Broadcasts, die laut
Sheet noch im Fenster, laut YouTube aber vorbei sind, fallen weg.

**„No broadcasts available" auf der Broadcasts-Seite (Jürgen, 2026-09-17):**
Nicht die API-Quota — beide Schlüssel antworteten normal. **YouTubes
RSS-Feed** (`feeds/videos.xml?channel_id=…`) lieferte den Abend über erst 500,
dann 404, vom Server wie vom Mac. Alles, was „neueste Videos" brauchte, hing
allein an diesem Feed: Broadcasts-Seite, Startseite, und die erste Stufe der
Live-Erkennung. Behoben und gleichzeitig die API-Nutzung durchgesehen:

- **`getRecentVideos()`** in `youtube.ts`: RSS zuerst (0 Einheiten), bei
  Ausfall die **Upload-Playlist** des Kanals (`playlistItems.list`, 1 Einheit,
  1 h Cache). Alle drei Verbraucher lesen daraus. Broadcasts erscheinen wieder,
  obwohl RSS weiter 404 liefert.
- **Search-API gedeckelt.** 100 Einheiten pro Aufruf, und jeder offene Tab
  pollt `/api/live-streams` minütlich. Wenn das Sheet „live" sagt und die
  Erkennung nichts findet, lief die Suche bisher bis zu einmal pro Minute —
  6.000 Einheiten pro Stunde, das Tageskontingent (10.000) in unter zwei
  Stunden, danach fällt der Live-Schlüssel auf den Hauptschlüssel zurück und
  reißt Broadcasts und Playlists mit. Jetzt: `unstable_cache` 300 s für **jeden**
  Aufrufer (Route-Fallback und Scrape-Pfad teilen sich den Cache), und die
  Route sucht nur in den **ersten 30 Minuten** nach geplantem Start — danach
  heißt „nicht gefunden" schlicht „nicht auf Sendung". Worst case jetzt
  ~600 Einheiten pro Broadcast-Start statt 9.000 pro Sendefenster.
- **Kein Hinweis mehr, sondern weglassen.** Kommen keine Aufzeichnungen, fehlt
  der Abschnitt „Neueste Broadcasts" ganz; die Follow-Leiste rückt neben die
  Überschrift „Serien-Playlists" (`followSlot`). Startseite: statt zweier
  Videos die zwei neuesten Playlists, die Kanal-Kachel bleibt. Die alten
  Emoji-Platzhalter (`FallbackBroadcasts`) und ihre acht Schlüssel sind weg;
  `PlaylistCard` liegt jetzt in `components/ui` für beide Seiten.
- **After-Movie-Poster kam verzögert (Jürgen):** Der Poster fragte blind
  `maxresdefault` an, bekam 404 durch den Bildoptimierer und lud dann erst
  `sddefault` — zwei Roundtrips. Jetzt wählt die Events-Seite das Standbild
  serverseitig über `getVideoThumbnail()` (1 Einheit, 24 h Cache) und gibt es
  dem Poster mit `priority`; der Browser lädt einmal, sofort.

Quota-Bilanz pro Tag (Hauptschlüssel): Stats 4 + Uploads 24 + Details 24 +
Playlists 1 + Replay-Index ~20 + Poster 1 ≈ **75 Einheiten**. Live-Schlüssel:
Erkennung 1 440 (minütlich) + Suche höchstens 6 pro Broadcast-Start.

**Mobil-Durchgang (Jürgen, 2026-09-17):**

- **Laufband und Partner-Band standen auf dem Handy.** Erster Fund:
  `.pause-on-hover` pausierte bei `:hover` und `:focus-within` — auf
  Touch-Geräten bleibt beides am zuletzt angetippten Element hängen. Beide
  Regeln jetzt nur unter `@media (hover: hover)`. **Reichte auf Jürgens iPhone
  nicht.** In Chromium-Emulation (375 px, `hover: none`) laufen beide Bänder;
  das Live-CSS ist in Ordnung (Keyframes auf oberster Ebene, Utility
  `animation: var(--animate-ticker)`, Variable in `@layer theme`). Bleibt als
  wahrscheinlichste Ursache **„Bewegung reduzieren"** in den iOS-Bedienungs-
  hilfen: Der `prefers-reduced-motion`-Block kappt jede Animation, und ein
  eingefrorener Streifen sah dann nach Fehler aus. Deshalb jetzt ein
  gestaltetes Verhalten statt Stillstand: Das **Laufband zeigt einen Termin
  auf einmal und wechselt alle sechs Sekunden** (`usePrefersReducedMotion`
  in `Ticker.tsx`, kein Dauer-Scrollen, aber jeder Termin kommt dran); die
  **Partner-Logos brechen einmal umlaufend um** — die drei Schleifenkopien
  (`data-copy`) und die Randverläufe (`.marquee-fade`) sind unter reduced
  motion ausgeblendet. Offen: Jürgen prüft die Einstellung; falls sie aus
  ist, ist die Ursache eine andere und braucht ein echtes iOS zum Testen
  (kein Xcode auf diesem Mac, Simulator nicht verfügbar).
- **Zwei Play-Symbole übereinander (Events).** Das war das Zeichen „▶"
  (U+25B6), das iOS als Emoji zeichnet — blaues Kästchen mit weißem Dreieck im
  gelben Kreis. Überall durch `PlayIcon` (SVG) ersetzt: Poster, Videokarte,
  Hero, Live-Banner, Replay-Marke.
- **Tooltips bei Touch aus.** `Tip` zeigt nur bei `(hover: hover)`; ein Tipp,
  der einen Tipp braucht, stritte sich mit dem Klick, auf dem er sitzt.
  Nichts in einem Tipp ist essenziell.
- **Broadcasts:** Der Playlist-Filter öffnete rechtsbündig und lag bei 375 px
  200 px links außerhalb — jetzt `left-0` unter `sm`. „Filter by Series" und
  „Clear all" übersetzt. Follow-Leiste im Kopf kompakt (Abonnieren + ···),
  `.section-header` bricht um statt zu quetschen.
- **Einheitliche Follow-Leiste:** auf Handys „Abonnieren", ab `sm` „Auf
  YouTube abonnieren"; Variante `stretch` = eine Spalte voller Breite (Live
  offline: Abonnieren / Weitere Kanäle / YouTube-Erinnerung / Kalender
  ansehen untereinander, ab `sm` zentrierte Zeile, Glocke mit Kurzlabel).
- **Kalender:** Abo-Knopf unter `sm` nur als Icon mit `aria-label`; die
  Steuerleiste löst ihre linke Gruppe unter `xl` per `contents` auf und ordnet
  per `order`: Monat / Umschalter + Abo-Icon / Zeitzone.

**Artikel nach Datum sortiert, Press-Tool-Vertrag erweitert (2026-09-17,
Übergabe aus der Press-Tool-Sitzung):** `date` ist seit heute der
Veröffentlichungstag (oder ein bewusst gewählter früherer Tag), nicht mehr der
Tag des Ereignisses, und die Reihenfolge im Array bedeutet nichts mehr — das
Tool fügt oben ein, egal welches Datum. Deshalb `sortedArticles()` in
`articles.ts` (nach `date` absteigend, innerhalb eines Tages nach
`publishedAt`), benutzt von Newsliste, Startseiten-Teasern, Vor/Zurück im
Artikel und Sitemap. Neue Pflichtfeld `publishedAt` (ISO), optional
`updatedAt`, `topics[]`, `tags[]`; die acht Bestandsartikel haben
`publishedAt = date + "T09:00:00Z"` bekommen. Artikelseite zeigt „Aktualisiert"
mit `updatedAt`, wenn vorhanden; JSON-LD `dateModified` und Sitemap `lastmod`
sind `updatedAt ?? publishedAt`. Lokal geprüft: ein Testeintrag mit
`date: 2026-01-15` an Array-Position 1 erschien in der Liste an Position 7,
mit den richtigen Nachbarn; danach entfernt. Sichtbare Folge sofort: Der vom
Tool zuletzt eingefügte Porsche-Supercup-Artikel (05.09.) steht jetzt hinter
der Frankfurt-Ausstellerliste (09.09.), wo er hingehört. **Nicht gebaut:**
Themenfilter und Presse-Menü — laut Übergabe erst, wenn mindestens zwei Themen
Artikel haben; heute trägt noch kein Artikel `topics`.

**Abonnieren auf der Startseite, dritter Anlauf (Jürgen):** Statt drei
Aufzeichnungen zeigt „Neueste Broadcasts" jetzt **zwei plus eine Kanal-Kachel**
(`ChannelCard`) an der Stelle der dritten — gleiche Proportionen wie eine
Videokarte: oben YouTube-Logo, `@RaceSpotTV` und die Abonnentenzahl (aus
`getSiteStats().youtubeSubscribers`, auf Hunderter abgerundet), unten ein Satz,
der Abonnieren-Knopf und die fünf anderen Kanäle als Icons. Kein Extra-Block,
und der Aufruf steht dort, wo man gerade gesehen hat, was man bekommt. Die
kompakte Follow-Leiste im Abschnittskopf ist damit wieder weg.

## 7k. Kalender auf dem Handy — 2026-09-17

**Befund** (Screenshot iPhone, Safari): Die Monatsansicht erzwang 700 px
Mindestbreite und scrollte seitlich. Sichtbar waren vier von sieben Tagen, die
Kacheln standen in 10-px-Schrift, Serienname auf zwei Zeilen abgeschnitten,
Kalender-Knopf 24 px. Nichts davon war auf einem Daumen bedienbar.

**Muster**: Jede Handy-Kalender-App (iOS Kalender, Google Kalender, Fantastical)
löst das gleich — ein kompaktes Sieben-Spalten-Raster, in dem jeder Tag nur
Zahl und Punkte trägt, darunter der gewählte Tag ausgeschrieben. Unter ~360 px
sind Rasterkacheln nicht mehr bedienbar; die Liste ist die eigentliche
Arbeitsansicht, das Raster nur Navigation.

**Umsetzung** (`calendar/GridView.tsx`, `MonthCompact`, nur unter `md`):

- Sieben Spalten passen in 375 px (7 × ~47 px). Jeder Tag ist ein Knopf ≥ 52 px
  hoch mit Tageszahl (14 px) und bis zu drei Punkten: gelb kommend, rot live,
  grau vergangen. Heute wie am Desktop als gelber Kreis.
- Darunter der gewählte Tag als Überschrift und seine Broadcasts in den Zeilen
  der Listenansicht (`EventRow`, exportiert, `showDate={false}`) — 14 px Titel,
  44-px-Knöpfe, dieselben Menüs wie überall.
- Öffnet auf dem Tag, der zählt: live → nächster Broadcast → heute → erster Tag
  mit Einträgen. Ein Tipp merkt sich den Tag nur für diesen Monat.
- Wischen nach links/rechts blättert den Monat, über dieselben Handler wie die
  Pfeile. Vertikal bleibt der Seite.
- Zeiten in den Listenzeilen von 11 auf 12 px.

Desktop-Raster unverändert (`hidden md:block`). Beide Varianten stehen im HTML;
CSS entscheidet, damit nichts beim Hydrieren springt. Seit dem Umbau öffnet der
Kalender auf jeder Breite im Raster (vorher auf Handys in der Liste, weil das
Raster dort nicht passte) — Jürgens Wunsch nach dem ersten Blick, 2026-09-17.

**Live-Seite** im selben Commit: Erinnerung und Kalender-Knopf links, YouTube
(Abonnieren, weitere Kanäle) rechts; auf dem Handy eine Spalte in dieser Reihenfolge.

## 7l. Drittes Kontaktformular: Event — 2026-09-18

Der Reiter **Event** steht zwischen Broadcast und Allgemein. Er läuft über
denselben Endpunkt (`/api/contact`, `type: 'event'`), dieselbe Honeypot-,
Turnstile-, Rate-Limit- und Dedup-Kette und denselben Mailweg (interne
Benachrichtigung + Kopie an den Absender; ohne SMTP der mailto-Fallback).

Felder: Name*, E-Mail*, Geschäftsadresse; Name des Events*, Beginn*, Ende
(leer = eintägig), Startzeit; „Ist ein Broadcast vom Event geplant?"* Ja/Nein;
„Ist eine Location vorhanden?"* Ja/Nein, bei Ja das Pflichtfeld „Wenn ja, wo?";
Allgemeine Infos. Alles in sechs Sprachen.

Die beiden Ja/Nein-Fragen sind echte Radio-Gruppen, nur visuell als zwei
Knöpfe: Pfeiltasten, ein Tabstopp und die Ansage im Screenreader bleiben die
des Browsers. Zwei Optionen beantwortet man so schneller als über ein
Auswahlmenü, und auf dem Handy öffnet sich kein Systemdialog.

Serverseitig neu geprüft: Enddatum nicht vor Beginn (Fehlercode `range`),
Ja/Nein nur als `yes`/`no` (ein manipulierter Wert fällt auf `select`),
Ortsangabe nur dann Pflicht, wenn „Ja" gewählt ist. Beides — Client und
Server — prüft dieselben Regeln.

Nebenbei repariert: Feldfehler **vom Server** wurden im Browser alle als
„Dieses Feld ist ein Pflichtfeld" angezeigt, weil die Codes (`email`, `url`,
`date` …) gegen die Tabelle der *Formular*-Codes geprüft wurden. Dafür gibt es
jetzt `FIELD_ERRORS`. Sichtbar wurde das praktisch nie, weil der Client
dieselben Regeln vorher prüft.

Die Reiterleiste hat jetzt drei Spalten. Auf einem 375-px-Display bleiben ~103 px
je Reiter; „Transmisión" und „Transmissão" passen dort nicht in eine Zeile und
wurden abgeschnitten. Kleinere Schrift, engere Innenabstände und automatische
Silbentrennung (`hyphens-auto`, Sprache kommt aus dem Dokument) lösen das —
in allen sechs Sprachen gemessen, nichts wird beschnitten.

## 7m. Aufzeichnungen fehlten einen Tag lang — behoben 2026-09-21

**Meldung**: Im Kalender stand bei den Streams von gestern und von heute früh
kein Replay, obwohl es die Aufzeichnungen gibt.

**Befund**: Kein Fehler in der Zuordnung. Alle drei Sendungen lagen auf YouTube
mit Start binnen sechs Minuten am Zeitplan — weit innerhalb des
Drei-Stunden-Fensters. Der Replay-Index selbst war 35 Stunden alt: Er kannte
den Britcar-Stream, der am 19.09. um 18:36 UTC endete, aber nichts danach.
`getReplayIndex` lag hinter **einem** `unstable_cache`-Eintrag mit 24 Stunden
Laufzeit, und alles darin alterte gemeinsam.

Das traf drei Dinge gleichzeitig: Aufzeichnungen entstehen erst beim Ende eines
Streams, angekündigte Streams (die Glocke) erscheinen erst beim Ansetzen, und
beides sind genau die Einträge, die sich ständig ändern.

**Umbau** (`src/lib/replays.ts`): `unstable_cache` raus, stattdessen trägt jede
Anfrage an YouTube ihre eigene Lebensdauer im Next-Fetch-Cache. Die neueste
Seite der Uploads (50 Videos, reicht rund 45 Tage zurück) wird alle **10
Minuten** erneuert, jede ältere Seite einmal am Tag. Pro Seite genau ein
`videos.list`, damit Charge und Seite dieselbe Lebensdauer haben.

**Kosten**: 2 Einheiten alle 10 Minuten ≈ 300 pro Tag, plus 16 für das Archiv,
gegen ein Kontingent von 10.000. Vorher ~16 pro Tag, aber einen Tag zu spät.

**Zwei Datenpunkte, kein Code-Thema** (für Jürgen):
- Britcar 24 steht als **eine** Zeile im Master Schedule, liegt auf YouTube
  aber als vier Teile. Am selben Tag nachgezogen — siehe 7n.
- Die **British F4 Esports Championship 2026** (ab 23.09., acht Runden) steht
  im Master Schedule auf `Public = No`, wird auf YouTube aber öffentlich
  angekündigt. Deshalb fehlt sie im Kalender. Die Saison 2025 stand auf `Yes`.

## 7n. Mehrteilige Übertragungen — 2026-09-21

Eine 24-Stunden-Übertragung geht als vier Streams à sechs Stunden raus, der
Zeitplan hat dafür **eine** Zeile. Bisher hing daran nur Teil 1.

**Erkennung** (`src/lib/replays.ts`): Ein Teil beginnt, sobald der vorige
endet — bei Britcar 24 mit Lücken von 20, 37 und 27 Sekunden — und trägt
praktisch denselben Titel. Die Kette läuft also über `actualEndTime` des
vorigen Teils, ein Fenster von 20 Minuten und mindestens 75 % Titelüberlappung.

**Zwei Durchgänge, und die Reihenfolge ist der Punkt.** Erst holt sich jeder
Termin den Stream, der seinem Startzeitpunkt am nächsten liegt. Erst danach
greift ein Termin nach den Fortsetzungen. In einem Durchgang würde eine lange
Sendung den Stream der Zeile danach schlucken: Zwei Klassen derselben Serie
laufen direkt hintereinander unter fast identischem Titel, und die Aufzeichnung
der zweiten würde als Teil 2 der ersten gelesen. Nach Durchgang eins ist sie
bereits vergeben.

**Wiedergabe**: `videoParts` trägt alle IDs in Reihenfolge, der Player hängt sie
über YouTubes eigenen `playlist`-Parameter aneinander — ein Klick, vier Teile
nacheinander, mit den Weiter-Knöpfen des Players. Das Replay-Abzeichen zeigt die
Anzahl (`Replay · 4`), der Hover-Text nennt sie im Satz.

**Gegen die echten Daten geprüft** (503 Termine im Kalenderjahr, 379 mit Video):
genau 7 mehrteilige Sendungen, alle Langstrecke — Britcar 24, Spa 24,
Nürburgring 24, MSUK 24 Hours of Silverstone, Race for a Cause 24, VCO Infinity,
Porsche Carrera Cup Onboard. Kein Video doppelt vergeben, keine Zuordnung
verloren.

## 7o. Replay-Zuordnung komplett durchgesehen — 2026-09-21

**Meldung**: eNASCAR BS+ Team Stream Runde 10 hat kein Replay.

**Ursache**: Die Sendung liegt gar nicht auf unserem Kanal. Die eNASCAR
Coca-Cola iRacing Series geht auf **BSCOMPETITION** raus
(`UCShyEtI5TtHi5y_4G3owN6A`), der Zeitplan schreibt in der Ziel-Spalte
trotzdem „RaceSpot's YT" — wie bei 495 von 502 öffentlichen Zeilen des
Jahres. Der Index las nur unsere eigenen Uploads, also konnte keine der
zwölf eNASCAR-Zeilen jemals eine Aufzeichnung finden.

**Partnerkanäle** (`PARTNER_CHANNELS` in `src/lib/replays.ts`): Die Kanal-ID
steht im Repo statt in der Umgebung, damit das Hinzufügen eine
nachvollziehbare Änderung mit Begründung daneben ist. Was so ein Kanal sonst
noch sendet — Interviews, Rocket League, Clips — kann nicht versehentlich
zugeordnet werden: In den Index kommen nur Live-Streams, und ein Stream von
dort muss zusätzlich die Hälfte seines Titels mit dem Seriennamen teilen
(`PARTNER_TITLE_OVERLAP`). Aktualisierung alle 30 statt 10 Minuten: Ein
Partnerkanal trägt eine unserer Runden alle zwei Wochen.

Ergebnis: alle elf vergangenen eNASCAR-Runden verknüpft, Runde 10 (Michigan)
mit `YbYafUGRujE`.

### Beim Durchsehen gefunden und mitbehoben

**Fremde Langstrecken-Sendungen wurden eingesammelt.** Eine Zeile, deren
eigene Übertragung nie aufgezeichnet wurde, griff sich, was sonst gerade lief:
„Porsche Carrera Cup Deutschland Onboard" bekam „iRacing Petit Le Mans",
„VCO ERC" bekam „iRacing Daytona 24", „iRacing Special Event: IMSA Classic
500" bekam „IVRA 6H São Paulo". Langstrecken laufen stundenlang, also liegt
fast immer irgendetwas im Drei-Stunden-Fenster. Jetzt entscheidet die Uhr nur
noch innerhalb **einer Stunde** allein; darüber hinaus müssen Zeitplanname und
Streamtitel mindestens ein echtes Wort teilen — eine nackte Zahl zählt nicht
(„Rennsport Summit #2" und „iRacing Bathurst 12 | Part 2" teilen nur die 2).

Die Stunde ist bewusst großzügig: Über lange Strecken des Bestands weichen
Zeitplan und Kanal systematisch um gut fünfzig Minuten voneinander ab — jede
Porsche-Club-Runde der Saison 14, jeder Svensk-eRacingLigan-Abend, jede
British-F4-Runde 2025. Das sind die richtigen Aufzeichnungen unter der
falschen Uhr.

**Die frühere Zeile war im Vorteil.** Durchgang eins lief chronologisch, also
konnte eine früh angesetzte Zeile eine Aufzeichnung wegnehmen, die eine andere
Zeile besser benennt. Jetzt werden alle möglichen Paarungen bewertet und die
beste zuerst vergeben: stärkste Übereinstimmung der Namen, bei Gleichstand der
nähere Start.

**Gemessen** (503 Termine, davon 414 vergangen): 384 vergangene mit
Aufzeichnung statt vorher 379, kein Video doppelt vergeben. Acht Zuordnungen
haben sich geändert: vier falsche entfernt, drei Aufzeichnungen auf die
richtige Zeile verschoben (Petit Le Mans, IVRA São Paulo, IVRA Monza), eine
alte eNASCAR-Zeile gab Operation eMotorsport zurück.

### Abkürzungstabelle — nachgezogen 2026-09-22

Die bekannte Grenze war: Wo zwei Zeilen denselben Stream gleich gut benennen,
gewinnt die zeitlich nähere. Am 24.09. trug „iRacing Short Course Pro 2
National Series" (01:00) denselben Trefferwert wie „Porsche Club of America
S16 - Pro" (01:20) für „PCA … Pro Class at Sonoma" — beide teilen genau das
Wort „Pro" — und die frühere Zeile bekam ihn.

**Aus den Daten abgeleitet, nicht geraten.** Über alle Zuordnungen des Jahres
den Wortüberlapp zwischen Zeitplanname und Streamtitel gemessen und die
schwächsten angesehen. Es sind sechs systematische Fälle, und wo sie
auftreten, treten sie jedes Mal auf:

| Zeitplan | Kanal |
|---|---|
| Porsche Club of America | PCA |
| VCO ERL | Esports Racing League |
| Racecraft Rallycross | (Sponsor) iRX Championship |
| Next Level Racing / Channel 199 | NLR / Channel199 |
| SimGamingExpo | Sim Gaming Expo |
| Svensk eRacingLigan | Svenska Eracingligan |

`ALIASES` in `src/lib/replays.ts` bildet jede Schreibweise auf ein Token ab,
angewandt auf beide Seiten **vor** dem Zerlegen in Wörter — deshalb überlebt
„sim gaming expo", obwohl „sim" allein auf der Stoppwortliste steht.

**Wirkung, gegen die echten Daten gemessen**: genau zwei geänderte Zuordnungen.
Die Porsche-Zeile bekommt ihren angekündigten Stream (und damit die Glocke),
die Short-Course-Zeile keinen — ihr eigener ist noch nicht angesetzt. Sonst
bewegt sich nichts, kein Video doppelt vergeben.

Die Tabelle nimmt nur auf, was nachweislich dieselbe Serie meint. Alles andere
würde zwei verschiedene Übertragungen gleich aussehen lassen.

## 7p. KI-Hinweis unter den Press-Tool-Artikeln — 2026-09-21

Das Press Tool schreibt den Hinweis künftig selbst ans Ende jedes Artikels.
Alle neun bereits veröffentlichten Artikel haben ihn von Hand bekommen, in
allen sechs Sprachen: beide MOZA-Artikel durch **Ersetzen** der bestehenden
Quellenzeile (die Links verschwinden aus dem Text, sie stehen weiter in
`sources`), die übrigen sieben als **neuer** letzter Block.

**In zwei Schritten, weil die Vorlage widerrufen wurde.** Die erste Fassung
nannte fünf Artikel ausdrücklich handgeschrieben und verbot den Hinweis dort —
„it would be a false statement about somebody's own work". Die zweite Fassung
vom selben Tag verlangt ihn für alle neun.

**Von Jürgen bestätigt (2026-09-21)**: „der hinweis ist alt. Bitte schreibe
jetzt immer den hinweis, das AI dabei geholfen hat. auch für die alten." Damit
ist es keine Auslegungsfrage mehr, sondern die Hausregel: Jeder Artikel trägt
die Zeile, in allen sechs Sprachen, auch jeder ältere. Steht so in `CLAUDE.md`,
damit keine spätere Sitzung sie wieder entfernt.

**Zwei Datenformen.** Die fünf älteren Artikel führen ihren englischen Text als
`content: string[]`, ihre Übersetzungen als `Block[]`. Gemischt werden darf
nicht, also steht im Englischen ein einfacher String und überall sonst ein
`p`-Block. Das Prüfskript der Vorlage fragt `b.kind === "p"` ab und meldet
deshalb für diese fünf fälschlich `NO NOTICE`; mit `typeof b === "string"`
geprüft ist alles vorhanden.

Nichts an `date`, `publishedAt`, `updatedAt`, `readTime` oder der
Array-Reihenfolge angefasst. Gegengeprüft: Die Ausgabe von `sortedArticles()`
ist Zeile für Zeile identisch mit der vor der Änderung, kein Artikel hat ein
`updatedAt` bekommen, und die Blockzahlen je Sprache sind um genau denselben
Betrag gewachsen wie im Englischen.

**Zur Vorlage**: Die Annahme „Blockzahlen sind über alle Sprachen einer Zeile
gleich" stimmte schon vor der Änderung nicht. Zwei Artikel tragen in den
Übersetzungen einen zusätzlichen Absatz („Dies ist eine automatische
Übersetzung …"), die anderen sieben nicht. Der Hinweis steht dort jeweils
**vor** diesem Absatz und sonst als letzter Block; die Differenz je Sprache ist
unverändert. Das Prüfskript meldet für diese beiden weiterhin `MISMATCH` —
vorher wie nachher, es ist kein Schaden dieser Änderung.

**Gestaltung** (die offene Frage aus der Vorlage): Ein Absatz, der komplett aus
einer Kursivstelle besteht und unter den letzten beiden Blöcken steht, wird
jetzt als Kleingedrucktes gesetzt — 13 px, kursiv, gedämpftes Grau — statt als
gelbes `<em>`. `footerNote()` in `articleContent.tsx`. Zwei Sätze gelbe
Kursivschrift unter jedem Artikel waren zu laut. Es trifft genau diese
Hinweiszeilen: Kursives mitten im Text behält sein Gelb.

## 7q. Google indexierte Next-eigene Prefetch-Adressen — 2026-09-22

**Befund aus der Analytics-Session**: 23 Adressen mit `?_rsc=…` in der Search
Console, 13,6 % aller Impressionen, in sieben Tagen kein einziger Klick. Der
Hash wechselt mit jedem Deploy, der Vorrat wächst also endlos.

Das sind die Prefetch-Anfragen des App Routers: Beim Überfahren eines Links
holt der Client die Route vorab unter `?_rsc=<hash>`. Googlebot rendert die
Seite, sieht diese Anfragen und legt sie als eigene Adressen ab. Im Browser
nachgestellt: Ein Klick auf „Kalender" erzeugt
`/de/calendar?_rsc=ZaRqeOm9pBfQmJ-M`.

**Umsetzung**: `X-Robots-Tag: noindex` für jede Adresse mit diesem Parameter —
in `next.config.mjs`, nicht im Proxy. Der Vorschlag lautete auf `src/proxy.ts`,
und genau dort geht es nicht: **Next entfernt `_rsc` aus der Anfrage, bevor die
Middleware läuft.** Gemessen mit einem Diagnose-Header —
`nextUrl.searchParams.has('_rsc')` ist `false`, und auch das rohe `request.url`
trägt den Parameter nicht mehr. Die `has`-Bedingung in `headers()` wird früher
ausgewertet und sieht ihn: sowohl bei der 200 auf `/en/events?_rsc=…` als auch
bei der 301, die `/events?_rsc=…` bekommt.

**Kein `Disallow` in der robots.txt.** Das verhindert nur den nächsten Besuch
und lässt stehen, was schon drin ist — der Crawler müsste die Seite abrufen
dürfen, um das `noindex` überhaupt zu sehen. Nachträglich sperren könnte man,
wenn Google die Adressen fallen gelassen hat; Crawl-Budget ist bei dieser
Seitengröße kein Thema, also bleibt es beim `noindex`.

Geprüft: Header erscheint nur mit Parameter, nicht auf `/en/events`,
`/de/calendar`, `/sitemap.xml` oder `/robots.txt`. Der Canonical-Tag zeigte
schon vorher auf die saubere Adresse; er allein hat die Konsolidierung nicht
erzwungen.

**Wirkung abwarten**: Google braucht für das Fallenlassen einige Wochen. Die
Zahl der `?_rsc=`-Adressen in der Search Console sollte gegen null gehen, ohne
dass die Impressionen der echten Seiten sinken.

## 7r. Der Hauptschlüssel war leer, und die Seite schwieg — 2026-09-22

**Symptom**: Nach dem Deploy der Abkürzungstabelle trug der Kalender live
**kein einziges** Video mehr — weder die Aufzeichnungen von gestern noch die
Glocken der kommenden Woche. Lokal, mit demselben Code und einem
Produktions-Build, waren alle 388 da.

**Befund aus dem Container-Log**:

```
[Live] LIVE_API_KEY failed in getLiveStreamsViaSearch (429), falling back to main API_KEY
[Live] Search API fallback failed: 403
YouTube videos API error: 403
```

Der Live-Schlüssel war aufgebraucht, und daraufhin lief die Suche auf den
**Hauptschlüssel** — den, der Uploads, Playlists, Vorschaubilder und den
Replay-Index der ganzen Seite holt. `search.list` kostet **100 Einheiten**;
alle fünf Minuten durch ein Sendefenster leert das ein Tageskontingent von
10.000. Danach antwortete auch der Hauptschlüssel mit 403, `getReplayIndex`
bekam auf Seite 1 einen Fehler, gab `[]` zurück — und der Kalender rendert
ohne Videos völlig fehlerfrei. Deshalb fiel es nur beim Nachmessen auf.

**Zwei Änderungen**:

1. **Die Suche fällt nicht mehr auf den Hauptschlüssel zurück.** Ist der
   Live-Schlüssel leer, entfällt die letzte Stufe der Live-Erkennung für den
   Rest des Tages. Die Erkennung über die Uploads-Liste (1 Einheit) läuft
   weiter. Eine Live-Erkennung ist eine Einheit wert, nicht den Tag der
   Website.
2. **Fehler nennen ihren Grund.** `apiError()` liest `error.errors[0].reason`
   aus der Antwort. „403" allein kann `quotaExceeded`, `keyInvalid` oder
   `accessNotConfigured` heißen — drei verschiedene Probleme, eine Zahl. Dazu
   eine Warnung in `replays.ts`, wenn der Index leer bleibt.

**Für Jürgen, in der Cloud Console zu prüfen**: Tagesverbrauch der YouTube
Data API v3 je Schlüssel, und ob sich an den Einschränkungen der Schlüssel
heute etwas geändert hat. Ist es reines Kontingent, erholt sich alles um
Mitternacht Pacific Time von selbst. Steht dort `keyInvalid`, wurde der
Schlüssel ausgetauscht und muss in Coolify nachgezogen werden.

## 7h. Jede Seite wurde bei jedem Aufruf neu gerendert — behoben 2026-09-15

Der Build markierte **alle** `[lang]`-Routen als `ƒ` (dynamisch), obwohl
Startseite, Kalender und Broadcasts längst ein `revalidate = 300` hatten und
sämtliche Datenabrufe gecacht sind. Auf einem geteilten Server heißt das: ein
voller Server-Render pro Besucher und pro Seite, dazu die RSC-Prefetches.

**Ursache: ein einziger `headers()`-Aufruf in `not-found.tsx`.** Die Datei
gehört zum Segment `[lang]`, und Next behandelt eine dynamische API irgendwo im
Render-Baum eines Segments als Eigenschaft des ganzen Segments. Die 404-Seite
las den Sprach-Header, den der Proxy setzt — und zwang damit die komplette
Website in den dynamischen Modus. Nachgewiesen, nicht vermutet: Aufruf
testweise entfernt, und zwölf Routen hörten auf, dynamisch zu sein.

**Lösung:** Die Sprache kommt jetzt aus der URL, gelesen im Browser
(`src/components/layout/NotFoundBody.tsx`, `useSyncExternalStore` — Server-
Schnappschuss ist Englisch, Client-Schnappschuss die echte Sprache, React löst
den Unterschied bei der Hydration auf statt ihn zu melden). Die Seite bleibt
statisch, der Statuscode bleibt 404, der Leser bekommt weiter seine Sprache.
Geprüft: `/de/gibt-es-nicht` → „Seite nicht gefunden", `/fr/pas-ici` →
„Page introuvable", beide mit 404.

**Und ein Haken, der dabei fast durchgerutscht wäre:** Neun Seiten hatten gar
kein `revalidate`. Vollständig statisch hätten sie den **Ticker** aus dem
Layout — die Liste der nächsten Broadcasts — zum Build-Zeitpunkt eingefroren
und bis zum nächsten Deploy so gezeigt. Deshalb steht das `revalidate = 300`
jetzt im Layout und gilt fürs ganze Segment; das passt zum Cache des Master
Schedule.

**Ergebnis:** Alle 72 Seiten sind `●` (vorgerendert, 5-Minuten-Fenster).
`Cache-Control` ging von `private, no-cache, no-store` auf
`s-maxage=300, stale-while-revalidate` — **66 von 72** Seiten sind jetzt
cachebar, die sechs Ausnahmen sind die `/live`-Seiten, die absichtlich
dynamisch bleiben. Statt eines Renders pro Besucher jetzt einer pro Seite und
Fünf-Minuten-Fenster.

**Der erste Deploy (`edfe29e`) ist fehlgeschlagen — und das lag nicht am
Umbau.** Das Log endete bei „Generating static pages (29/119)", Coolify
meldete „exit code 255" ohne weitere Fehlermeldung, ich habe sofort
zurückgedreht (`3ec68bc`) und den Umbau als `static-retry` geparkt. Die
Aufklärung danach:

- **255 ist der Rückgabewert von `ssh`**, nicht von `next build`. Coolify
  führt jeden Build-Schritt per `ssh <server> docker exec <helper> bash
  /artifacts/build.sh` aus (`app/Traits/ExecuteRemoteCommand.php`); reißt die
  Verbindung ab, kommt 255 zurück, und weil die Fehlermeldung dann aus
  Build-Ausgabe besteht, greift Coolifys eigene SSH-Wiederholung nicht
  (`SshRetryable::isRetryableSshError` sucht nach Texten wie „Connection reset").
- **Es ist ein Muster des Servers, nicht dieses Commits.** In der gesamten
  Deploy-Historie der Coolify-Instanz gibt es vier fehlgeschlagene Deploys —
  alle vier mit 255, an beliebigen Stellen (zweimal mitten in einem
  apt-Download, einmal bei „Creating an optimized production build" von
  RMH-Digital.de, einmal hier). Ein Build-Fehler sähe anders aus: BuildKit
  schreibt dann „process did not complete successfully: exit code N".
- **Der Server hat es fünf Minuten später geschafft.** Der Build von `main`
  (`c0bb1c6`) durchlief denselben Schritt „119 Seiten mit 3 Workern" in 4,4 s.
  Kein OOM im Kernel-Log, kein Speicherlimit auf den Containern.

Praktische Regel daraus, auch in `COOLIFY-BASELINE.md`: **Ein Deploy mit
„exit code 255" und ohne BuildKit-Fehlerzeile wird einfach neu angestoßen**
(„Redeploy" in Coolify oder ein leerer Commit). Nichts am Code ändern, nichts
zurückdrehen.

Nebenbei: Der Catch-all hat eigene Metadaten bekommen. Das ausgelieferte HTML
trug den richtigen 404-Titel, aber eine Client-Navigation auf einen toten Link
löste die Metadaten *dieser* Route auf — und ohne eigene fiel sie auf den
Layout-Standard zurück, der Tab las sich dann wie die Startseite.

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

**`CalendarClient.tsx` aufgeteilt — erledigt 2026-09-15.** 755 Zeilen in einer
Datei, jetzt sechs:

| Datei | Zeilen | Inhalt |
|---|---|---|
| `calendar/time.ts` | 184 | Locale- und Zeitzonen-Auflösung, Formatierung, Monatsarithmetik — reine Logik, kein Markup |
| `calendar/GridView.tsx` | 270 | Monatsraster, Tageszelle, Event-Karte |
| `calendar/ListView.tsx` | 86 | Listenansicht und Zeile |
| `calendar/AddToCalendar.tsx` | 56 | Der Download-Knopf, von beiden Ansichten benutzt |
| `calendar/shared.tsx` | 25 | Live-Badge, Leerzustand |
| `CalendarClient.tsx` | 160 | Nur noch Zustand und Steuerleiste |

Reines Verschieben, keine Verhaltensänderung. Danach gegengeprüft: Raster und
Liste rendern identisch, 13 Downloads im Raster (24 px) und 21 in der Liste
(44 px), 14 Event-Punkte, Monatsnavigation, Zeitzone, Abo-Block, mobil weiter
Listenansicht als Start, kein Überlauf, keine Konsolenfehler.

**Alte lokale Branches aufgeräumt — 2026-09-15.** `i18n-routes`, `next-15`,
`next-16` und `ui-audit` waren vollständig in `main` und sind gelöscht.
`analytics-page-views` hatte noch einen eigenen Commit — den alten
cookielosen Seitenzähler, ersetzt durch Umami — und ist ebenfalls weg; der
Commit ist `66accf97249c156cad33357c463a31fc34a472da`, falls doch noch jemand hineinsehen will.

Auf dem Remote liegen `origin/i18n-routes`, `origin/next-15` und
`origin/dockerfile-build` noch. Die habe ich **nicht** angefasst: Remote-Branches
zu löschen ist für andere sichtbar, und `dockerfile-build` soll ohnehin
bleiben (Nixpacks-Entscheidung).

**Abhängigkeiten — durchgesehen 2026-09-15.** Alle drei „neuen Hauptversionen"
einzeln ausprobiert statt eingeschätzt:

| | Ergebnis |
|---|---|
| **TypeScript 5.9 → 6.0.3** | **übernommen.** Typecheck, Lint und Build sauber, 72 Seiten geprüft |
| TypeScript 7.0.2 | **blockiert**: `typescript-eslint` deklariert als Peer `typescript: >=4.8.4 <6.1.0` (Stand 8.70.0, 2026-09-15). Der Compiler selbst läuft (`tsc --noEmit` sauber), es scheitert am Lint-Schritt, auf den der Build bewusst wartet |
| ESLint 9 → 10.10.0 | **blockiert — aber an anderer Stelle als am Vormittag notiert, siehe unten** |
| `@types/node` 26 | **falsch, nicht nur verfrüht.** Die Laufzeit ist Node 20 (`.nvmrc`, `engines`). Typen gegen Node-26-APIs zu prüfen, die im Container nicht existieren, wäre schlimmer als veraltete Typen. Bleibt auf `^20.19.43` |

**Korrektur am 2026-09-15, nachmittags.** Am Vormittag stand hier,
`typescript-eslint` blockiere **beide** Upgrades. Für ESLint 10 war das falsch.

Der damalige Fehler — `TypeError: scopeManager.addGlobals is not a function` —
war ein Artefakt der Installationsweise, nicht eine Unverträglichkeit:
`npm i -D eslint@10` in einen bestehenden Baum ließ `eslint-scope@8.4.0` stehen
(die Abhängigkeit von ESLint **9**), während ESLint 10 `eslint-scope@^9.1.2`
braucht. Bei einer **sauberen** Installation löst npm korrekt auf
(`eslint-scope@9.1.2`, `espree@11.2.0`) und der Fehler tritt nicht auf.
`typescript-eslint@8.70.0` unterstützt ESLint 10 ausdrücklich
(Peer `eslint: ^8.57.0 || ^9.0.0 || ^10.0.0`), und sein Scope-Manager bringt
`addGlobals` mit.

**Der wirkliche Blocker für ESLint 10 ist `eslint-plugin-react@7.37.5`**, das
`eslint-config-next` mitbringt. Sein Peer-Bereich endet bei `^9.7`, und es ruft
`context.getFilename()` auf, das in ESLint 10 entfernt wurde:

```
TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function
    at resolveBasedir (eslint-plugin-react/lib/util/version.js:31)
```

Isoliert nachgestellt mit einer frischen Installation, nicht aus dem
Fehlerprotokoll geschlossen. Eine korrigierte Fassung ist nicht veröffentlicht;
7.37.5 ist weiterhin die neueste, auch in der Canary-Kette von
`eslint-config-next`.

**Damit stehen zwei verschiedene Wartepositionen:**

| Upgrade | wartet auf |
|---|---|
| ESLint 10 | `eslint-plugin-react` > 7.37.5 mit ESLint-10-Unterstützung |
| TypeScript 7 | `typescript-eslint` mit Peer `typescript` ≥ 7 (heute `<6.1.0`) |

Beim nächsten Versuch: **nicht** in den bestehenden Baum installieren, sondern
`rm -rf node_modules package-lock.json && npm install` — sonst erzeugt npm
Fehlerbilder, die es ohne die alte Installation gar nicht gäbe.

Nebenbei aktualisiert: `nodemailer` 10.0.1 → 10.0.10 (Patch, und der
Versandweg des Kontaktformulars), `@types/nodemailer`, `@types/node` innerhalb
von 20.x.

**Totes Gewicht entfernt:**

- `clsx` — als Abhängigkeit geführt, in keiner Datei benutzt.
- `src/components/sections/TvPartners.tsx` — die alte Text-Partnerliste, seit
  dem Startseiten-Umbau durch `PartnerLogos` ersetzt. War nie auf i18n
  umgestellt, hätte also ohnehin nicht wieder eingehängt werden können.
- `public/images/events/rennsport-relaunch-2026/DSC00315.jpg` — das einzige
  Foto in `public/`, das in `src/` nirgends vorkommt. CLAUDE.md verlangt genau
  das. In der Historie, falls es doch gebraucht wird.

**Tote Übersetzungsschlüssel entfernt — 2026-09-15.** Acht Einträge waren
nirgends mehr referenziert und sind raus: `stats.broadcastHours` (die Kachel
wurde am 2026-09-14 ersetzt), `live.selectStream`, `events.upcoming`,
`events.details`, `events.pastEvents`, `contact.required`, `contact.errorSend`
und `contact.errorGeneric` — die beiden letzten stammen aus der Zeit vor den
Fehlercodes, heute führt `send_failed` auf `contact.err.server`.

Der Grund, das bis dahin liegenzulassen, war die Sorge vor einem naiven Scan:
54 der 62 zunächst „unbenutzten" Schlüssel werden dynamisch zusammengesetzt und
von einem Grep nicht gefunden. Deshalb vor dem Löschen nachgesehen, **welche**
Schlüssel überhaupt dynamisch gebildet werden — es sind genau zwei Stellen,
beide in `src/app/[lang]/services/page.tsx` (`services.${key}.*` und
`servicesPage.${key}.*`). Keiner der acht kann daraus entstehen.

Die eigentliche Absicherung ist aber der Typ: `TranslationKey` ist eine Union
über die Schlüssel des Wörterbuchs, also wird jede statische Referenz auf einen
gelöschten Schlüssel zum Typfehler. `tsc --noEmit` und der vollständige Build
(72 Seiten) liefen danach sauber durch.

**Bewusst behalten**, obwohl unreferenziert:

- Die vier Eurostile-Quelldateien (`.ttf`, `.otf`). `docs/FONTS.md` sagt
  ausdrücklich: im Repo lassen als Ausgangsmaterial, nur nie darauf zeigen.
- `public/og-image.jpg`. Unbenutzt im Code, aber eine **live erreichbare URL**,
  auf die bereits veröffentlichte Social-Posts zeigen können. 201 KB sind ein
  schlechter Grund, jemandem die Vorschaukarte zu zerschießen.

