import { p, h3, ul, type LegalDoc, type LegalLang } from './types'

/**
 * Privacy policy, one document per language (en + de — see ./types.ts).
 *
 * Rewritten 2026-09-14 to describe what the site actually does. The previous
 * text was a generic webshop template naming PayPal, Stripe, Mailchimp,
 * CleverReach, Help Scout, Google Analytics, Google Tag Manager, Google Ads,
 * etracker, Matomo, Facebook Pixel, a newsletter with double opt-in, customer
 * accounts, credit assessment and a cookie consent banner. None of that exists
 * here, and two services that do exist — Cloudflare Turnstile and the YouTube
 * embeds — were missing entirely.
 *
 * What the site really does (verified in the code on 2026-09-14):
 *   - Hetzner Cloud, Nuremberg → server log files
 *   - Umami, self-hosted on the same server → cookieless analytics
 *   - Own click/scroll/journey measurement (components/seo/Heatmap.tsx) →
 *     analytics.racespot.tv, no cookie, no storage, no IP (added 2026-09-24)
 *   - Cloudflare Turnstile on the contact form → cookie + IP to Cloudflare (US)
 *   - YouTube embeds: /live embeds youtube.com's live chat on load; the stream
 *     itself starts on a click (LivePlayerProvider). Everywhere else a
 *     recording opens in the site's own player on a click, from
 *     youtube-nocookie.com; the still images run through next/image, so they
 *     are served from our own server and the visitor's browser reaches no
 *     Google host before pressing play (checked again 2026-09-21: eighteen
 *     thumbnails on /broadcasts, every one of them via /_next/image)
 *   - Contact form → email via Microsoft 365
 *   - First-party `racespot-lang` cookie, one year, functional only
 *   - Fonts are self-hosted by next/font; no request reaches Google
 *   - Footer social icons are plain links, no embeds, no pixels
 *
 * KEEP THIS IN SYNC WITH THE CODE. Adding any third-party script, embed or
 * tracker means editing this file in the same commit.
 */

