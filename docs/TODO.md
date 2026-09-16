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
Ohne Zuordnung führt der Klick zur Stream-Liste des Kanals auf YouTube.

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
- **Startseite ohne Extra-Platz:** Die Follow-Zeile unter den letzten
  Broadcasts ist weg. Stattdessen sitzt „Auf YouTube abonnieren" **in der
  Knopfzeile der Zuschauer-Karte** direkt unter der Kennzahlenleiste, neben
  LIVE und KALENDER; die weiteren Kanäle stecken hinter einem ···-Icon
  (`FollowUs compact`). Kein zusätzlicher Block, keine zusätzliche Höhe.
- **Events-Seite:** Der After-Movie war ein iframe, das beim Laden mitkam.
  Jetzt ein Standbild mit Play (`VideoPoster`), das denselben Player öffnet —
  nichts von YouTube lädt, bevor jemand drückt. Damit läuft **jedes Video
  der Website** über den einen Player; einzige Ausnahme bleibt der
  Livestream auf `/live`, der weiter direkt eingebettet ist (Chat daneben).

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

