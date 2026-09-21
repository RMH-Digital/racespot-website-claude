# YouTube Watch Time auf der Website — Einrichtung

**Eingerichtet am 2026-09-21.** Die Kachel zeigt live
**„Angesehene Stunden, letzte 12 Monate"**; die drei `YOUTUBE_OAUTH_*`-Werte
stehen in Coolify als Runtime-Variablen. Diese Anleitung bleibt stehen, weil
sie wiederholt wird, sobald das Token einmal verfällt.

Zum Hintergrund: Die Website liest YouTube sonst nur über einen
**API-Schlüssel** — Kanalstatistik, Videos, Playlists, Live-Erkennung. Das ist
die öffentliche *Data API*, und sie kennt keine Watch Time. Die angesehenen
Stunden stehen in der **YouTube Analytics API**, und die antwortet nur dem
Kanalinhaber. Fehlen die drei Werte oder antwortet Google nicht, fällt die
Kachel auf die Sendestunden zurück — nie eine Null, nie eine falsch
beschriftete Zahl.

Referenzwerte vom Einrichtungstag, als Plausibilitätsprüfung für den nächsten
Durchlauf: RaceSpotTV, 34.200 Abonnenten, 71.780 angesehene Stunden und
510.088 Aufrufe in den vorangegangenen 365 Tagen.

## Was du brauchst

- Zugang zu `contact@racespot.tv` (hat Zugriff auf den Brand-Kanal RaceSpotTV)
- Zugang zur Google Cloud Console, Projekt **`racespot-website`**
  (Nummer 513588888215). Dort liegen `YOUTUBE_API_KEY`, seit 2026-09-21 auch
  `GOOGLE_SHEETS_API_KEY`, sowie der OAuth-Client. Nicht verwechseln:
  `YOUTUBE_LIVE_API_KEY` liegt bewusst in einem **eigenen** Projekt
  (11031966758), weil das Tageskontingent pro Projekt gilt und die
  Live-Erkennung im Minutentakt abfragt.
- Zugang zu Coolify (Environment Variables der Website-App)
- Etwa 20 Minuten

## Schritt 1 — API einschalten

Google Cloud Console → *APIs & Services* → *Library* →
**„YouTube Analytics API"** → *Enable*. (Die *YouTube Data API v3* ist dort
schon an, sonst liefe der Rest der Seite nicht.)

## Schritt 2 — Zustimmungsbildschirm

*APIs & Services* → *OAuth consent screen* (bzw. *Google Auth Platform → Branding*).

- **User type: External.** „Internal" ist nicht möglich —
  `contact@racespot.tv` ist kein Google-Workspace-Konto, sondern ein normales
  Google-Konto mit unserer Domain als Adresse. Die Console sagt das im Tooltip
  am gesperrten Knopf „Make internal".
- App-Name „Racespot Website", Support-Mail `contact@racespot.tv`, Entwickler-Mail
  ebenso. Logo und Links kann man leer lassen.
- **Scopes:** hinzufügen `…/auth/yt-analytics.readonly` und
  `…/auth/youtube.readonly`.
- Bei **External**: *Test users* → `contact@racespot.tv` eintragen — **und dann
  unter „Publishing status" auf „In production" stellen.** Das ist der Punkt,
  an dem es sonst nach einer Woche stillschweigend aufhört: Im Status
  *Testing* verfallen Refresh-Tokens nach **7 Tagen**. „In production" ohne
  Google-Prüfung zeigt beim Anmelden einen Hinweis „App nicht verifiziert" —
  den klickt man einmal weg (*Advanced → Go to Racespot Website*), das ist bei
  einer App, die nur wir selbst benutzen, in Ordnung.
- Zum Veröffentlichen verlangt Google ausgefüllte Branding-Felder: Startseite
  `https://racespot.tv`, Datenschutz `https://racespot.tv/en/privacy`, AGB
  `https://racespot.tv/en/terms` und `racespot.tv` unter *Authorized domains*
  (die Domain ist in der Search Console unter `contact@racespot.tv` bestätigt).
  **Kein Logo hochladen** — das löst eine Verifizierungspflicht aus.
- Nach dem Veröffentlichen erscheint „Your app requires verification".
  **Ignorieren.** Eine Verifizierung sensibler Scopes bedeutet Demo-Video und
  Wochen Bearbeitungszeit, für eine App mit genau einem Nutzer ohne Gegenwert.

## Schritt 3 — OAuth-Client anlegen

*APIs & Services* → *Credentials* → *Create credentials* → **OAuth client ID**.

- **Application type: Web application**, Name „Racespot Website Server".
- **Authorized redirect URIs:** genau `http://127.0.0.1:8765/callback`
  (das ist die Adresse, auf der das Skript in Schritt 4 kurz lauscht).
- Anlegen → **Client-ID** und **Client-Secret** kopieren. Beide stehen später
  jederzeit auf der Detailseite des Clients, man ist nicht auf den Dialog
  angewiesen. Nur **einen** Client anlegen; Doppelte stiften nur Verwirrung.

## Schritt 4 — einmal zustimmen, Token holen

Im Repo, auf dem Mac:

```bash
YOUTUBE_OAUTH_CLIENT_ID='…' YOUTUBE_OAUTH_CLIENT_SECRET='…' node scripts/youtube-analytics-auth.mjs
```

