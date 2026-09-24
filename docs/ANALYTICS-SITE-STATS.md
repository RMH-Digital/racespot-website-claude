# Kennzahlen der Website aus Racespot Analytics

**Live seit 2026-09-24.** Endpunkt im Analytics-Tool
(`~/Racespot Analytics`, `apps/web/app/api/public/site-stats/route.ts`),
`ANALYTICS_STATS_URL` in Coolify gesetzt (Build + Laufzeit), Redeploy 10:24 UTC.
Erste Anzeige: 71.700+ angesehene Stunden, 57.500+ Follower.
Ohne die Variable liefe alles wie vorher (`src/lib/stats.ts`, `analyticsFigures()`).

**Ein neuer Wert erscheint erst nach dem nächsten Nachtlauf** des Analytics-Tools
(04:30 UTC). So war `youtube.views` am ersten Abend `null`: Der Code dafür kam
um 21:02, gesammelt wurde erst am Morgen. Ab dann 6.205.228 — die öffentliche
Zählung, gegengeprüft mit der Data-API (6.205.355 sechs Stunden später).
X und TikTok liefert das Archiv noch nicht; dort stehen die Handwerte.

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
