# Brief für die Press-Tool-Session: News-Bereich, Schritt 2

**Von:** Website-Session „↳ News-Bereich neu“ · **Stand:** 2026-10-28
**Freigabe:** Jürgen (diesen Brief in der Press-Tool-Session einfügen)
**Repo:** `~/Press Tool` · **Gegenstelle:** `RMH-Digital/racespot-website-claude`, Commit `9ed7098` (live)

## Worum es geht

Die Website bekommt einen neuen News-Bereich mit Rubriken, **Serien** und
Rubrik- und Serienseiten. Plan mit Begründungen: `docs/news-plan/index.html`
im Website-Repo, freigegeben mit allen Entscheidungen E1–E10.

Schritt 1 ist live. Seitdem gibt es eine einzige Liste für Rubriken, Serien,
Plattformen und reservierte Slugs: **`content/news/taxonomy.json`** im
Website-Repo. Zum Artikel sind drei optionale Felder hinzugekommen: `series`,
`format` und `pinnedUntil`. Ein Build-Check (`npm run check-news`) prüft jeden
Artikel.

Dieser Schritt bringt dem Press Tool bei, die neuen Felder richtig zu
befüllen. Außerdem bereitet er die spätere Umstellung der Ablage vor, von
einem TS-Array auf eine JSON-Datei pro Artikel.

**Ein akutes Problem, das dieser Schritt behebt:** Eine Neuveröffentlichung
ersetzt den ganzen Eintrag in `articles.ts`. Dabei geht alles verloren, was
auf der Website nachgetragen wurde. So ist am 2026-09-24 der KI-Hinweis beider
MOZA-Artikel verschwunden (TODO 7p). Am 2026-10-28 wurde er wieder ergänzt.
Genauso würden heute `series` und die vereinheitlichten Tags überschrieben.

## Aufgaben

### 1. `taxonomy.json` lesen statt Listen doppelt pflegen

- Lies `content/news/taxonomy.json` aus dem eigenen Klon `state/site-repo`.
  `git_site.workdir()` setzt ihn ohnehin vor jedem Lauf auf `origin/main`
  zurück. Falls der Klon fehlt, gilt dieselbe Logik wie heute beim ersten
  Publish: anlegen, dann lesen.
- Daraus abgeleitet werden:
  - `preview.categories`: die `key`s;
  - `preview.category_colors`: `hex`;
  - die erlaubten Werte für `category` in `lib.site_categories()` bzw. in der
    Prüfung in `core/lib.py` (Topic → Kategorie).
- **Fallback:** Ist die Datei nicht lesbar, gelten die Werte aus
  `project.yaml` wie bisher, mit einer Warnung in den Run-Notes. Ein Lauf
  scheitert daran nicht.
- Die Kategorie-Schlüssel bleiben unverändert (`Esports`, `Industry`,
  `Events`, `Broadcast`, `Motorsport`, `Company`). Nur die Anzeigenamen auf
  der Website haben sich geändert. Für den Press Tool ändert sich dadurch
  nichts.

### 2. `series` vergeben

Die Serien sind eine **geschlossene Liste** (`taxonomy.series`, Feld `id`).
Ein Artikel kann 0 bis n Serien haben.

1. **Deterministisch zuerst.** Gleiche die `aliases` jeder Serie gegen Titel,
   Teaser, Tags und den ersten Absatz ab:
   - Groß- und Kleinschreibung spielt keine Rolle.
   - Es zählen nur ganze Wortfolgen. `pesc` darf also nicht in `pescara`
     treffen.
   - Aliase sind bewusst spezifisch, nie nur eine Marke.
   - **`core/coverage.py` nicht wiederverwenden.** Es ist absichtlich „on the
     loose side“. Hier ist eine falsche Serie schlimmer als gar keine.
2. **Das Modell darf nur aus der Liste wählen.** Das Drafting bekommt die
   Serien als geschlossenes Vokabular, mit `id` und `name`. Was es darüber
   hinaus nennt, verwirft der Precheck.
3. **Review:** Zeig die Serie im Review-Panel neben der Rubrik. Im Editor soll
   sie änderbar sein, genauso wie `category` in `core/editor.py`.
4. **Hinweis, kein Blocker:** Rubrik `Esports` mit Topic `sim-racing-results`
   und trotzdem keine Serie ergibt einen Hinweis.
5. **Unbekannte Serien** werden aus dem Artikel entfernt und landen in einer
   Liste „Serien-Kandidaten“ im Studio, mit Zähler. Ab drei Nennungen schlägt
   das Studio vor, sie aufzunehmen. **Nie automatisch anlegen.** Die Liste
   lebt im Website-Repo, und eine Änderung dort ist eine Website-Änderung.
6. In `article_literal()` steht `series: [...]` **direkt nach `category`**.
   Ist die Liste leer, wird das Feld weggelassen.

### 3. Tags normalisieren

Die Website erwartet genau diese Schreibweise (`normalizeTag()` in
`src/lib/newsTaxonomy.ts`, gleich implementiert in
`scripts/check-news.mjs`):

