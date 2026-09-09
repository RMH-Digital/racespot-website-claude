# Coolify-Plattform — Grundlagen und Betriebsregeln

**Gemessener Stand:** 2026-09-09
**Umsetzung der Härtung:** 2026-08-10
**Gilt für:** alle Projekte auf der Coolify-Instanz von Philip (philip@racespot.tv)

> Dieses Dokument enthält Infrastrukturdaten (Server-IP, Domains, Versionen).
> **Keine Zugangsdaten, Tokens, Schlüssel oder App-Keys — und bitte auch keine
> hinzufügen.** Secrets gehören in einen Passwortmanager oder nach
> `~/.coolify-env` (chmod 600), nicht in Dokumente oder Repos.

---

## Wozu dieses Dokument

Es soll zwei Dinge leisten:

1. **Sessions in anderen Coolify-Projekten auf den aktuellen Stand bringen.**
   Wer noch von `http://178.104.72.17:8000` ausgeht, arbeitet mit veralteten
   Annahmen — dieser Zugang ist geschlossen.
2. **Neue Projekte von Anfang an richtig aufsetzen** (Abschnitt 4).

### Einbinden

Datei ins Repo legen (Wurzel oder `.claude/`) und in der `CLAUDE.md` des
Projekts eine Zeile ergänzen:

```markdown
Dieses Projekt läuft auf Philips Coolify-Instanz. Betriebsregeln, Domain- und
TLS-Setup, Verifikationsbefehle und bekannte Fallstricke stehen in
[COOLIFY-BASELINE.md](COOLIFY-BASELINE.md) — vor Infrastruktur-Eingriffen lesen.
```

Alternativ den Inhalt direkt in die `CLAUDE.md` übernehmen. Der Dateiname ist
frei; die Verweis-Zeile muss nur zum tatsächlichen Pfad passen.

---

## 1. Die Plattform in einem Absatz

Eine einzelne Hetzner-Cloud-Maschine trägt alle Projekte. Coolify verwaltet sie
und betreibt gleichzeitig **Traefik** als Reverse Proxy, der für jede Domain
automatisch Let's-Encrypt-Zertifikate ausstellt. Von außen sind nur **22, 80 und
443** erreichbar; alles andere ist per Hetzner-Cloud-Firewall zu. Jeder
HTTP-Verkehr — Anwendungen wie auch die Coolify-UI selbst — läuft über Traefik
auf 443. Anwendungen veröffentlichen **keine** eigenen Host-Ports.

---

## 2. Harte Fakten

| | |
|---|---|
| Coolify-UI | `https://coolify.racespot.tv` |
| Server | `racespot-server-hetzner`, CPX32 (4 vCPU, 8 GB, 80 GB) |
| Public IP | `178.104.72.17` (IPv6: `2a01:4f8:1c19:2bd4::/64`) |
| Standort | Hetzner Cloud, `eu-central`, Nürnberg |
| Hetzner-Projekt | `Racespot.tv` |
| SSH | `ssh coolify` (User `root`, Port 22) |
| Coolify | `ghcr.io/coollabsio/coolify:4.1.2` |
| Traefik | Image-Tag `traefik:v3.6`, laufend **3.6.25** |
| Docker | 27.0.3 |
| Proxy-Container | `coolify-proxy` |
| Server-Name in Coolify | `localhost` (Coolify verwaltet seinen eigenen Host) |

### Offene Ports (Soll-Zustand)

| Port | Status | Wofür |
|---|---|---|
| 22 | offen | SSH |
| 80 | offen | HTTP→HTTPS **und Let's-Encrypt-Erneuerung** |
| 443 | offen | alles Übrige |
| 8000 | **dicht** | war die unverschlüsselte Coolify-UI |
| 6001 / 6002 | **dicht** | Coolify-Realtime (läuft über 443) |
| 8080 | **dicht** | Traefik-Dashboard |

### Domains und DNS-Verwaltung

| Domain | DNS liegt bei | Besonderheit |
|---|---|---|
| `racespot.tv` | All-Inkl (`ns5/ns6.kasserver.com`) | **kein Wildcard** → erste Wahl für neue Subdomains |
| `rmh-digital.de` | All-Inkl | **Wildcard `*` → 85.13.141.139**; expliziter Record gewinnt, erschwert aber die Fehlersuche |
| `rennsport.gg` | Google Cloud DNS | anderer Verwaltungsweg |
| `rmh.digital` | zeigt auf Netcup (46.38.243.234) | **nicht** für diese Instanz verwenden |

---

## 3. Geltende Regeln

