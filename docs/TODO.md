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

**Offen bleibt genau eine Sache:** einmal eine Broadcast-Anfrage absenden und
prüfen, ob sie bei `contact@racespot.tv` **und** als Kopie beim Absender
ankommt. Das kann nur jemand tun, der in den Postfächern nachsehen kann —
einen Testversand an das echte Team-Postfach löse ich nicht ungefragt aus.

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
- Optional, **nicht gemacht**: persistentes Volume für `/app/.next/cache/images`.
  Der Cache wird beim Start ohnehin vorgewärmt (~30–60 s nach Deploy); ein
  Volume spart genau diese Minute. Dafür einen Eingriff an der laufenden
  Container-Konfiguration vorzunehmen — noch dazu nachts und ohne dass jemand
  zusieht — steht in keinem Verhältnis. Beim nächsten Coolify-Termin mitnehmen.
- **Für Philip, zwei überholte Stellen** in `~/Press Tool/projects/racespot/NOTES.md`.
  Die Datei habe ich bewusst **nicht** bearbeitet — sie gehört einem anderen
  Projekt, ist 80 KB groß und wurde zuletzt am 2026-09-15 um 08:31 geändert;
  da hineinzuschreiben riskiert, parallele Änderungen zu überfahren.
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

- Der Partner-Marquee hat keine sichtbare Pause-Schaltfläche. Er pausiert bei
  Hover und steht bei `prefers-reduced-motion` still, aber es liegt kein
  fokussierbares Element darin, über das ein Tastaturnutzer ihn anhalten
  könnte. Eine Schaltfläche wäre der saubere WCAG-2.2.2-Weg — das ist eine
  Design-Entscheidung, die Jürgen treffen sollte, kein stiller Einbau.
- Restliche Trefferflächen zwischen 24 und 44 px: Ticker-Label (34 px hoch, das
  ist die Bandhöhe), Hero-„Next Broadcast"-Zeile (32), Footer-Rechtslinks (29).
  Alle über dem WCAG-Minimum von 24 px und breit genug; 44 px hätte hier
  Layouts verschoben.
- Die Flaggen im Sprachwähler stehen weiterhin sichtbar da. Sie sind jetzt für
  Screenreader unsichtbar, aber unter Windows rendern sie als Buchstaben und
  Flaggen stehen für Länder, nicht für Sprachen (pt ist pt-BR). Entfernen wäre
  ein Einzeiler — das ist Jürgens Entscheidung.

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

**Offen, weil redaktionell:** Zwölf der 42 Artikel-URLs haben Schlagzeilen von
72–86 Zeichen; Google schneidet bei ~60 ab. Das lässt sich nicht technisch
lösen, ohne die Schlagzeile zu verstümmeln — entweder kürzer texten (auch im
Press Tool) oder dem `Article`-Typ ein optionales `seoTitle` geben, das die
Pipeline füllt. Betroffen ist vor allem `moza-racing-title-sponsor-…`
(77–86 Zeichen je nach Sprache).

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

Alle Seiten werden auf Anfrage serverseitig gerendert, ein Klick holt also
erst beim Server. Meist ein Zehntel einer Sekunde und unsichtbar; auf einer
kalten Route oder schlechter Verbindung lange genug, dass die Seite kaputt
wirkt — man klickt, und nichts passiert.

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

### Stufe 2, geplant, nicht gebaut: E-Mail-Erinnerung und Newsletter

Aufwand ca. **3–5 Tage plus laufender Betrieb**, und der Betrieb ist der
eigentliche Punkt. Was fehlt:

- **Eine Datenbank.** Die Website ist zustandslos; es gibt keinen Ort für eine
  Adresse. Postgres müsste in Coolify daneben.
- **Ein Scheduler**, der stündlich fällige Erinnerungen versendet (Coolify
  kann geplante Aufgaben).
- **Ein Versandweg für Masse** — das SMTP über All-Inkl ist für
  Kontaktformulare gedacht, nicht für 500 Mails in fünf Minuten.
- **Double Opt-in** (§ 7 UWG), **Einwilligungsnachweis** (Zeitpunkt, IP,
  angezeigter Text), **Ein-Klick-Abmeldung** (Art. 7 Abs. 3 DSGVO),
  Löschkonzept, neuer Abschnitt in der Datenschutzerklärung.
- **Bounce- und Beschwerdebehandlung** — sonst leidet die Zustellbarkeit von
  `contact@racespot.tv` mit.
- Stiller Kostentreiber: **sechs Sprachen** für jede Mail, jede
  Bestätigungsseite, jede Fehlermeldung.

**Empfehlung:** nicht selbst bauen. Ein EU-Anbieter (Brevo, CleverReach,
Mailjet, jeweils mit AV-Vertrag) bringt Double Opt-in, Abmeldung,
Einwilligungsnachweis, Bounces und Zustellbarkeit mit; die Website
schrumpft dann auf ein Formular, einen API-Aufruf und sechs
Bestätigungsseiten — **ein bis zwei Tage**. Die Event-Erinnerung ließe sich
oft über deren Automationen fahren, dann entfällt der eigene Scheduler.

**Und der ehrliche Einwand:** Bei einem angesetzten YouTube-Livestream gibt es
die Erinnerungsglocke schon, kostenlos, und das Publikum ist dort ohnehin. Ein
eigener E-Mail-Reminder lohnt vor allem, wenn ihr die **Adressen** wollt. Das
ist eine Geschäftsentscheidung, keine technische.

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

**Offen, minimal: Abhängigkeiten mit neuen Hauptversionen** — ESLint 10,
TypeScript 7, `@types/node` 26. Nichts davon drängt; TypeScript 7 ist ein
großer Sprung, der einen eigenen Durchgang verdient.