const en: LegalDoc = {
  updated: 'Last updated: September 24, 2026',
  sections: [
    {
      heading: '1. Data Controller',
      body: [
        p('Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Germany'),
        p('Managing Director: Philip Stamm · Commercial register: Amtsgericht Köln, HRB 118561'),
        p('Email: [contact@racespot.tv](mailto:contact@racespot.tv) · Phone: +49 (0)163 686 7887'),
      ],
    },
    {
      heading: '2. Summary',
      body: [
        p('This website is an information site. There is no shop, no customer account, no newsletter and no advertising network. We do not profile you, we do not track you across websites, and we do not sell or pass on your data for marketing purposes.'),
        p('Three things happen automatically when you visit: our server writes a log entry, our own analytics counts the page view without cookies, and — only on pages where you play a video — YouTube is contacted. Everything else happens only if you write to us.'),
      ],
    },
    {
      heading: '3. Hosting and Server Log Files',
      body: [
        p('The site is hosted on a server of **Hetzner Online GmbH**, Industriestr. 25, 91710 Gunzenhausen, Germany, located in Nuremberg. A data processing agreement under Art. 28 GDPR is in place. Privacy: [hetzner.com/legal/privacy-policy](https://www.hetzner.com/legal/privacy-policy/)'),
        p('Each request is written to a log file containing the IP address, the date and time, the page requested, the referring page, the browser and operating system version. These entries are used to operate the site securely and to investigate faults and attacks. Legal basis: **Art. 6(1)(f) GDPR** (legitimate interest in a secure, functioning website). They are not combined with other data and are deleted after seven days unless a specific incident requires them for longer.'),
      ],
    },
    {
      heading: '4. Cookies and Local Storage',
      body: [
        p('This website sets **no advertising or tracking cookies**, which is why you are not asked for cookie consent. Only two entries can appear on your device:'),
        ul(
          '**`racespot-lang`** — remembers the language you selected, for one year. Set by us, read only by us. Legal basis: **Art. 6(1)(f) GDPR** (legitimate interest in showing you the site in your language). It is only written when you switch language within the site.',
          '**Cloudflare Turnstile** — sets a short-lived entry while the contact form checks that you are not a bot (see section 6).',
        ),
        p('You can delete both at any time in your browser settings; the site remains fully usable.'),
      ],
    },
    {
      heading: '5. Web Analytics (Umami)',
      body: [
        p('To find out how many people read our pages, we use **Umami**, an open-source analytics tool that we host ourselves on the same German server as this website. No data leaves our infrastructure and no third party is involved.'),
        p('Umami works **without cookies** and stores **no personal data**. Your IP address is not retained; visitors are counted using an anonymous hash that is regenerated daily and cannot be traced back to a person or linked across days. What we see is aggregated: page views, referring sites, country, browser and device type.'),
        p('We also record **how fast the page loaded for you** — the standard web performance measurements (loading, responsiveness, layout stability). These are timings in milliseconds, measured by your own browser and sent along with the page view. They say something about our pages, not about you, and are stored in the same aggregated, non-personal form.'),
        p('In addition, our own measurement records **where on a page people click, how far they scroll and how long a page is actively in view**, and in which order pages are opened within one visit. It runs on our own server in Germany, sets **no cookie and writes nothing to your device**: the link between the pages of one visit exists only in the memory of the open browser tab and is gone when you reload or close it. We store the position of a click, the clicked element (for example a button label — never what you type into a form), the page, the scroll depth, the time on the page and the device class (mobile, tablet or desktop). We do not store your IP address or any identifier that recognises you on a later visit. If your browser sends a “Do Not Track” or “Global Privacy Control” signal, this measurement does not run.'),
        p('Legal basis: **Art. 6(1)(f) GDPR** (legitimate interest in understanding how our site is used). Because no personal data is processed, there is nothing to object to and nothing to erase. More about the tool: [umami.is](https://umami.is/)'),
      ],
    },
    {
      heading: '6. Contact Form and Email',
      body: [
        p('When you use one of our contact forms, we process the data you enter — your name, email address and the content of your message, plus the details of your enquiry in the broadcast request form — in order to answer you. Legal basis: **Art. 6(1)(b) GDPR** where the enquiry concerns a contract or its preparation, otherwise **Art. 6(1)(f) GDPR** (legitimate interest in responding to enquiries).'),
        p('Providing this data is voluntary; without an email address we cannot reply. Enquiries are deleted once they are settled and no retention obligation applies — as a rule after two years at the latest.'),
        h3('Spam protection (Cloudflare Turnstile)'),
        p('The forms are protected by **Turnstile**, a service of **Cloudflare, Inc.**, 101 Townsend St., San Francisco, CA 94107, USA. It checks whether the form is being filled in by a person rather than a bot. To do so, your IP address and information about your browser are transmitted to Cloudflare and a short-lived entry is stored on your device. Turnstile works without tracking cookies and is not used for advertising.'),
        p('Legal basis: **Art. 6(1)(f) GDPR** (legitimate interest in protecting our forms from automated abuse). Cloudflare is certified under the EU-US Data Privacy Framework and we have concluded standard contractual clauses. Privacy: [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/)'),
        h3('Email delivery'),
        p('Messages sent through the forms and replies from us are handled by **Microsoft 365** (Microsoft Ireland Operations Ltd., Dublin). A data processing agreement is in place. Privacy: [privacy.microsoft.com](https://privacy.microsoft.com/privacystatement)'),
      ],
    },
    {
      heading: '7. Embedded Videos (YouTube)',
      body: [
        p('Our broadcasts run on YouTube, operated by **Google Ireland Limited**, Gordon House, Barrow Street, Dublin 4, Ireland.'),
        ul(
          'On our **Live** page the YouTube live chat is embedded directly; the stream itself only starts when you click play. When you open that page, a connection to YouTube is established, your IP address is transmitted, and Google may set cookies and read existing ones. If you are signed in to a Google account, the visit can be assigned to it.',
          'Everywhere else — the home page, Broadcasts, Events, the Calendar and inside articles — a recording opens in our own player when you click play, and only then, in the extended data protection mode (youtube-nocookie.com). The preview images are served from our own server, so no connection to Google is made and no cookies are set before you start a video.',
        ),
        p('Legal basis: **Art. 6(1)(f) GDPR** (legitimate interest in presenting our broadcasts on the site). Google also processes data in the USA on the basis of the EU-US Data Privacy Framework and standard contractual clauses. What Google does with the data is beyond our control; see [policies.google.com/privacy](https://policies.google.com/privacy).'),
        p('If you would rather avoid this, do not open the Live page, or use a browser that blocks third-party content.'),
      ],
    },
    {
      heading: '8. Social Media',
      body: [
        p('The icons in our footer are **plain links** to our profiles on YouTube, Twitch, Instagram, TikTok, Facebook and X. They contain no plug-ins, pixels or embedded content, so no data is transmitted until you click one. From that point on, the privacy policy of the network you visit applies.'),
        p('We also maintain profiles on those platforms. There, the operators process your data on their own responsibility; on Facebook and Instagram pages this is a joint responsibility under Art. 26 GDPR, limited to the page statistics we receive.'),
      ],
    },
    {
      heading: '9. Fonts and Other Assets',
      body: [
        p('All fonts, images and scripts are delivered from our own server. The Inter and Oswald typefaces are downloaded at build time and self-hosted, so **no request reaches Google when you visit the site**. We use no content delivery network for the site itself.'),
      ],
    },
    {
      heading: '10. Legal Bases at a Glance',
      body: [
        ul(
          '**Art. 6(1)(b) GDPR** — enquiries relating to a contract or its preparation',
          '**Art. 6(1)(c) GDPR** — statutory retention obligations',
          '**Art. 6(1)(f) GDPR** — secure operation of the site, server logs, cookieless analytics, spam protection, video embeds, language preference',
        ),
        p('We do not rely on consent (Art. 6(1)(a) GDPR) anywhere on this website, because nothing here requires it.'),
      ],
    },
    {
      heading: '11. Data Retention',
      body: [
        ul(
          'Server log files: seven days, longer only if a specific incident requires it',
          'Analytics: aggregated statistics without personal reference, no deletion period applicable',
          'Enquiries via the contact forms: until settled, as a rule no longer than two years',
          'Business correspondence subject to commercial or tax law: six or ten years (§ 257 HGB, § 147 AO)',
          'Language cookie: one year, deletable by you at any time',
        ),
      ],
    },
    {
      heading: '12. International Data Transfers',
      body: [
        p('Our own infrastructure is located exclusively in Germany. Data reaches the USA in two cases only: **Cloudflare** (spam protection on the forms) and **Google/YouTube** (video embeds). Both providers are certified under the **EU-US Data Privacy Framework**, and standard contractual clauses under Art. 46 GDPR apply in addition.'),
        p('More information: [dataprivacyframework.gov](https://www.dataprivacyframework.gov/)'),
      ],
    },
    {
      heading: '13. Your Rights',
      body: [
        p('Under the GDPR you have the right to:'),
        ul(
          'access the personal data we hold about you (Art. 15)',
          'have inaccurate data corrected (Art. 16)',
          'have your data erased (Art. 17)',
          'have processing restricted (Art. 18)',
          'receive your data in a portable format (Art. 20)',
          '**object to processing based on legitimate interests (Art. 21)** — including the processing described in sections 3, 6 and 7',
        ),
        p('To exercise these rights, an email to [contact@racespot.tv](mailto:contact@racespot.tv) is enough.'),
        p('You also have the right to lodge a complaint with a supervisory authority (Art. 77 GDPR). The authority responsible for us is the **State Commissioner for Data Protection and Freedom of Information North Rhine-Westphalia**, Kavalleriestr. 2–4, 40213 Düsseldorf — [ldi.nrw.de](https://www.ldi.nrw.de/)'),
      ],
    },
    {
      heading: '14. Security',
      body: [
        p('The entire site is delivered over HTTPS with a valid certificate; HSTS, content-type, frame and referrer policies are set. Access to the server is limited to a small group of administrators and secured with key-based authentication and two-factor authentication. Backups are created daily.'),
      ],
    },
    {
      heading: '15. Changes to This Policy',
      body: [
        p('We update this policy when the site changes. The date at the top shows the current version.'),
      ],
    },
  ],
}