```
NFKD → Diakritika entfernen → lower case → alles außer [a-z0-9] wird "-" → "-" am Rand weg
"MOZA Racing" → "moza-racing", "Sim Hardware" → "sim-hardware"
```

Danach entfernen:

- Topic-IDs (`sim-racing-results`, `sim-hardware`, `publisher-news`,
  `broadcast-hardware`, `events`, `community-leagues`, `sim-to-real`,
  `real-racing`, `esports-series`). Diese stehen schon in `topics`.
- Dubletten.

Höchstens **6 Tags**. Die Normalisierung gehört in den Precheck, als
„fixable“.

**Achtung:** `precheck._topic_from_tags()` liest Topic-IDs aus den Tags des
**Entwurfs**. Das muss weiter funktionieren. Entfernt werden die Topic-IDs
also erst beim Schreiben des Website-Eintrags, nicht im Entwurf.

### 4. `format`

`format: "feature"` setzen, wenn das Topic des Artikels `mode: evergreen` hat
(heute `sim-to-real`). Sonst das Feld weglassen. `pinnedUntil` setzt der Press
Tool **nicht**, das passiert nur von Hand.

### 5. Reservierte Slugs

`taxonomy.reservedSlugs` (`page`, `category`, `series`, `archive`, `search`,
`feed`, `feed.xml`, `index.json`) sind Seiten unter `/news/`. Ein Artikel mit
einem dieser Slugs ist ein **Blocker**. Der Slug wird angepasst, zum Beispiel
mit einem Suffix aus dem Titel. Heute kollidiert kein Artikel.

### 6. Neuveröffentlichung darf nichts verlieren

Wenn `insert_article()` einen bestehenden Eintrag ersetzt (`action ==
"replaced"`):

- **KI-Hinweis:** Fehlt er im neuen Eintrag in irgendeiner Sprache, ist das
  ein Blocker. Die Website-Build-Prüfung scheitert sonst, und dann bleibt
  jeder spätere Deploy stehen, bis jemand es repariert. Die Regel steht in
  CLAUDE.md beider Repos.
- **`series`:** Bringt der neue Eintrag keine Serie mit, aber der alte hatte
  eine, wird die alte übernommen.

### 7. Schalter für die künftige Ablage (vorbereiten, **aus** lassen)

`publishing.format: ts-array | json-dir`, Standard **`ts-array`**.

- `ts-array` verhält sich genau wie heute: Einfügen nach
  `export const ARTICLES: Article[] = [`.
- `json-dir` schreibt `content/news/articles/<slug>.json`, und zwar mit
  `json.dumps(..., ensure_ascii=False, indent=2)` und genau einem
  `Article`-Objekt mit derselben Form wie heute: englische Felder,
  `translations`, `Block[]`. Zurückziehen bedeutet Datei löschen.
- **Der Schalter bleibt in `project.yaml` auf `ts-array`.** Die Website kann
  `json-dir` erst nach Schritt 3 lesen. Umgelegt wird er gemeinsam in einem
  abgestimmten Zeitfenster, mit pausiertem Autopress.

## Abnahme

- Tests unter `tests/` für:
  - Aliasabgleich, mit Gegenbeispielen: Thrustmaster-Ferrari- und
    MOZA-Porsche-Artikel dürfen **keine** Porsche-Supercup-Serie bekommen;
  - Tag-Normalisierung;
  - reservierte Slugs;
  - Übernahme von `series` und Blocker für den KI-Hinweis beim Ersetzen;
  - beide Schalterstellungen.
- **Ein Probelauf ohne echten Publish:** `folder`-Adapter oder ein Lauf gegen
  eine lokale Kopie von `state/site-repo`, ohne Push. Der erzeugte Eintrag
  kommt in eine lokale Kopie des Website-Repos, dort laufen `npm run
  check-news` und `npm run build`. Erwartet: keine Fehler, **keine Warnungen**
  zu Serie oder Tags.
- `python3 core/cli.py` lädt die Projektkonfiguration ohne neue Probleme.

## Was diese Session nicht tun darf

- **Nicht auf das Website-Repo pushen und keinen echten Artikel veröffentlichen,
  um das zu testen.** Ein Merge auf `main` ist ein Deploy.
- `taxonomy.json` nicht ändern. Fehlende Serien gehen als Vorschlag an Jürgen
  bzw. die Website-Session.
- Den Schalter nicht auf `json-dir` umlegen.
- Die Website-Typen nicht anfassen. Wenn ein Feld fehlt, an die
  Website-Session zurückmelden.
- Commit und Push im Press-Tool-Repo nur nach Jürgens OK.

## Rückmeldung an die Website-Session

Am Ende kurz:

- was fertig ist;
- welche Tests laufen;
- das Ergebnis des Probelaufs mit der Ausgabe von `check-news`;
- welche Serien-Kandidaten aufgefallen sind.

Danach folgt Schritt 3 gemeinsam: die Website liest `content/news/articles/`,
die 23 Artikel werden migriert und der Schalter wird umgelegt.
