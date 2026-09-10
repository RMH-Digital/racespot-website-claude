import { p, h3, ul, type LegalDoc, type LegalLang } from './types'

/**
 * Privacy policy, one document per language.
 *
 * The English text is the one that was on the site before i18n (dated April
 * 20, 2024; its content is under review — docs/TODO.md item 4). The German
 * version follows it sentence by sentence.
 *
 * REVIEW: de is an unapproved translation (2026-09-10). Only en and de exist
 * by decision — see ./types.ts.
 */


const en: LegalDoc = {
  updated: 'Last updated: April 20, 2024',
  sections: [
    {
      heading: '1. Data Controller',
      body: [
        p('Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Deutschland'),
        p('Email: [contact@racespot.tv](mailto:contact@racespot.tv) · Phone: +49 (0)163 686 7887'),
      ],
    },
    {
      heading: '2. Categories of Data Collected',
      body: [
        p('We may collect and process the following categories of personal data:'),
        ul(
          'Inventory data (names, addresses)',
          'Contact data (email addresses, telephone numbers)',
          'Content data (entries in online forms)',
          'Usage data (websites visited, content interests, access times)',
          'Meta/communication data (device information, IP addresses)',
          'Location data (geographical position of the device)',
          'Contract data (contract subject, terms, customer classification)',
          'Payment data (bank details, invoices, payment history)',
        ),
        h3('Data Subject Categories'),
        ul(
          'Business and contractual partners',
          'Interested parties',
          'Communication partners',
          'Customers',
          'Website users and online service users',
        ),
      ],
    },
    {
      heading: '3. Purposes of Processing',
      body: [
        ul(
          'Provision and improvement of our online services and user experience',
          'Credit assessment and creditworthiness evaluation',
          'Contractual service delivery and customer support',
          'Contact management and communication',
          'Administrative and organisational procedures',
          'Interest-based and behavioural marketing',
          'Direct marketing (email, postal)',
          'Conversion measurement and range measurement',
          'Remarketing and target audience determination',
          'Cross-device tracking for marketing purposes',
          'User profiling',
          'Visit action evaluation',
          'Security measures',
        ),
      ],
    },
    {
      heading: '4. Legal Basis for Processing',
      body: [
        p('We process personal data based on the following legal grounds under the GDPR:'),
        ul(
          '**Art. 6(1)(a) GDPR** — User consent for specific purposes',
          '**Art. 6(1)(b) GDPR** — Processing necessary for contract performance or pre-contractual requests',
          '**Art. 6(1)(c) GDPR** — Compliance with legal obligations',
          '**Art. 6(1)(f) GDPR** — Legitimate interests of our organisation',
        ),
      ],
    },
    {
      heading: '5. Cookies',
      body: [
        p('Our website uses cookies — small text files stored on your device. We distinguish between:'),
        ul(
          '**Session cookies** — deleted when you close your browser',
          '**Persistent cookies** — stored for up to 2 years for functionality and marketing',
        ),
        p('Consent is obtained prior to use except where legally unnecessary. Our cookie consent procedure stores your opt-in status for up to 2 years. IP masking and pseudonymisation are employed where applicable.'),
        p('You can manage cookie preferences in your browser settings or via the following opt-out pages:'),
        ul(
          '[youronlinechoices.com](https://www.youronlinechoices.com/)',
          '[optout.aboutads.info](https://optout.aboutads.info/)',
        ),
      ],
    },
    {
      heading: '6. Third-Party Services',
      body: [
        h3('Payment Processing'),
        ul(
          '**PayPal (Europe) S.à r.l.** — Payment solutions. Privacy: [paypal.com/privacy](https://www.paypal.com/de/webapps/mpp/ua/privacy-full)',
          '**Stripe Payments Europe, Limited** — Payment services. Privacy: [stripe.com/privacy](https://www.stripe.com/privacy)',
        ),
        h3('Email & Newsletter'),
        ul(
          '**CleverReach GmbH & Co. KG** — Email marketing platform. Privacy: [cleverreach.com/datenschutz](https://www.cleverreach.com/de/datenschutz/)',
          '**Mailchimp (Rocket Science Group, LLC)** — Email dispatch. Privacy: [mailchimp.com/legal](https://mailchimp.com/legal/). Transfer basis: Data Privacy Framework, standard contractual clauses.',
          '**Help Scout Inc.** — Contact management. Privacy: [helpscout.net/privacy](https://www.helpscout.net/company/legal/privacy/)',
        ),
        h3('Web Analytics'),
        ul(
          '**Google Analytics** (Google Ireland Limited, Dublin) — Usage analysis with pseudonymous user identification and IP masking. Transfer basis: Data Privacy Framework, standard contractual clauses. Opt-out: [tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout?hl=de)',
          '**Google Tag Manager** (Google Ireland Limited) — Website tag management. Privacy: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**etracker GmbH** — Reach measurement. Privacy: [etracker.com/datenschutz](https://www.etracker.com/datenschutz/)',
          '**Matomo** — Privacy-focused analytics (with or without cookies). Cookie retention: max. 13 months. Website: [matomo.org](https://matomo.org/)',
        ),
        h3('Online Marketing & Advertising'),
        ul(
          '**Facebook Pixel / Custom Audiences** (Meta Platforms Ireland Limited) — Used to determine visitors as a target group for ads displayed only to users showing interest. Transfer basis: Data Privacy Framework, standard contractual clauses. Privacy: [facebook.com/about/privacy](https://www.facebook.com/about/privacy)',
          '**Google Ad Manager** (Google Ireland Limited). Privacy: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**Google Ads & Conversion Measurement** (Google Ireland Limited). Transfer basis: Data Privacy Framework, standard contractual clauses.',
        ),
        h3('Social Media Presence'),
        ul(
          '**Instagram** (Meta Platforms Ireland Limited). Privacy: [instagram.com/legal/privacy](https://instagram.com/about/legal/privacy)',
          '**Facebook Pages** (Meta Platforms Ireland Limited) — Joint responsibility agreement applies. Details: [Page Controller Addendum](https://www.facebook.com/legal/terms/page_controller_addendum)',
        ),
      ],
    },
    {
      heading: '7. Newsletter',
      body: [
        p('Newsletter subscriptions require double opt-in confirmation. We log the IP address and confirmation time for proof of consent. We use web beacons to track open rates and link clicks for performance analysis based on legitimate interests. Every newsletter contains an unsubscribe link.'),
      ],
    },
    {
      heading: '8. Customer Accounts',
      body: [
        p('IP addresses and access times are logged at registration for proof of consent. Users are responsible for data backup upon account termination. Customer accounts are not indexed by search engines.'),
      ],
    },
    {
      heading: '9. Data Retention',
      body: [
        ul(
          'Customer accounts: retained per legal archiving requirements (typically 10 years for tax)',
          'General commercial data: 4 years after contract expiration',
          'Newsletter unsubscribes: up to 3 years (legitimate interest in defence)',
          'Server log files: retained for security and stability purposes',
          'Cookies: generally up to 2 years unless specified otherwise',
          'Matomo cookies: maximum 13 months',
        ),
      ],
    },
    {
      heading: '10. Your Rights',
      body: [
        p('Under the GDPR (Articles 15–22), you have the right to:'),
        ul(
          'Access your personal data',
          'Correct inaccurate data',
          'Request deletion of your data ("right to be forgotten")',
          'Restrict processing',
          'Data portability',
          'Object to processing',
          'Rights related to automated decision-making',
          'Withdraw consent at any time',
        ),
        p('To exercise these rights, contact us at [contact@racespot.tv](mailto:contact@racespot.tv).'),
      ],
    },
    {
      heading: '11. International Data Transfers',
      body: [
        p('Where data is transferred outside the EU/EEA, we ensure appropriate safeguards in accordance with GDPR Articles 44–49 through:'),
        ul(
          'Standard contractual clauses (SCCs)',
          'Data Privacy Framework (DPF) certification for US companies',
          'EU Commission adequacy decisions',
          'Explicit user consent where required',
        ),
        p('More information: [dataprivacyframework.gov](https://www.dataprivacyframework.gov/)'),
      ],
    },
    {
      heading: '12. Security Measures',
      body: [
        ul(
          'SSL/HTTPS encryption for data transmission',
          'Physical and electronic access controls',
          'Confidentiality, integrity, and availability safeguards',
          'Data protection by design and default principles',
          'Procedures for breach response and user rights exercise',
        ),
      ],
    },
    {
      heading: '13. Changes to This Policy',
      body: [
        p('We may update this privacy policy from time to time. Material changes will be communicated to affected users.'),
      ],
    },
  ],
}

