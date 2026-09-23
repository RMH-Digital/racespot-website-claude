# Kennzahlen der Website aus Racespot Analytics

Stand 2026-09-23. Die Website (`src/lib/stats.ts`, `analyticsFigures()`) ist
fertig und wartet auf einen Endpunkt im Analytics-Tool
(`~/Racespot Analytics`, `RMH-Digital/racespot-analytics`). Solange
`ANALYTICS_STATS_URL` in Coolify nicht gesetzt ist, läuft alles wie vorher.

## Was die Website zeigt und woher es dann kommt

| Anzeige | heute | mit Analytics |
|---|---|---|
| Follower, alle Plattformen | YouTube-Data-API + Handwerte vom 14.09. (X, FB, IG, Twitch, TikTok) | gemessen je Plattform; fehlt eine, gilt ihr Handwert |
| YouTube-Abonnenten (Kanal-Kachel) | Data-API | Analytics, sonst Data-API |
| YouTube-Aufrufe (Über uns) | Data-API | Analytics, sonst Data-API |
| Angesehene Stunden, 365 Tage | nicht eingerichtet → Leiste zeigt Sendestunden | Analytics |
| Sendungen, Sendestunden, Serien | Master Schedule | **bleibt** Master Schedule — das Archiv kennt den Sendeplan nicht |

## Vertrag

```
GET https://analytics.racespot.tv/api/public/site-stats
→ 200, Content-Type: application/json, Cache-Control: public, max-age=3600

{
  "asOf": "2026-09-23T18:00:00Z",
  "followers": {
    "youtube": 34200, "x": 9728, "facebook": 7692,
    "instagram": 3072, "twitch": 2467, "tiktok": 400
  },
  "youtube": { "views": 6184897, "watchHours365": 123456 }
}
```

- **Jeder Wert darf `null` sein**, wenn er fehlt oder älter als 7 Tage ist.
  Die Website fällt dann je Wert zurück, nie auf 0.
- `followers.*`: letzter Stand (`kind` `total`/`snapshot`), nicht summiert.
- `youtube.views`: **öffentliche Lebenszeit-Zählung der Data-API** (6.184.897),
  nicht die Analytics-API-Summe (6.204.618 inkl. gelöschter/privater Videos).
  Die Seite rundet ab und muss jede Zahl belegen können.
- `youtube.watchHours365`: Summe `watch_minutes` (`kind` `daily`) der letzten
  365 Tage bis vorgestern, geteilt durch 60, gerundet.
- **Öffentlich, ohne Token, nur lesend.** Es sind genau die Zahlen, die auf
  racespot.tv ohnehin stehen — kein Geheimnis, also kein Schlüssel, der in
  zwei Coolify-Apps gepflegt werden müsste. Keine anderen Felder hinzufügen.
- Die Website fragt höchstens alle sechs Stunden (Next-Fetch-Cache).

## Scharf schalten

1. Endpunkt im Analytics-Tool deployen, mit `curl` prüfen.
2. In Coolify bei der Website `ANALYTICS_STATS_URL=https://analytics.racespot.tv/api/public/site-stats` setzen, neu deployen.
3. Kennzahlenleiste und Über-uns vergleichen: Follower müssen ≥ vorher sein
   (die Handwerte waren Untergrenzen), sonst Plattform im Archiv prüfen.