Diese Punkte sind bewusst entschieden. Wer davon abweichen will, sollte es mit
Philip abstimmen.

### 3.1 Zugang ausschließlich über HTTPS-Domain

Die Coolify-UI ist nur über `https://coolify.racespot.tv` erreichbar. Der
Zugang über IP und Port 8000 ist geschlossen, weil dort Login-Passwort und
API-Tokens im Klartext übertragen wurden.

**In Coolify wird die Domain mit `https://`-Präfix eingetragen** — daran erkennt
Coolify, dass ein Zertifikat ausgestellt werden soll. Ohne Präfix bleibt es bei
HTTP. Das gilt für die Instanz-URL (Settings → Configuration → General → *URL*)
genauso wie für jede Anwendungsdomain.

### 3.2 Die Firewall ist eine Allow-Liste

Hetzner-Cloud-Firewall `firewall-1`, angewendet auf den Server. Regeln eingehend,
jeweils Quelle `0.0.0.0/0` **und** `::/0`:

```
TCP  22     SSH
ICMP        ping
TCP  80     HTTP + ACME
TCP  443    HTTPS
```

**Alles, was nicht in der Liste steht, wird verworfen.** Wer eine Regel
hinzufügt oder entfernt, muss die vollständige Liste im Blick haben — Port 22
zu vergessen bedeutet Aussperrung. Outbound bleibt unangetastet (Hetzner erlaubt
standardmäßig alles); eine Einschränkung dort bricht Docker-Pulls, Git-Zugriffe
und die Zertifikatserneuerung.

### 3.3 Port 80 muss offen bleiben

Auch wenn alles auf HTTPS umleitet: Let's Encrypt validiert die Erneuerung per
HTTP-01 auf Port 80. Wird 80 geschlossen, laufen in 90 Tagen **alle**
Zertifikate auf dem Server ab, nicht nur das von Coolify.

### 3.4 Der Traefik-Image-Tag ist gleitend

In `/data/coolify/proxy/docker-compose.yml` steht `image: 'traefik:v3.6'` —
nicht auf eine Patchversion festgenagelt. **Patchen heißt deshalb: „Restart
Proxy" in Coolify klicken**, das zieht die neueste `v3.6.x`. Keine
Dateiänderung nötig.

Ein Minor-Upgrade (aktuell steht `v3.7` bereit) würde ein Editieren des Tags
erfordern und birgt Breaking Changes — **bewusst nicht gemacht**. Der blaue
Hinweis dazu in der UI bleibt sichtbar, deshalb hängt am Reiter *Proxy*
dauerhaft ein Warndreieck. Das ist kein Fehler.

### 3.5 Auto Update ist an, weil es Backups gibt

- **Coolify Auto Update:** aktiv, Cron `0 0 * * *` (Settings → Updates).
- **Hetzner-Backups:** aktiv seit 2026-08-10. Täglich, sieben Slots rollierend,
  ~2,80 €/Monat (20 % des Serverpreises).

Diese beiden hängen zusammen. Unbeaufsichtigtes nächtliches Auto-Update **ohne**
Sicherung war die riskante Kombination — mit täglicher Sicherung ist automatisch
eingespieltes Sicherheitsupdate die bessere Wahl. **Wer Backups abschaltet, muss
auch Auto Update abschalten** (und umgekehrt neu abwägen).

Hetzner sichert **keine Volumes**. Für diesen Server unkritisch, weil kein
Volume gemountet ist und alle Daten auf `/dev/sda1` liegen. Ändert sich das,
ändert sich die Bewertung.

Eine Coolify-eigene Datenbanksicherung (Settings → Backup) ist **nicht**
konfiguriert; sie verlangt, zuerst eine Datenbank-Ressource in Coolify anzulegen.
Mit den Hetzner-Backups nicht dringend.

### 3.6 Vor dem Eingriff Baseline messen, danach nachmessen

Kein Infrastruktur-Eingriff ohne Vorher-Messung aller Produktivdomains und
Nachher-Messung derselben. Rezepte in Abschnitt 5. Behauptungen wie „müsste
funktionieren" ersetzen keine Messwerte.

### 3.7 Den scharfschaltenden Klick macht Philip

Speichern der Instanz-Domain, Anlegen/Ändern der Firewall, Updates, Käufe,
Passwörter, 2FA — die letzte Bestätigung macht Philip selbst. Vorbereiten,
Felder füllen, Bedingungen erklären und hinterher verifizieren ist die Aufgabe
der Session.

---

## 4. Neues Projekt auf dieser Instanz aufsetzen

### 4.1 Subdomain und DNS

