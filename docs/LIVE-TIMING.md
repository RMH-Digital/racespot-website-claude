# Live Timing (Appgineering) auf racespot.tv

Stand 2026-10-08, entschieden mit Jürgen am 2026-10-07 (alle drei Stufen).

## Was es tut

- **Live-Seite:** rechts neben dem Video die Reiter „Live-Chat | Live Timing“; ist
  das Timing gewählt, wird die Spalte breiter (420/480 px). „Groß“ legt das Timing
  in voller Breite unter Video und Chat. `/{lang}/live?tab=timing` öffnet den
  Reiter direkt. Das Timing folgt dem gewählten Stream.
- **Kalender, „Kommende Broadcasts“, Hero:** an der Zeile, die gerade live ist und
  ein Timing hat, ein Link „Live Timing“ (Stoppuhr) auf die Live-Seite mit
  geöffnetem Reiter; im Hero ersetzt er während der Sendung „Zeitplan“. Nicht im
  Laufband (zu klein, bewegt sich).
- **Eigene Anzeige:** Tabelle im Racespot-Design (Flaggenfarbe, Session, Runde
  bzw. Restzeit, Temperaturen, Position, Klasse, Nummer, Fahrer/Team, Abstand,
  Intervall, letzte/beste Runde, Stopps, Box, schnellste Runde). Schmal neben dem
  Video: Position, Nummer, Fahrer, Abstand↔Intervall, letzte Runde (am Handy ohne).

## Woher was kommt

```
Talent Dashboard (Supabase sch_events.timing_room)     Master Schedule
            │  Raum je Zeile, über sheet_row_key               │
            └──────────────► lib/timing/rooms.ts ◄─────────────┘  Rückfall: dieselbe
                                     │                            Regel selbst gerechnet
 /api/live-streams  ── rows (Stream→Zeile, lib/liveRows.ts) + timing (Zeile→Raum)
                                     │
             Appgineering /frontend/home/live: ist der Raum gerade live?
                                     │
 Browser ── /api/timing/Racespot2 (alle 2 s, nur sichtbar) ── lib/timing/relay.ts
                                     │   eine SignalR-Verbindung je Raum, für alle
                                     ▼
                      timing-api.appgineering.com/data
```

- **Raum je Sendung** (`lib/timing/rooms.ts`): zuerst das Talent Dashboard
  (`sch_events.timing_room`, Zeile über `sheet_row_key` = `serie klein|YYYY-MM-DD`
  UTC; kennt das Dashboard die Zeile, aber ohne Raum → 1, wie der Discord-Post).
  Sonst dieselbe Regel wie `allocateRooms()` im Dashboard über den Master Schedule
  (alle Zeilen, auch nicht-öffentliche: Sie belegen auch einen Raum).
  Grundadresse aus `sch_settings.timing_base_url`, Standard
  `https://timing.appgineering.com/rooms/Racespot`.
- **Hat die Sendung überhaupt Timing?** Appgineering listet unter
  `/frontend/home/live` die Räume, in die ATVO gerade sendet. Nur die bekommen den
  Reiter — eine Sendung aus einem anderen Spiel hat dann einfach keinen. Ist die
  Liste nicht lesbar, entscheidet der Serienname (`seriesHasTiming()`, Ausnahmen:
  RENNSPORT, Racecraft, VCO, Le Mans – Manthey; vom Team zu bestätigen).
- **Daten** (`lib/timing/relay.ts`, `lib/timing/decode.ts`): Unser Server hält je
  Raum eine SignalR-Verbindung (`/data`, `SubscribeAsync(roomId)`, Nachricht
  `SendFrame`), liest die Binär-Frames und hält den Stand im Speicher. Eine Raum-
  Verbindung entsteht beim ersten Aufruf und wird nach 2 min ohne Aufruf geschlossen.
  Nur unsere Räume (`Racespot1…99`) — kein offenes Relais.

## Das Format ist undokumentiert

Gelesen aus Appgineerings Web-App am 2026-10-07; Jürgen hat entschieden, darauf zu
bauen statt auf eine Absprache zu warten (Variante B). Folgen:

