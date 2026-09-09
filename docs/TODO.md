# Website — offene Punkte

Stand: 2026-09-10. Was heute erledigt wurde, steht im Git-Log (`git log --since=2026-09-09`).
Reihenfolge ist Empfehlung: erst Struktur, dann Frameworks, dann Kür.

---

## 1. URL-basiertes i18n — der eine große Brocken

**Problem.** Sprache wird im Browser aus `localStorage` gelesen; der Server rendert
immer Englisch. Folgen: deutsche Besucher sehen kurz Englisch (Flash), Google
indexiert **ausschließlich Englisch** (racespot.tv taucht in deutschen Suchen nie auf
Deutsch auf), und 27 Komponenten müssen `'use client'` sein, nur um `t()` aufzurufen —
mehr JavaScript als nötig.

**Lösung.** Sprache in die URL: `racespot.tv/de/news/…`, `/en/…`. Middleware
erkennt `Accept-Language` beim ersten Besuch und leitet um; Server rendert pro
Sprache; `hreflang`-Tags pro Seite; die meisten Komponenten werden wieder Server
Components. Dateien betroffen: praktisch alle unter `src/app` und `src/components`,
`src/lib/language.tsx`, `src/middleware.ts`, `sitemap.ts`.

**Randbedingungen.** Alte URLs (`/news/<slug>`) müssen per 301 auf `/en/news/<slug>`
weiterleiten (Google, LinkedIn-Posts). Press Tool: `preview.article_path` in
`~/Press Tool/projects/racespot/project.yaml` auf `/en/news/{slug}` (oder `/de/…`)
umstellen — eine Zeile, aber vor dem ersten Post nach dem Umbau.

**Aufwand.** 2–3 Tage, eigener Branch, eigene Session.

## 2. Framework-Upgrades — nach Punkt 1

Next 14.2 → 16, React 18 → 19, Tailwind 3 → 4, framer-motion 11 → 13, ESLint 8 → 9
(Flat Config). Jeweils echte Migrationen mit Breaking Changes. Erst i18n, sonst
migriert man Code, der gleich danach umgebaut wird. Next 14.2.35 ist sicherheitsseitig
aktuell; kein Zeitdruck.

## 3. Umami-Analytics einschalten

**Server (Philip / Coolify).** `stats.racespot.tv` zeigt korrekt auf den Server, aber
Traefik liefert sein Default-Zertifikat und **503** — der Umami-Container ist nicht
erreichbar. Prüfen: läuft er, ist er healthy, Domain in Coolify **mit `https://`**
eingetragen (sonst kein Let's Encrypt).

**Website.** In Umami Website `racespot.tv` anlegen, ID kopieren, in Coolify beim
Website-Projekt `NEXT_PUBLIC_UMAMI_SRC=https://stats.racespot.tv/script.js` und
`NEXT_PUBLIC_UMAMI_WEBSITE_ID=<ID>` setzen, redeployen. Die Komponente
`src/components/seo/Analytics.tsx` rendert das Script dann automatisch (vorher: nichts).
UTM-Tags aus dem Press Tool erscheinen in Umami direkt als Quelle.

**Datenschutzerklärung** (`src/app/privacy/page.tsx`) im selben Zug bereinigen — siehe 4.

## 4. Datenschutzerklärung und Impressum inhaltlich prüfen

`privacy/page.tsx` ist datiert „April 20, 2024" und nennt **Google Analytics, Google
Tag Manager, etracker, Matomo, Facebook Pixel**, Newsletter mit Web-Beacons und
Kundenkonten — nichts davon existiert auf der Seite. Das ist eine Vorlage, kein
Abbild der Realität. Braucht eine inhaltliche Entscheidung (was nutzt ihr wirklich?),
dann Text anpassen, Datum setzen. Cookies: die Seite setzt aktuell **keine** außer
Turnstile-Cookies von Cloudflare und `localStorage` für die Sprache.

## 5. Kontaktformular in Produktion einmal echt durchtesten

Beide Formulare sind live. Ungeprüft: ob `SMTP_USER`/`SMTP_PASS` in Coolify gesetzt
sind. Ohne sie fällt das Formular auf `mailto:` zurück (öffnet das Mailprogramm des
Besuchers) — funktioniert, ist aber nicht das Gewollte. Einmal eine Broadcast-Anfrage
absenden und prüfen, ob sie bei `contact@racespot.tv` **und** als Kopie beim Absender
ankommt. Falls nicht: Env-Vars in Coolify setzen (Namen in `.env.example`).

## 6. Inhalte, die jährlich veralten

- `StatsBar` / About: „400+ Broadcasts", „100M+ Impressions", „6.2M+ YouTube Views" —
  hartcodiert in `src/components/sections/StatsBar.tsx` und `src/app/about/page.tsx`.
  Einmal im Jahr prüfen.
- `src/app/events/page.tsx`: Past Events hartcodiert; neue Events kommen nur per Code.
  Reicht, solange es 1–2 pro Jahr sind.
- `Team.tsx`: drei Personen, Bios in `translations.ts`.
- JSON-LD `foundingDate: '2013'`, Adresse Hürth — ok, nur bei Umzug/Umfirmierung ändern.

## 7. Coolify-Hausmeisterei

- **Tote zweite Website-App löschen**: UUID `i11m6pnwhz85y8oqyfrkuipm`
  (Status *exited*, sslip.io-Domain, alte Repo-URL, seit 16.03. unberührt). Danger Zone
  → Delete. Nicht `tpd5h47i…` — das ist die echte.
- Optional: persistentes Volume für `/app/.next/cache/images`. Der Cache wird beim
  Start ohnehin vorgewärmt (~30–60 s nach Deploy); ein Volume spart nur diese Minute.
- Philips `~/Press Tool/projects/racespot/NOTES.md` sagt noch „a merge does not build" —
  stimmt nicht mehr, Deploy läuft über den Repo-Webhook (siehe `CLAUDE.md`, Deployment).

## 8. Kleinere technische Punkte

- `/live` hat `force-dynamic` und braucht beim ersten Aufruf ~1,3 s (YouTube-Live-Check
  serverseitig). Akzeptabel; wenn es stört: Live-Erkennung komplett in den Client
  (der pollt ohnehin alle 60 s) und die Seite statisch machen.
- `CalendarClient.tsx` (619 Zeilen, framer-motion) ist die größte Client-Komponente
  (41 kB). Kandidat für Aufteilen, wenn man sowieso beim i18n-Umbau drin ist.
- ESLint läuft jetzt (`npm run lint`), war vorher nie konfiguriert. Bei Gelegenheit als
  Pre-Commit-Hook oder im Coolify-Build (`npm run lint && next build`) verankern.