1. Subdomain wählen. **`racespot.tv` bevorzugen** — kein Wildcard im Weg. Bei
   `rmh-digital.de` überschreibt ein expliziter Record die Wildcard zwar, aber
   Fehldiagnosen werden wahrscheinlicher.
2. **A-Record** auf `178.104.72.17` setzen, **kein CNAME**.
3. **Propagierung abwarten und prüfen, bevor die Domain in Coolify landet** —
   sonst schlägt die Zertifikatsausstellung fehl und Coolify hat einen
   fehlerhaften Zustand zu verwalten.

```bash
DOM=neu.racespot.tv
for r in 1.1.1.1 8.8.8.8 9.9.9.9; do printf "%-10s " $r; dig +short $DOM A @$r; done
dig +short $DOM A @ns5.kasserver.com    # autoritativ
```

### 4.2 Vorflug-Prüfung für Let's Encrypt

```bash
DOM=neu.racespot.tv
dig +short $DOM AAAA @1.1.1.1     # leer erwartet — ein AAAA kann ACME fehlleiten
dig +short racespot.tv CAA @1.1.1.1  # leer erwartet — CAA kann LE aussperren
curl -s -o /dev/null -m 10 -w "port 80 -> %{http_code} via %{remote_ip}\n" http://$DOM/
```

Vor dem Einrichten ist **404 vom Server `178.104.72.17`** das richtige Bild:
Traefik nimmt die Anfrage an, kennt den Vhost noch nicht. Genau das ist die
Voraussetzung dafür, dass die HTTP-01-Challenge durchkommt.

### 4.3 In Coolify

- Domain **mit `https://`-Präfix** eintragen (siehe 3.1).
- **Keine Host-Ports veröffentlichen.** Der Container spricht über das
  `coolify`-Docker-Netz mit Traefik. Ein `ports:`-Mapping wäre von der Firewall
  ohnehin blockiert und würde nur Verwirrung stiften.
- Mehrere Domains gehen kommagetrennt:
  `https://a.example.com,https://www.a.example.com`
- Coolifys DNS Validation ist aktiv (Settings → Advanced) und prüft vor dem
  Speichern selbst, ob die Domain auf diesen Server zeigt.

### 4.4 Abnahme

```bash
DOM=neu.racespot.tv
curl -sSL -o /dev/null -w "https -> %{http_code} (final %{url_effective})\n" https://$DOM/
echo | openssl s_client -connect $DOM:443 -servername $DOM 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
echo | openssl s_client -connect $DOM:443 -servername $DOM 2>&1 | grep -m1 "Verify return code"
curl -s -o /dev/null -w "http -> %{http_code}, redirect: %{redirect_url}\n" http://$DOM/
```

Erwartet: `Verify return code: 0 (ok)`, Aussteller Let's Encrypt, HTTP leitet
auf HTTPS um. **Ohne `-k` prüfen** — `-k` schaltet genau die Validierung ab, die
hier interessiert.

Zusätzlich: mindestens zwei bestehende Produktivseiten stichprobenartig
nachmessen (Abschnitt 5).

---

## 5. Verifikations-Rezepte

### Alle Produktivdomains

```bash
for d in coolify.racespot.tv racespot.tv www.racespot.tv \
         rmh-digital.de racespot.gg r1.rennsport.gg; do
  printf "  %-22s " "$d"
  curl -sL -o /dev/null -m 15 -w "%{http_code}\n" "https://$d/"
done
```

### Ports von außen

```bash
for p in 22 80 443 6001 6002 8000 8080; do
  printf "  %-5s " "$p"
  nc -z -G 5 178.104.72.17 $p >/dev/null 2>&1 && echo OFFEN || echo DICHT
done
```

Soll: 22/80/443 offen, alles andere dicht.

### Zustand auf dem Server

```bash
ssh coolify '
  echo "Coolify: $(docker inspect --format "{{.Config.Image}}" coolify)"
  echo "Traefik: $(docker exec coolify-proxy traefik version | head -1)"
  echo "unhealthy: [$(docker ps --filter health=unhealthy --format "{{.Names}}" | tr "\n" " ")]"
  df -h / | awk "NR==2{print \"Disk: \"\$3\" / \"\$2\" (\"\$5\")\"}"
'
```

### Während eines Eingriffs mitlaufen lassen

```bash
for i in $(seq 1 6); do
  echo "--- $(date -u +%H:%M:%SZ) ---"
  for d in coolify.racespot.tv racespot.tv rmh-digital.de racespot.gg r1.rennsport.gg; do
    printf "  %-22s " "$d"; curl -sL -o /dev/null -m 10 -w "%{http_code}\n" "https://$d/"
  done
  [ $i -lt 6 ] && sleep 20
done
```