- Ändert Appgineering das Format, wirft der Leser, der Raum gilt als „broken“, und
  die Anzeige bietet nach höchstens 25 s Appgineerings eigene Seite an — **erst auf
  Klick** (Datenschutz). Der Link „Bei Appgineering öffnen“ ist immer da.
- Getestet gegen eine echte Session: siehe unten „Test“.
- Ein Frame nennt seinen Raum nicht. Deshalb eine Verbindung **je Raum**
  (Appgineerings eigene Seite zeigt immer nur einen).

Frame: `{ type, time, segments: [{ number, offset }], length, value }`, `value`
Base64, little-endian; Strings mit 7-Bit-Längenpräfix (.NET). Typen und Segment-
nummern stehen in `decode.ts` (`FRAME`, `applyFrame`). Flaggen nach Appgineerings
eigener Regel (`flagOf`).

## Datenschutz

Unsere Anzeige: Der Server holt die Daten, Besucher haben keinen Kontakt zu
Appgineering. Nur der Rückfall (Klick) und der Link „Bei Appgineering öffnen“
verbinden den Browser mit timing.appgineering.com. Steht in `legal/privacy.ts`,
Abschnitt 7 „Live Timing“ (de + en).

## Coolify (Website-App) — zu setzen von Jürgen

| Variable | Wert | wofür |
|---|---|---|
| `TALENT_SUPABASE_URL` | URL des Supabase-Projekts mit den `sch_*`-Tabellen (Data-Projekt des Talent Dashboards; nach dem Umzug die self-hosted URL) | Raum je Sendung |
| `TALENT_SUPABASE_ANON_KEY` | dessen **anon**-Schlüssel (der öffentliche, steht auch im Dashboard-JavaScript) — **nie** den service_role-Schlüssel | dito |

Beide nur zur Laufzeit nötig. Ohne sie rechnet die Website die Räume selbst
(Rückfall) — das stimmt, solange niemand im Dashboard einen Raum von Hand setzt.

## Für Hugo (Talent Dashboard)

> Hi Hugo, die Website zeigt jetzt das Live Timing von Appgineering zu jeder
> laufenden Sendung und holt sich den Raum dafür aus dem Talent Dashboard
> (`sch_events.timing_room` über `sheet_row_key`, read-only mit dem anon-Key). Zwei
> Bitten:
>
> 1. **„Live Timing: ja/nein“ pro Sendung** (Default ja; am liebsten auch pro Serie
>    voreinstellbar, z. B. RENNSPORT/Racecraft/VCO = nein). Heute bekommt jede
>    Sendung einen Raum und der Discord-Post immer einen Timing-Link, auch wenn gar
>    nicht in iRacing gefahren wird. Die Website liest das Feld dann mit und zeigt
>    ohne Timing keinen Reiter. Spaltenvorschlag: `sch_events.has_timing boolean
>    not null default true`.
> 2. **Räume auch ohne Klick auf „Allocate rooms“ setzen** — z. B. beim Sheet-Sync
>    oder per Cron. Solange `timing_room` leer ist, nimmt der Discord-Post Raum 1,
>    auch bei zwei gleichzeitigen Sendungen.
>
> Nebenbei aufgefallen: `sch_events` ist mit dem anon-Key komplett lesbar, also
> auch Zoom-, Castr- und Discord-Angaben. Für die Website reicht eine schmale
> Ansicht (`sheet_row_key, start_utc, end_utc, timing_room, has_timing, status`);
> die übrigen Spalten könnten dann für anon gesperrt werden. Wenn ihr das macht,
> sagt Bescheid, dann stelle ich die Website auf die Ansicht um.

## Test

- Lokal mit Testdaten: Live-Seite (Reiter, Breite, „Groß“, `?tab=timing`),
  Kalender-/Hero-Links, 1440 px und 375 px.
- Echte Session: aufgezeichnet in der Nacht 2026-10-07/08 (siehe docs/TODO.md 7y),
  Frames durch `decode.ts` gelesen.