const de: LegalDoc = {
  updated: 'Stand: 24. September 2026',
  sections: [
    {
      heading: '1. Verantwortlicher',
      body: [
        p('Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Deutschland'),
        p('Geschäftsführer: Philip Stamm · Handelsregister: Amtsgericht Köln, HRB 118561'),
        p('E-Mail: [contact@racespot.tv](mailto:contact@racespot.tv) · Telefon: +49 (0)163 686 7887'),
      ],
    },
    {
      heading: '2. Das Wichtigste vorweg',
      body: [
        p('Diese Website ist eine Informationsseite. Es gibt keinen Shop, kein Kundenkonto, keinen Newsletter und kein Werbenetzwerk. Wir erstellen keine Profile, verfolgen Sie nicht über andere Websites hinweg und geben Ihre Daten nicht zu Werbezwecken weiter oder verkaufen sie.'),
        p('Drei Dinge geschehen beim Besuch automatisch: Unser Server schreibt einen Logeintrag, unsere eigene Statistik zählt den Seitenaufruf ohne Cookies, und — nur auf Seiten mit Video — wird YouTube kontaktiert. Alles Weitere passiert erst, wenn Sie uns schreiben.'),
      ],
    },
    {
      heading: '3. Hosting und Server-Logfiles',
      body: [
        p('Die Website läuft auf einem Server der **Hetzner Online GmbH**, Industriestr. 25, 91710 Gunzenhausen, Standort Nürnberg. Ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO besteht. Datenschutz: [hetzner.com/de/rechtliches/datenschutz](https://www.hetzner.com/de/rechtliches/datenschutz/)'),
        p('Jeder Aufruf wird in einer Logdatei festgehalten: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, verweisende Seite, Browser- und Betriebssystemversion. Diese Einträge dienen dem sicheren Betrieb sowie der Aufklärung von Störungen und Angriffen. Rechtsgrundlage: **Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse an einer sicheren, funktionierenden Website). Sie werden nicht mit anderen Daten zusammengeführt und nach sieben Tagen gelöscht, sofern kein konkreter Vorfall eine längere Aufbewahrung erfordert.'),
      ],
    },
    {
      heading: '4. Cookies und lokale Speicherung',
      body: [
        p('Diese Website setzt **keine Werbe- oder Tracking-Cookies**. Deshalb werden Sie auch nicht nach einer Cookie-Einwilligung gefragt. Nur zwei Einträge können auf Ihrem Gerät entstehen:'),
        ul(
          '**`racespot-lang`** — merkt sich die von Ihnen gewählte Sprache, ein Jahr lang. Von uns gesetzt, nur von uns gelesen. Rechtsgrundlage: **Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse daran, Ihnen die Seite in Ihrer Sprache zu zeigen). Der Eintrag entsteht nur, wenn Sie innerhalb der Seite die Sprache wechseln.',
          '**Cloudflare Turnstile** — legt beim Absenden des Kontaktformulars kurzzeitig einen Eintrag an, um zu prüfen, dass Sie kein Bot sind (siehe Abschnitt 6).',
        ),
        p('Beides können Sie jederzeit in den Browsereinstellungen löschen; die Seite bleibt vollständig nutzbar.'),
      ],
    },
    {
      heading: '5. Reichweitenmessung (Umami)',
      body: [
        p('Um zu erfahren, wie viele Menschen unsere Seiten lesen, nutzen wir **Umami**, ein quelloffenes Statistikwerkzeug, das wir selbst auf demselben deutschen Server betreiben wie diese Website. Es verlässt kein Datum unsere Infrastruktur, ein Dritter ist nicht beteiligt.'),
        p('Umami arbeitet **ohne Cookies** und speichert **keine personenbezogenen Daten**. Ihre IP-Adresse wird nicht aufbewahrt; Besucher werden über einen anonymen Hash gezählt, der täglich neu gebildet wird und sich weder einer Person zuordnen noch über Tage hinweg verknüpfen lässt. Wir sehen aggregierte Werte: Seitenaufrufe, verweisende Seiten, Land, Browser- und Gerätetyp.'),
        p('Zusätzlich erfassen wir, **wie schnell die Seite bei Ihnen geladen hat** — die üblichen Messwerte zur Webleistung (Ladezeit, Reaktionsfähigkeit, Stabilität des Layouts). Das sind Zeitangaben in Millisekunden, die Ihr eigener Browser misst und zusammen mit dem Seitenaufruf übermittelt. Sie sagen etwas über unsere Seiten aus, nicht über Sie, und werden in derselben aggregierten, nicht personenbezogenen Form gespeichert.'),
        p('Außerdem erfasst eine eigene Messung, **wo auf einer Seite geklickt wird, wie weit gescrollt wird und wie lange eine Seite aktiv im Blick ist**, sowie in welcher Reihenfolge Seiten innerhalb eines Besuchs aufgerufen werden. Sie läuft auf unserem eigenen Server in Deutschland, setzt **kein Cookie und speichert nichts auf Ihrem Gerät**: Die Verbindung zwischen den Seiten eines Besuchs besteht nur im Arbeitsspeicher des geöffneten Browser-Tabs und ist beim Neuladen oder Schließen verschwunden. Wir speichern die Position eines Klicks, das angeklickte Element (etwa die Beschriftung einer Schaltfläche — nie, was Sie in ein Formular eingeben), die Seite, die Scrolltiefe, die Verweildauer und die Geräteklasse (Handy, Tablet oder Desktop). Ihre IP-Adresse und eine Kennung, die Sie bei einem späteren Besuch wiedererkennt, speichern wir nicht. Sendet Ihr Browser das Signal „Do Not Track“ oder „Global Privacy Control“, findet diese Messung nicht statt.'),
        p('Rechtsgrundlage: **Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse daran, die Nutzung unserer Seite zu verstehen). Da keine personenbezogenen Daten verarbeitet werden, gibt es dem nichts zu widersprechen und nichts zu löschen. Mehr zum Werkzeug: [umami.is](https://umami.is/)'),
      ],
    },
    {
      heading: '6. Kontaktformular und E-Mail',
      body: [
        p('Wenn Sie eines unserer Kontaktformulare nutzen, verarbeiten wir die von Ihnen eingegebenen Daten — Name, E-Mail-Adresse und Inhalt Ihrer Nachricht, bei der Broadcast-Anfrage zusätzlich die Angaben zu Ihrem Vorhaben — um Ihnen zu antworten. Rechtsgrundlage: **Art. 6 Abs. 1 lit. b DSGVO**, soweit die Anfrage einen Vertrag oder dessen Anbahnung betrifft, sonst **Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse an der Beantwortung von Anfragen).'),
        p('Die Angabe ist freiwillig; ohne E-Mail-Adresse können wir nicht antworten. Anfragen löschen wir, sobald sie erledigt sind und keine Aufbewahrungspflicht entgegensteht — in der Regel spätestens nach zwei Jahren.'),
        h3('Spam-Schutz (Cloudflare Turnstile)'),
        p('Die Formulare sind durch **Turnstile** geschützt, einen Dienst der **Cloudflare, Inc.**, 101 Townsend St., San Francisco, CA 94107, USA. Er prüft, ob das Formular von einem Menschen und nicht von einem Bot ausgefüllt wird. Dabei werden Ihre IP-Adresse und Angaben zu Ihrem Browser an Cloudflare übermittelt und kurzzeitig ein Eintrag auf Ihrem Gerät gespeichert. Turnstile kommt ohne Tracking-Cookies aus und wird nicht für Werbung verwendet.'),
        p('Rechtsgrundlage: **Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse am Schutz unserer Formulare vor automatisiertem Missbrauch). Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert; ergänzend bestehen Standardvertragsklauseln. Datenschutz: [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/)'),
        h3('E-Mail-Versand'),
        p('Nachrichten aus den Formularen und unsere Antworten laufen über **Microsoft 365** (Microsoft Ireland Operations Ltd., Dublin). Ein Auftragsverarbeitungsvertrag besteht. Datenschutz: [privacy.microsoft.com](https://privacy.microsoft.com/de-de/privacystatement)'),
      ],
    },
    {
      heading: '7. Eingebundene Videos (YouTube)',
      body: [
        p('Unsere Übertragungen laufen über YouTube, betrieben von **Google Ireland Limited**, Gordon House, Barrow Street, Dublin 4, Irland.'),
        ul(
          'Auf unserer **Live**-Seite ist der YouTube-Livechat unmittelbar eingebunden; der Stream selbst startet erst, wenn Sie auf Wiedergabe klicken. Beim Öffnen dieser Seite wird eine Verbindung zu YouTube aufgebaut, Ihre IP-Adresse übermittelt, und Google kann Cookies setzen und vorhandene auslesen. Sind Sie bei einem Google-Konto angemeldet, kann der Besuch diesem zugeordnet werden.',
          'Überall sonst — Startseite, Broadcasts, Events, Kalender und in den Artikeln — öffnet sich eine Aufzeichnung erst beim Klick auf Wiedergabe in unserem eigenen Player, und dann im erweiterten Datenschutzmodus (youtube-nocookie.com). Die Vorschaubilder liefert unser eigener Server; vor dem Start eines Videos entsteht also keine Verbindung zu Google, und es werden keine Cookies gesetzt.',
        ),
        p('Rechtsgrundlage: **Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse daran, unsere Produktionen auf der Seite zu zeigen). Google verarbeitet Daten auch in den USA auf Grundlage des EU-US Data Privacy Framework und von Standardvertragsklauseln. Was Google mit den Daten tut, entzieht sich unserem Einfluss; siehe [policies.google.com/privacy](https://policies.google.com/privacy).'),
        p('Wenn Sie das vermeiden möchten, rufen Sie die Live-Seite nicht auf oder nutzen Sie einen Browser, der Inhalte Dritter blockiert.'),
      ],
    },
    {
      heading: '8. Soziale Netzwerke',
      body: [
        p('Die Symbole in unserer Fußzeile sind **einfache Links** zu unseren Profilen bei YouTube, Twitch, Instagram, TikTok, Facebook und X. Sie enthalten keine Plug-ins, Zählpixel oder eingebetteten Inhalte; es werden also erst Daten übertragen, wenn Sie darauf klicken. Ab dann gilt die Datenschutzerklärung des jeweiligen Netzwerks.'),
        p('Wir unterhalten dort auch Profile. Die Betreiber verarbeiten Ihre Daten in eigener Verantwortung; bei Facebook- und Instagram-Seiten besteht insoweit eine gemeinsame Verantwortlichkeit nach Art. 26 DSGVO, beschränkt auf die Seitenstatistiken, die wir erhalten.'),
      ],
    },
    {
      heading: '9. Schriften und weitere Dateien',
      body: [
        p('Sämtliche Schriften, Bilder und Skripte werden von unserem eigenen Server ausgeliefert. Die Schriftarten Inter und Oswald werden beim Erstellen der Seite heruntergeladen und selbst gehostet — **beim Besuch geht also keine Anfrage an Google**. Ein Content Delivery Network setzen wir für die Seite selbst nicht ein.'),
      ],
    },
    {
      heading: '10. Rechtsgrundlagen im Überblick',
      body: [
        ul(
          '**Art. 6 Abs. 1 lit. b DSGVO** — Anfragen, die einen Vertrag oder dessen Anbahnung betreffen',
          '**Art. 6 Abs. 1 lit. c DSGVO** — gesetzliche Aufbewahrungspflichten',
          '**Art. 6 Abs. 1 lit. f DSGVO** — sicherer Betrieb der Seite, Server-Logs, cookielose Statistik, Spam-Schutz, Video-Einbindung, Sprachauswahl',
        ),
        p('Auf eine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) stützen wir uns auf dieser Website an keiner Stelle, weil hier nichts einwilligungsbedürftig ist.'),
      ],
    },
    {
      heading: '11. Speicherdauer',
      body: [
        ul(
          'Server-Logfiles: sieben Tage, länger nur bei einem konkreten Vorfall',
          'Statistik: aggregierte Werte ohne Personenbezug, eine Löschfrist entfällt',
          'Anfragen über die Kontaktformulare: bis zur Erledigung, in der Regel nicht länger als zwei Jahre',
          'Handels- und steuerrechtlich relevante Korrespondenz: sechs bzw. zehn Jahre (§ 257 HGB, § 147 AO)',
          'Sprach-Cookie: ein Jahr, jederzeit von Ihnen löschbar',
        ),
      ],
    },
    {
      heading: '12. Internationale Datenübermittlung',
      body: [
        p('Unsere eigene Infrastruktur steht ausschließlich in Deutschland. In die USA gelangen Daten nur in zwei Fällen: **Cloudflare** (Spam-Schutz der Formulare) und **Google/YouTube** (Video-Einbindung). Beide Anbieter sind nach dem **EU-US Data Privacy Framework** zertifiziert; ergänzend gelten Standardvertragsklauseln nach Art. 46 DSGVO.'),
        p('Weitere Informationen: [dataprivacyframework.gov](https://www.dataprivacyframework.gov/)'),
      ],
    },
    {
      heading: '13. Ihre Rechte',
      body: [
        p('Nach der DSGVO haben Sie das Recht,'),
        ul(
          'Auskunft über die zu Ihnen gespeicherten Daten zu verlangen (Art. 15)',
          'unrichtige Daten berichtigen zu lassen (Art. 16)',
          'Ihre Daten löschen zu lassen (Art. 17)',
          'die Verarbeitung einschränken zu lassen (Art. 18)',
          'Ihre Daten in einem übertragbaren Format zu erhalten (Art. 20)',
          '**der Verarbeitung auf Grundlage berechtigter Interessen zu widersprechen (Art. 21)** — das betrifft die in den Abschnitten 3, 6 und 7 beschriebenen Vorgänge',
        ),
        p('Für die Ausübung genügt eine E-Mail an [contact@racespot.tv](mailto:contact@racespot.tv).'),
        p('Außerdem steht Ihnen ein Beschwerderecht bei einer Aufsichtsbehörde zu (Art. 77 DSGVO). Für uns zuständig ist die **Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen**, Kavalleriestr. 2–4, 40213 Düsseldorf — [ldi.nrw.de](https://www.ldi.nrw.de/)'),
      ],
    },
    {
      heading: '14. Sicherheit',
      body: [
        p('Die gesamte Seite wird über HTTPS mit gültigem Zertifikat ausgeliefert; HSTS sowie Content-Type-, Frame- und Referrer-Richtlinien sind gesetzt. Der Zugriff auf den Server ist auf einen kleinen Kreis von Administratoren beschränkt und über Schlüsselauthentifizierung sowie Zwei-Faktor-Authentifizierung abgesichert. Sicherungen werden täglich erstellt.'),
      ],
    },
    {
      heading: '15. Änderungen dieser Erklärung',
      body: [
        p('Wir passen diese Erklärung an, wenn sich die Seite ändert. Das Datum oben zeigt den aktuellen Stand.'),
      ],
    },
  ],
}

export const PRIVACY: Record<LegalLang, LegalDoc> = { en, de }