### Realtime (Live-Logs, Web-Terminal) prüfen

**Nur im eingeloggten Browser, nicht von außen.** In der DevTools-Konsole auf
der Coolify-Seite:

```js
(() => { const c = window.Echo?.connector?.pusher?.connection;
  return { state: c?.state, url: c?.connection?.transport?.socket?.url }; })()
```

Erwartet: `state: "connected"` und eine `wss://coolify.racespot.tv/app/…`-URL.

---

## 6. Bekannte Fallstricke

Alle vier wurden in der Session vom 2026-08-10 tatsächlich getroffen.

### 6.1 `curl` gegen den Realtime-Endpunkt ist irreführend

Soketi beantwortet einen **falschen** App-Key mit **500** und `/app/` ohne Key
mit **404**. Beides sieht nach kaputter Traefik-Route aus, ist aber nur ein
falsch geratener Key.

**In dieser Session wurde daraus fälschlich geschlossen, Realtime sei defekt** —
inklusive eines vorgeschlagenen `.env`-Eingriffs, der überflüssig gewesen wäre.
Tatsächlich lief der Kanal einwandfrei. Der App-Key steht im Client unter
`window.Echo.connector.options.key`; verlässlich ist nur die Messung im
eingeloggten Browser (Abschnitt 5).

**Lehre:** Wenn eine Außenmessung „defekt" sagt und es gibt einen Weg, dasselbe
von innen zu messen — den nehmen, bevor man Konfiguration anfasst.

### 6.2 Claude in Chrome erreicht nur `178.104.72.17`

Jede andere Domain wird mit `Navigation to this domain is not allowed`
abgewiesen. Das ist eine Freigabeliste des Connectors, **nicht** Chromes
Erweiterungsrechte — die standen auf „all sites" und änderten nichts.

**Nutzbar ist der In-App-Browser** (`preview_start` + `navigate`). Da Port 8000
inzwischen geschlossen ist, kommt Claude in Chrome an diese Instanz gar nicht
mehr heran.

### 6.3 Hetzner im In-App-Browser

- Beim ersten Aufruf hängt die Bot-Prüfung „Heray" bei *Verifying…*. **Ein
  erneutes Navigieren auf dieselbe URL löst das** (kein Umgehen der Prüfung,
  einfach ein zweiter Versuch).
- Hetzner blendet „BROWSER NOT SUPPORTED" ein — die Oberfläche war dennoch voll
  bedienbar.
- **Die Server-Web-Konsole öffnet sich nicht**: sie ist ein Popup und wird
  unterdrückt. Über *Actions → Console* und über das Zeilenmenü probiert, beide
  ohne Ergebnis. Dafür Philips eigenen Chrome nutzen.
- Nach Aktivierung von 2FA beendet Hetzner **alle Sessions**.

### 6.4 Coolifys eingebautes Terminal rendert falsch

*Server → Terminal* gibt eine Root-Shell ohne Popup und ohne Root-Passwort —
der bessere Weg als die Hetzner-Konsole. **Aber** im In-App-Browser ist die
Darstellung verstümmelt: getippter Text erscheint doppelt, `Ctrl+C` zeigt keine
Wirkung, die Anzeige aktualisiert nicht. Der Befehl lief trotzdem korrekt durch.

**Lehre:** Der Anzeige nicht glauben. Ergebnis unabhängig verifizieren — damals
per `ssh` von außen und `cat ~/.ssh/authorized_keys`.

---

## 7. Nicht anfassen

- **`authorized_keys` auf dem Server:** enthält neben Philips Schlüssel einen
  ohne Kommentar und **Coolifys eigenen** (Kommentar `coolify`). Letzterer
  verwaltet den Host als `localhost` — **Entfernen bricht Coolify.**
- **Der Coolify-Server-Eintrag `localhost`:** „This is the server where Coolify
  is running on. Don't delete this!"
- **Das ungenutzte Volume:** siehe Abschnitt 8; Löschen ist unwiderruflich und
  Philips Entscheidung.
- **`/data/coolify/proxy/docker-compose.yml`:** wurde nicht editiert und muss
  fürs Patchen auch nicht editiert werden (3.4).
- **Der statische Mirror `r1.rennsport.gg`** und sein Coolify-Projekt: läuft,
  ist verifiziert.

---

## 8. Offene Punkte (Stand 2026-09-09)

### 8.1 Auto Update hat die Version nicht bewegt — prüfen

