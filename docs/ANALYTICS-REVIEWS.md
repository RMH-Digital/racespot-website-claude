# Bewertungen: Racespot Analytics → Website

Stand 2026-09-24. Endpunkt live, Website fertig (`src/lib/testimonials.ts`,
`getVoices()`). Antwortet er nicht, zeigt sie die Handliste in derselben
Datei. Der Abschnitt erscheint ab drei Stimmen.

## Aufteilung

| Analytics-Tool | Website |
|---|---|
| sammelt **alle** öffentlichen Bewertungen je Plattform, dauerhaft, als Archiv | wählt die **besten** aus und zeigt sie als Kundenstimmen |
| zeigt sie im Dashboard, auch die negativen | zeigt nur positive, nennt keine Plattform |
| kürzt den Namen, **bevor** er das Tool verlässt | übernimmt ihn, wie er kommt |
| merkt, wenn eine Bewertung auf der Plattform gelöscht wurde, und liefert sie dann nicht mehr | — |

Plattformen: Facebook zuerst, Google als zweite, weitere später
(Trustpilot, iRacing-Forum …). Wo es keine API gibt: Handeingabe im Tool mit
Beleg (Link oder Screenshot), `source = "manual"`.

## Vertrag

```
GET https://analytics.racespot.tv/api/public/reviews
→ 200, Content-Type: application/json, Cache-Control: public, max-age=3600

{
  "asOf": "2026-09-24T12:00:00Z",
  "reviews": [
    {
      "id": "1234567890",          // stabil, die ID der Plattform
      "platform": "facebook",      // facebook | google | trustpilot | …
      "rating": null,              // 1–5, wo die Plattform Sterne kennt, sonst null
      "recommended": true,         // Facebook-Empfehlung ja/nein, sonst null
      "text": "Racespot, like …",  // wörtlich, ungekürzt, Zeilenumbrüche erhalten
      "author": "Chris L.",        // Vorname + erster Buchstabe des Nachnamens
      "date": "2019-03-14",        // Tag der Bewertung
      "lang": "en"                 // ISO 639-1, wo bekannt, sonst null
    }
  ]
}
```

- **Nur Bewertungen mit Text.** Sterne ohne Worte kann man nicht zitieren.
- **Alle mit Text, auch schlechte.** Die Website filtert selbst (5 Sterne oder
  „empfohlen", 60–600 Zeichen). So kann sich die Regel ändern, ohne das Tool
  anzufassen.
- **`author` schon gekürzt**, nie der volle Name, nie ein Foto, nie ein
  Profil-Link. Ohne erkennbaren Nachnamen nur der Vorname. Kein Name
  bekannt: `"author": null` — die Website zeigt die Bewertung dann **nicht**.
  Facebooks API gibt keiner App die Namen heraus; sie werden einmal im
  Analytics-Dashboard ergänzt. Jürgen, 2026-09-24: auf der Website immer mit
  Namen, ohne Datum (einen Tag lang stand dort der Monat statt des Namens).
  Platzhalter- oder erfundene Namen bleiben verboten.
- **Gelöschte Bewertungen verschwinden** beim nächsten Lauf aus der Antwort.
  Im Archiv bleiben sie mit Löschdatum; öffentlich nicht mehr.
- **Kein Token**, öffentlich, nur lesend — dieselben Texte stehen öffentlich
  auf den Plattformen. Keine weiteren Felder.

## Was die Website damit macht

`getVoices()`: positive Bewertungen passender Länge, angepinnte zuerst, sonst
nach Länge und Aktualität, Plattformen im Wechsel, höchstens sechs.
`EXCLUDE`, `PIN` und `ROLES` in `testimonials.ts` sind die redaktionelle
Steuerung (Bewertung ausblenden, nach vorn holen, „Zuschauer"/„Serienveranstalter"
zuordnen). Die Adresse leitet sich aus `ANALYTICS_STATS_URL` ab
(`…/site-stats` → `…/reviews`) — keine neue Coolify-Variable nötig.
