# YouTube Watch Time auf der Website — Einrichtung

**Stand 2026-09-16.** Die Website liest YouTube bisher nur über einen
**API-Schlüssel**: Kanalstatistik, Videos, Playlists, Live-Erkennung. Das ist
die öffentliche *Data API*, und sie kennt keine Watch Time. Die angesehenen
Stunden stehen in der **YouTube Analytics API**, und die antwortet nur dem
Kanalinhaber — dafür braucht es einmalig eine Anmeldung mit dem Brand-Konto
und ein Token, das der Server behält. Das war bisher nicht eingerichtet; die
Kachel „Sendestunden" zeigt deshalb, was wir senden, nicht, was gesehen wird.

Die Website-Seite ist fertig: Sobald die drei Werte unten in Coolify stehen,
zeigt die zweite Kachel **„Angesehene Stunden, letzte 12 Monate"**. Fehlen sie
oder antwortet die API nicht, bleibt es bei den Sendestunden — nie eine Null,
nie eine falsch beschriftete Zahl.

## Was du brauchst

- Zugang zu `contact@racespot.tv` (hat Zugriff auf den Brand-Kanal RaceSpotTV)
- Zugang zur Google Cloud Console mit dem Projekt, in dem der bestehende
  `YOUTUBE_API_KEY` liegt — oder ein neues Projekt, das ist gleichwertig
- Zugang zu Coolify (Environment Variables der Website-App)
- Etwa 20 Minuten

## Schritt 1 — API einschalten

Google Cloud Console → *APIs & Services* → *Library* →
**„YouTube Analytics API"** → *Enable*. (Die *YouTube Data API v3* ist dort
schon an, sonst liefe der Rest der Seite nicht.)

## Schritt 2 — Zustimmungsbildschirm

*APIs & Services* → *OAuth consent screen* (bzw. *Google Auth Platform → Branding*).

- **User type:** Wenn `contact@racespot.tv` zu einer Google-Workspace-Organisation
  gehört, **Internal** wählen — dann entfällt alles Weitere in diesem Schritt.
  Sonst **External**.
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

## Schritt 3 — OAuth-Client anlegen

*APIs & Services* → *Credentials* → *Create credentials* → **OAuth client ID**.

- **Application type: Web application**, Name „Racespot Website Server".
- **Authorized redirect URIs:** genau `http://127.0.0.1:8765/callback`
  (das ist die Adresse, auf der das Skript in Schritt 4 kurz lauscht).
- Anlegen → **Client-ID** und **Client-Secret** kopieren.

## Schritt 4 — einmal zustimmen, Token holen

Im Repo, auf dem Mac:

```bash
YOUTUBE_OAUTH_CLIENT_ID='…' YOUTUBE_OAUTH_CLIENT_SECRET='…' node scripts/youtube-analytics-auth.mjs
```

Das Skript druckt eine Google-Adresse. Im Browser öffnen, als
`contact@racespot.tv` anmelden, und **im Kanal-Wähler „RaceSpotTV" wählen —
nicht den leeren persönlichen Kanal „Racespot"**. Beide sehen dort ähnlich aus;
das Skript prüft danach die Abonnentenzahl und bricht ab, wenn es der falsche
war. Beide Berechtigungen erlauben.

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
Dann *Redeploy*. Nach dem Deploy zeigt die Startseite die neue Kachel; der Wert
wird alle sechs Stunden frisch geholt.

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