Coolify steht seit dem 2026-08-10 unverändert auf `4.1.2`, obwohl Auto Update
aktiv ist. Entweder ist `4.1.2` weiterhin aktuell, oder das Auto Update greift
nicht. **Nicht als Störung annehmen, sondern nachsehen**: Settings → Updates →
*Check Manually*.

### 8.2 Zertifikatserneuerung noch nicht erprobt

Das aktive Zertifikat ist das ursprüngliche (10. Aug → 8. Nov 2026). Die
Erneuerung steht Anfang Oktober an — der ACME-Pfad **durch die neue Firewall**
ist damit noch nicht in der Praxis bestätigt. Anfang Oktober einmal
nachschauen; Port 80 offen halten (3.3).

### 8.3 Ungenutztes Volume

Hetzner zählt im Projekt 1 Volume, auf dem Server ist keines gemountet (kein
`HC_Volume` in `mount`, `/mnt` leer, alles auf `/dev/sda1`). Kostet laufend
(~0,044 €/GB/Monat). Entweder fehlt der Mount oder es wird nicht gebraucht.

### 8.4 Snapshot aufräumen

Snapshot `418601331` („vor Coolify-Update…", 6,89 GB) war die Absicherung für
das Update vom 2026-08-10. 4.1.2 läuft seit vier Wochen stabil — der Snapshot
kann weg, die täglichen Backups ersetzen ihn.

### 8.5 Zwei Dinge, die nie gegengeprüft wurden

- Ob das **2FA-Warnbanner** im Hetzner-Dashboard verschwunden ist. 2FA ist
  aktiv (der erzwungene Logout belegt es), das Banner wurde aber nicht mehr
  gesehen.
- Ob im Hetzner-Backup-Reiter **inzwischen mehrere tägliche Backups** liegen.
  Beim Aktivieren wurde eines sofort erstellt; der laufende Rhythmus ist nicht
  bestätigt.

Beides je ein Blick beim nächsten Console-Besuch.

### 8.6 Veraltete Verweise in anderen Repos

Repos und READMEs, die noch `http://178.104.72.17:8000` nennen, sind falsch.
Beim Durchgehen der Projekte mit korrigieren.

---

## 9. Arbeitsweise mit Philip

- **Er schreibt Deutsch — auf Deutsch antworten.**
- Passwörter, 2FA und App-/OAuth-Berechtigungen macht er selbst. Nicht anbieten,
  das zu übernehmen.
- Bei Eingriffen in laufende Systeme will er mitentscheiden; **der letzte
  scharfschaltende Klick gehört ihm** (3.7).
- Er prüft Ergebnisse unabhängig nach, teils in einer frischen Session ohne
  Schreibrechte. **Belastbare Messwerte liefern, keine Behauptungen** — und
  eigene Fehlschlüsse klar benennen statt sie zu glätten.
- SSH-Schlüssel: **ohne Passphrase**, so gewünscht.
- Er arbeitet gern Schritt für Schritt mit sichtbarem Browser mit.

---

## Änderungsprotokoll

### 2026-08-10 — Härtung und Updates

| Was | Vorher | Nachher |
|---|---|---|
| Coolify-Zugang | `http://178.104.72.17:8000` (Klartext) | `https://coolify.racespot.tv` (Let's Encrypt) |
| Offene Ports | 22, 80, 443, 6001, 6002, 8000, 8080 | nur 22, 80, 443 |
| Firewall | keine | Hetzner `firewall-1`, Allow-Liste |
| Traefik | `v3.6.10` | `v3.6.25` |
| Coolify | `v4.0.0-beta.468` | `v4.1.2` |
| Sicherung | **keine** | Hetzner-Backups, täglich, 7 Slots |
| SSH vom Mac | keiner | `ssh coolify` |
| Hetzner-Konto | ohne 2FA | mit 2FA |

**Ausfall auf Produktivseiten: keiner.** Gemessen in Abständen von 12–20
Sekunden über beide Updates hinweg. Belegt zusätzlich durch
Container-Laufzeiten: die Anwendungscontainer liefen unverändert durch (3 Tage
bis 8 Wochen), nur Coolify- und Proxy-Container wurden neu gestartet.

### 2026-09-09 — Nachmessung

Unverändert und gesund: alle sechs Domains 200, Zertifikat gültig,
Portzustand korrekt, kein Container `unhealthy`, Disk 20/75 GB.

Neu aufgefallen: Der Server wurde um den **12./13. August neu gestartet** (nicht
von uns — Uptime knapp 4 Wochen bei 4 Wochen alten Containern). Alles kam
korrekt hoch; die Konfiguration ist damit nebenbei als reboot-fest bestätigt.