Die Werte nicht blind in die Zeile einsetzen, sondern abfragen lassen — sonst
landen sie in der Shell-History, und eine verdeckte Eingabe verleitet dazu,
mehrfach einzufügen, was zu einer dreifach aneinandergehängten Client-ID führt:

```bash
read -r "?Client ID: " YOUTUBE_OAUTH_CLIENT_ID
read -rs "?Client Secret: " YOUTUBE_OAUTH_CLIENT_SECRET; echo
echo "ID-Länge: ${#YOUTUBE_OAUTH_CLIENT_ID}"   # muss 72 sein
export YOUTUBE_OAUTH_CLIENT_ID YOUTUBE_OAUTH_CLIENT_SECRET
```

Das Skript druckt eine Google-Adresse. Im Browser öffnen, als
`contact@racespot.tv` anmelden, und **im Kanal-Wähler „RaceSpotTV" wählen —
nicht den leeren persönlichen Kanal**. Der heißt seit 2026-09-21 zur
Unterscheidung „Racespot Admin"; vorher hießen beide „Racespot", und genau
deshalb wurde beim ersten Anlauf der falsche autorisiert. Das Skript prüft die
Abonnentenzahl und bricht ab, wenn es der falsche war. Beide Berechtigungen
erlauben.

Google ruft `127.0.0.1:8765` zurück, das Skript tauscht den Code gegen Tokens
und **prüft sofort**: Es nennt den autorisierten Kanal und die angesehenen
Stunden der letzten 365 Tage. Wenn das plausibel aussieht, steht am Ende:

```
YOUTUBE_OAUTH_REFRESH_TOKEN=1//0g…
```

## Schritt 5 — in Coolify eintragen

Coolify → Website-App → *Environment Variables*, drei neue Einträge:

| Variable | Wert |
|---|---|
| `YOUTUBE_OAUTH_CLIENT_ID` | aus Schritt 3 |
| `YOUTUBE_OAUTH_CLIENT_SECRET` | aus Schritt 3 |
| `YOUTUBE_OAUTH_REFRESH_TOKEN` | aus Schritt 4 |

Alle drei **nicht** als „Build Variable" — sie werden nur zur Laufzeit gelesen.
Dann *Redeploy*. Im Deploy-Log steht dann „No build configuration changed …
Build step skipped" und „Creating .env file with runtime variables" — das ist
richtig so, bei unverändertem Commit baut Coolify nicht neu und reicht die
Runtime-Variablen trotzdem durch.

Die Startseite ist ISR mit `revalidate = 300`, zeigt direkt nach dem Deploy
also noch die vorgerenderte Fassung mit „Sendestunden". Nach spätestens fünf
Minuten springt sie um. Der Wert selbst wird danach alle sechs Stunden frisch
geholt.

Nichts davon kommt ins Repo oder in eine `.env`-Datei, die eingecheckt wird.
Lokal zum Testen gehören die drei in `.env.local` (ist in `.gitignore`).

## Prüfen, später

```bash
YOUTUBE_OAUTH_CLIENT_ID='…' YOUTUBE_OAUTH_CLIENT_SECRET='…' YOUTUBE_OAUTH_REFRESH_TOKEN='…' \
  node scripts/youtube-analytics-auth.mjs --test
```

Nennt Kanal und aktuelle Stunden, ohne neue Zustimmung. Sinnvoll, wenn die
Kachel auf „Sendestunden" zurückfällt — dann ist meist das Token verfallen.

## Wenn etwas hakt

- **Kein Refresh-Token in der Antwort.** Passiert, wenn für diesen Client schon
  einmal zugestimmt wurde und `prompt=consent` fehlt — das Skript setzt es;
  sonst unter myaccount.google.com → *Sicherheit → Drittanbieter-Apps* den
  Zugriff für „Racespot Website" entfernen und Schritt 4 wiederholen.
- **`invalid_grant` nach ein paar Tagen.** Zustimmungsbildschirm steht noch auf
  *Testing* (Schritt 2). Auf *In production* stellen, Schritt 4 wiederholen.
- **`accessNotConfigured`.** Die Analytics API ist im Projekt nicht aktiviert
  (Schritt 1), oder Client und API-Aktivierung liegen in verschiedenen Projekten.
- **`invalid_client` / „The OAuth client was not found".** Fast immer eine
  verstümmelte Client-ID in der Adresse — prüfen, ob `client_id=` dort genau
  einmal vorkommt. Sonst ist der Client wenige Minuten alt; Google schreibt
  selbst, dass Änderungen fünf Minuten bis einige Stunden brauchen können.
- **Stunden sehen zu klein aus.** Falscher Kanal gewählt — das Skript sollte das
  abfangen; sonst Schritt 4 wiederholen und im Wähler auf RaceSpotTV achten.
- **Zahl auf der Seite bewegt sich nicht.** Die Analytics API liefert Daten mit
  etwa zwei Tagen Verzug; die Website fragt bis „vorgestern" ab. Das ist normal.

## Was die Website damit macht

`src/lib/stats.ts` → `youtubeWatchHours()`: tauscht das Refresh-Token gegen
ein Zugriffstoken, fragt `estimatedMinutesWatched` für die letzten 365 Tage
bis vorgestern ab, teilt durch 60 und rundet. Gecacht für sechs Stunden wie
die Abonnentenzahl. Liefert `null`, wenn eine der drei Variablen fehlt oder
Google nicht antwortet — dann zeigt `StatsBar` die Sendestunden. Die Kachel
erklärt sich per Hover selbst, in allen sechs Sprachen.