const de: LegalDoc = {
  updated: 'Stand: 20. April 2024',
  sections: [
    {
      heading: '1. Verantwortlicher',
      body: [
        p('Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Deutschland'),
        p('E-Mail: [contact@racespot.tv](mailto:contact@racespot.tv) · Telefon: +49 (0)163 686 7887'),
      ],
    },
    {
      heading: '2. Kategorien verarbeiteter Daten',
      body: [
        p('Wir können folgende Kategorien personenbezogener Daten erheben und verarbeiten:'),
        ul(
          'Bestandsdaten (Namen, Adressen)',
          'Kontaktdaten (E-Mail-Adressen, Telefonnummern)',
          'Inhaltsdaten (Eingaben in Onlineformularen)',
          'Nutzungsdaten (besuchte Webseiten, Interesse an Inhalten, Zugriffszeiten)',
          'Meta-/Kommunikationsdaten (Geräteinformationen, IP-Adressen)',
          'Standortdaten (geografische Position des Geräts)',
          'Vertragsdaten (Vertragsgegenstand, Laufzeit, Kundenkategorie)',
          'Zahlungsdaten (Bankverbindungen, Rechnungen, Zahlungshistorie)',
        ),
        h3('Kategorien betroffener Personen'),
        ul(
          'Geschäfts- und Vertragspartner',
          'Interessenten',
          'Kommunikationspartner',
          'Kunden',
          'Nutzer der Website und der Onlinedienste',
        ),
      ],
    },
    {
      heading: '3. Zwecke der Verarbeitung',
      body: [
        ul(
          'Bereitstellung und Verbesserung unserer Onlinedienste und der Nutzererfahrung',
          'Bonitätsprüfung und Bewertung der Kreditwürdigkeit',
          'Erbringung vertraglicher Leistungen und Kundenservice',
          'Kontaktverwaltung und Kommunikation',
          'Verwaltungs- und Organisationsverfahren',
          'Interessenbasiertes und verhaltensbezogenes Marketing',
          'Direktmarketing (E-Mail, Post)',
          'Konversionsmessung und Reichweitenmessung',
          'Remarketing und Zielgruppenbildung',
          'Geräteübergreifendes Tracking zu Marketingzwecken',
          'Profilbildung',
          'Auswertung von Besuchsaktionen',
          'Sicherheitsmaßnahmen',
        ),
      ],
    },
    {
      heading: '4. Rechtsgrundlagen der Verarbeitung',
      body: [
        p('Wir verarbeiten personenbezogene Daten auf folgenden Rechtsgrundlagen der DSGVO:'),
        ul(
          '**Art. 6 Abs. 1 lit. a DSGVO** — Einwilligung der Nutzer für bestimmte Zwecke',
          '**Art. 6 Abs. 1 lit. b DSGVO** — Verarbeitung zur Vertragserfüllung oder für vorvertragliche Anfragen',
          '**Art. 6 Abs. 1 lit. c DSGVO** — Erfüllung rechtlicher Verpflichtungen',
          '**Art. 6 Abs. 1 lit. f DSGVO** — Berechtigte Interessen unseres Unternehmens',
        ),
      ],
    },
    {
      heading: '5. Cookies',
      body: [
        p('Unsere Website verwendet Cookies — kleine Textdateien, die auf Ihrem Gerät gespeichert werden. Wir unterscheiden:'),
        ul(
          '**Sitzungs-Cookies** — werden gelöscht, wenn Sie den Browser schließen',
          '**Dauerhafte Cookies** — werden bis zu 2 Jahre für Funktions- und Marketingzwecke gespeichert',
        ),
        p('Eine Einwilligung wird vor der Verwendung eingeholt, soweit sie rechtlich erforderlich ist. Unser Einwilligungsverfahren speichert Ihren Opt-in-Status bis zu 2 Jahre. IP-Maskierung und Pseudonymisierung werden eingesetzt, wo anwendbar.'),
        p('Sie können Cookie-Einstellungen in Ihrem Browser verwalten oder über folgende Opt-out-Seiten:'),
        ul(
          '[youronlinechoices.com](https://www.youronlinechoices.com/)',
          '[optout.aboutads.info](https://optout.aboutads.info/)',
        ),
      ],
    },
    {
      heading: '6. Dienste Dritter',
      body: [
        h3('Zahlungsabwicklung'),
        ul(
          '**PayPal (Europe) S.à r.l.** — Zahlungslösungen. Datenschutz: [paypal.com/privacy](https://www.paypal.com/de/webapps/mpp/ua/privacy-full)',
          '**Stripe Payments Europe, Limited** — Zahlungsdienste. Datenschutz: [stripe.com/privacy](https://www.stripe.com/privacy)',
        ),
        h3('E-Mail & Newsletter'),
        ul(
          '**CleverReach GmbH & Co. KG** — E-Mail-Marketing-Plattform. Datenschutz: [cleverreach.com/datenschutz](https://www.cleverreach.com/de/datenschutz/)',
          '**Mailchimp (Rocket Science Group, LLC)** — E-Mail-Versand. Datenschutz: [mailchimp.com/legal](https://mailchimp.com/legal/). Übermittlungsgrundlage: Data Privacy Framework, Standardvertragsklauseln.',
          '**Help Scout Inc.** — Kontaktverwaltung. Datenschutz: [helpscout.net/privacy](https://www.helpscout.net/company/legal/privacy/)',
        ),
        h3('Webanalyse'),
        ul(
          '**Google Analytics** (Google Ireland Limited, Dublin) — Nutzungsanalyse mit pseudonymer Nutzererkennung und IP-Maskierung. Übermittlungsgrundlage: Data Privacy Framework, Standardvertragsklauseln. Opt-out: [tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout?hl=de)',
          '**Google Tag Manager** (Google Ireland Limited) — Verwaltung von Website-Tags. Datenschutz: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**etracker GmbH** — Reichweitenmessung. Datenschutz: [etracker.com/datenschutz](https://www.etracker.com/datenschutz/)',
          '**Matomo** — Datenschutzfreundliche Analyse (mit oder ohne Cookies). Cookie-Speicherdauer: max. 13 Monate. Website: [matomo.org](https://matomo.org/)',
        ),
        h3('Onlinemarketing & Werbung'),
        ul(
          '**Facebook Pixel / Custom Audiences** (Meta Platforms Ireland Limited) — Dient dazu, Besucher als Zielgruppe für Anzeigen zu bestimmen, die nur interessierten Nutzern angezeigt werden. Übermittlungsgrundlage: Data Privacy Framework, Standardvertragsklauseln. Datenschutz: [facebook.com/about/privacy](https://www.facebook.com/about/privacy)',
          '**Google Ad Manager** (Google Ireland Limited). Datenschutz: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**Google Ads & Conversion-Messung** (Google Ireland Limited). Übermittlungsgrundlage: Data Privacy Framework, Standardvertragsklauseln.',
        ),
        h3('Präsenz in sozialen Medien'),
        ul(
          '**Instagram** (Meta Platforms Ireland Limited). Datenschutz: [instagram.com/legal/privacy](https://instagram.com/about/legal/privacy)',
          '**Facebook-Seiten** (Meta Platforms Ireland Limited) — Es gilt die Vereinbarung über gemeinsame Verantwortlichkeit. Details: [Page Controller Addendum](https://www.facebook.com/legal/terms/page_controller_addendum)',
        ),
      ],
    },
    {
      heading: '7. Newsletter',
      body: [
        p('Newsletter-Anmeldungen erfordern eine Bestätigung im Double-Opt-in-Verfahren. Wir protokollieren IP-Adresse und Bestätigungszeitpunkt als Nachweis der Einwilligung. Wir verwenden Web-Beacons, um Öffnungsraten und Link-Klicks zur Erfolgsmessung auf Grundlage berechtigter Interessen zu erfassen. Jeder Newsletter enthält einen Abmeldelink.'),
      ],
    },
    {
      heading: '8. Kundenkonten',
      body: [
        p('Bei der Registrierung werden IP-Adresse und Zugriffszeit als Nachweis der Einwilligung protokolliert. Nutzer sind bei Kündigung des Kontos für die Sicherung ihrer Daten selbst verantwortlich. Kundenkonten werden nicht von Suchmaschinen indexiert.'),
      ],
    },
    {
      heading: '9. Speicherdauer',
      body: [
        ul(
          'Kundenkonten: Aufbewahrung gemäß gesetzlichen Archivierungspflichten (steuerrechtlich in der Regel 10 Jahre)',
          'Allgemeine Geschäftsdaten: 4 Jahre nach Vertragsende',
          'Newsletter-Abmeldungen: bis zu 3 Jahre (berechtigtes Interesse an der Verteidigung)',
          'Server-Logdateien: Aufbewahrung aus Sicherheits- und Stabilitätsgründen',
          'Cookies: in der Regel bis zu 2 Jahre, sofern nicht anders angegeben',
          'Matomo-Cookies: maximal 13 Monate',
        ),
      ],
    },
    {
      heading: '10. Ihre Rechte',
      body: [
        p('Nach der DSGVO (Art. 15–22) haben Sie das Recht auf:'),
        ul(
          'Auskunft über Ihre personenbezogenen Daten',
          'Berichtigung unrichtiger Daten',
          'Löschung Ihrer Daten („Recht auf Vergessenwerden")',
          'Einschränkung der Verarbeitung',
          'Datenübertragbarkeit',
          'Widerspruch gegen die Verarbeitung',
          'Rechte im Zusammenhang mit automatisierten Entscheidungen',
          'Widerruf einer Einwilligung jederzeit',
        ),
        p('Zur Ausübung dieser Rechte wenden Sie sich an [contact@racespot.tv](mailto:contact@racespot.tv).'),
      ],
    },
    {
      heading: '11. Internationale Datenübermittlung',
      body: [
        p('Werden Daten außerhalb der EU/des EWR übermittelt, stellen wir geeignete Garantien gemäß Art. 44–49 DSGVO sicher durch:'),
        ul(
          'Standardvertragsklauseln (SCCs)',
          'Zertifizierung nach dem Data Privacy Framework (DPF) für US-Unternehmen',
          'Angemessenheitsbeschlüsse der EU-Kommission',
          'Ausdrückliche Einwilligung der Nutzer, wo erforderlich',
        ),
        p('Weitere Informationen: [dataprivacyframework.gov](https://www.dataprivacyframework.gov/)'),
      ],
    },
    {
      heading: '12. Sicherheitsmaßnahmen',
      body: [
        ul(
          'SSL/HTTPS-Verschlüsselung der Datenübertragung',
          'Physische und elektronische Zugangskontrollen',
          'Schutz von Vertraulichkeit, Integrität und Verfügbarkeit',
          'Datenschutz durch Technikgestaltung und datenschutzfreundliche Voreinstellungen',
          'Verfahren zur Reaktion auf Datenpannen und zur Wahrnehmung von Betroffenenrechten',
        ),
      ],
    },
    {
      heading: '13. Änderungen dieser Erklärung',
      body: [
        p('Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Wesentliche Änderungen werden den betroffenen Nutzern mitgeteilt.'),
      ],
    },
  ],
}

export const PRIVACY: Record<LegalLang, LegalDoc> = { en, de }
