import type { Lang } from '../langs'
import { p, h3, ul, type LegalDoc } from './types'

/**
 * Privacy policy, one document per language.
 *
 * The English text is the one that was on the site before i18n (dated April
 * 20, 2024; its content is under review — docs/TODO.md item 4). The five
 * translations below follow it sentence by sentence.
 *
 * REVIEW: de/es/pt/fr/it are unapproved translations (2026-09-10).
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

const es: LegalDoc = {
  updated: 'Última actualización: 20 de abril de 2024',
  sections: [
    {
      heading: '1. Responsable del tratamiento',
      body: [
        p('Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Alemania'),
        p('Correo electrónico: [contact@racespot.tv](mailto:contact@racespot.tv) · Teléfono: +49 (0)163 686 7887'),
      ],
    },
    {
      heading: '2. Categorías de datos recopilados',
      body: [
        p('Podemos recopilar y tratar las siguientes categorías de datos personales:'),
        ul(
          'Datos de inventario (nombres, direcciones)',
          'Datos de contacto (direcciones de correo electrónico, números de teléfono)',
          'Datos de contenido (entradas en formularios en línea)',
          'Datos de uso (sitios web visitados, intereses en contenidos, horas de acceso)',
          'Metadatos y datos de comunicación (información del dispositivo, direcciones IP)',
          'Datos de ubicación (posición geográfica del dispositivo)',
          'Datos contractuales (objeto del contrato, condiciones, clasificación del cliente)',
          'Datos de pago (datos bancarios, facturas, historial de pagos)',
        ),
        h3('Categorías de interesados'),
        ul(
          'Socios comerciales y contractuales',
          'Personas interesadas',
          'Interlocutores de comunicación',
          'Clientes',
          'Usuarios del sitio web y de los servicios en línea',
        ),
      ],
    },
    {
      heading: '3. Fines del tratamiento',
      body: [
        ul(
          'Prestación y mejora de nuestros servicios en línea y de la experiencia de usuario',
          'Evaluación crediticia y de solvencia',
          'Prestación de servicios contractuales y atención al cliente',
          'Gestión de contactos y comunicación',
          'Procedimientos administrativos y organizativos',
          'Marketing basado en intereses y en el comportamiento',
          'Marketing directo (correo electrónico, postal)',
          'Medición de conversiones y de alcance',
          'Remarketing y definición de públicos objetivo',
          'Seguimiento entre dispositivos con fines de marketing',
          'Elaboración de perfiles de usuario',
          'Evaluación de acciones de visita',
          'Medidas de seguridad',
        ),
      ],
    },
    {
      heading: '4. Base jurídica del tratamiento',
      body: [
        p('Tratamos los datos personales sobre las siguientes bases jurídicas del RGPD:'),
        ul(
          '**Art. 6(1)(a) RGPD** — Consentimiento del usuario para fines específicos',
          '**Art. 6(1)(b) RGPD** — Tratamiento necesario para la ejecución de un contrato o para solicitudes precontractuales',
          '**Art. 6(1)(c) RGPD** — Cumplimiento de obligaciones legales',
          '**Art. 6(1)(f) RGPD** — Intereses legítimos de nuestra organización',
        ),
      ],
    },
    {
      heading: '5. Cookies',
      body: [
        p('Nuestro sitio web utiliza cookies, pequeños archivos de texto que se almacenan en su dispositivo. Distinguimos entre:'),
        ul(
          '**Cookies de sesión** — se eliminan al cerrar el navegador',
          '**Cookies persistentes** — se almacenan hasta 2 años con fines funcionales y de marketing',
        ),
        p('El consentimiento se obtiene antes del uso, salvo cuando no sea legalmente necesario. Nuestro procedimiento de consentimiento de cookies almacena su estado de aceptación hasta 2 años. Se aplican el enmascaramiento de IP y la seudonimización cuando corresponde.'),
        p('Puede gestionar sus preferencias de cookies en la configuración de su navegador o a través de las siguientes páginas de exclusión:'),
        ul(
          '[youronlinechoices.com](https://www.youronlinechoices.com/)',
          '[optout.aboutads.info](https://optout.aboutads.info/)',
        ),
      ],
    },
    {
      heading: '6. Servicios de terceros',
      body: [
        h3('Procesamiento de pagos'),
        ul(
          '**PayPal (Europe) S.à r.l.** — Soluciones de pago. Privacidad: [paypal.com/privacy](https://www.paypal.com/de/webapps/mpp/ua/privacy-full)',
          '**Stripe Payments Europe, Limited** — Servicios de pago. Privacidad: [stripe.com/privacy](https://www.stripe.com/privacy)',
        ),
        h3('Correo electrónico y boletín'),
        ul(
          '**CleverReach GmbH & Co. KG** — Plataforma de marketing por correo electrónico. Privacidad: [cleverreach.com/datenschutz](https://www.cleverreach.com/de/datenschutz/)',
          '**Mailchimp (Rocket Science Group, LLC)** — Envío de correos electrónicos. Privacidad: [mailchimp.com/legal](https://mailchimp.com/legal/). Base de transferencia: Data Privacy Framework, cláusulas contractuales tipo.',
          '**Help Scout Inc.** — Gestión de contactos. Privacidad: [helpscout.net/privacy](https://www.helpscout.net/company/legal/privacy/)',
        ),
        h3('Analítica web'),
        ul(
          '**Google Analytics** (Google Ireland Limited, Dublín) — Análisis de uso con identificación seudónima de usuarios y enmascaramiento de IP. Base de transferencia: Data Privacy Framework, cláusulas contractuales tipo. Exclusión: [tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout?hl=de)',
          '**Google Tag Manager** (Google Ireland Limited) — Gestión de etiquetas del sitio web. Privacidad: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**etracker GmbH** — Medición de alcance. Privacidad: [etracker.com/datenschutz](https://www.etracker.com/datenschutz/)',
          '**Matomo** — Analítica respetuosa con la privacidad (con o sin cookies). Conservación de cookies: máx. 13 meses. Sitio web: [matomo.org](https://matomo.org/)',
        ),
        h3('Marketing y publicidad en línea'),
        ul(
          '**Facebook Pixel / Custom Audiences** (Meta Platforms Ireland Limited) — Se utiliza para definir a los visitantes como público objetivo de anuncios que solo se muestran a usuarios que han mostrado interés. Base de transferencia: Data Privacy Framework, cláusulas contractuales tipo. Privacidad: [facebook.com/about/privacy](https://www.facebook.com/about/privacy)',
          '**Google Ad Manager** (Google Ireland Limited). Privacidad: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**Google Ads y medición de conversiones** (Google Ireland Limited). Base de transferencia: Data Privacy Framework, cláusulas contractuales tipo.',
        ),
        h3('Presencia en redes sociales'),
        ul(
          '**Instagram** (Meta Platforms Ireland Limited). Privacidad: [instagram.com/legal/privacy](https://instagram.com/about/legal/privacy)',
          '**Páginas de Facebook** (Meta Platforms Ireland Limited) — Se aplica el acuerdo de corresponsabilidad. Detalles: [Page Controller Addendum](https://www.facebook.com/legal/terms/page_controller_addendum)',
        ),
      ],
    },
    {
      heading: '7. Boletín',
      body: [
        p('La suscripción al boletín requiere confirmación mediante doble opt-in. Registramos la dirección IP y la hora de confirmación como prueba del consentimiento. Utilizamos balizas web para medir las tasas de apertura y los clics en enlaces con fines de análisis de rendimiento, sobre la base de intereses legítimos. Cada boletín contiene un enlace para darse de baja.'),
      ],
    },
    {
      heading: '8. Cuentas de cliente',
      body: [
        p('En el registro se guardan la dirección IP y la hora de acceso como prueba del consentimiento. Los usuarios son responsables de hacer una copia de seguridad de sus datos al cancelar la cuenta. Las cuentas de cliente no son indexadas por los motores de búsqueda.'),
      ],
    },
    {
      heading: '9. Conservación de datos',
      body: [
        ul(
          'Cuentas de cliente: se conservan según los requisitos legales de archivo (normalmente 10 años a efectos fiscales)',
          'Datos comerciales generales: 4 años tras la finalización del contrato',
          'Bajas del boletín: hasta 3 años (interés legítimo en la defensa)',
          'Archivos de registro del servidor: se conservan por motivos de seguridad y estabilidad',
          'Cookies: por lo general hasta 2 años, salvo que se indique otra cosa',
          'Cookies de Matomo: máximo 13 meses',
        ),
      ],
    },
    {
      heading: '10. Sus derechos',
      body: [
        p('En virtud del RGPD (artículos 15 a 22), usted tiene derecho a:'),
        ul(
          'Acceder a sus datos personales',
          'Rectificar datos inexactos',
          'Solicitar la supresión de sus datos («derecho al olvido»)',
          'Limitar el tratamiento',
          'La portabilidad de los datos',
          'Oponerse al tratamiento',
          'Derechos relacionados con las decisiones automatizadas',
          'Retirar el consentimiento en cualquier momento',
        ),
        p('Para ejercer estos derechos, escríbanos a [contact@racespot.tv](mailto:contact@racespot.tv).'),
      ],
    },
    {
      heading: '11. Transferencias internacionales de datos',
      body: [
        p('Cuando los datos se transfieren fuera de la UE/EEE, garantizamos las salvaguardias adecuadas conforme a los artículos 44 a 49 del RGPD mediante:'),
        ul(
          'Cláusulas contractuales tipo (SCC)',
          'Certificación Data Privacy Framework (DPF) para empresas estadounidenses',
          'Decisiones de adecuación de la Comisión Europea',
          'Consentimiento expreso del usuario cuando sea necesario',
        ),
        p('Más información: [dataprivacyframework.gov](https://www.dataprivacyframework.gov/)'),
      ],
    },
    {
      heading: '12. Medidas de seguridad',
      body: [
        ul(
          'Cifrado SSL/HTTPS para la transmisión de datos',
          'Controles de acceso físicos y electrónicos',
          'Garantías de confidencialidad, integridad y disponibilidad',
          'Principios de protección de datos desde el diseño y por defecto',
          'Procedimientos de respuesta ante brechas y para el ejercicio de los derechos de los usuarios',
        ),
      ],
    },
    {
      heading: '13. Cambios en esta política',
      body: [
        p('Podemos actualizar esta política de privacidad ocasionalmente. Los cambios sustanciales se comunicarán a los usuarios afectados.'),
      ],
    },
  ],
}

const pt: LegalDoc = {
  updated: 'Última atualização: 20 de abril de 2024',
  sections: [
    {
      heading: '1. Controlador dos dados',
      body: [
        p('Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Alemanha'),
        p('E-mail: [contact@racespot.tv](mailto:contact@racespot.tv) · Telefone: +49 (0)163 686 7887'),
      ],
    },
    {
      heading: '2. Categorias de dados coletados',
      body: [
        p('Podemos coletar e tratar as seguintes categorias de dados pessoais:'),
        ul(
          'Dados cadastrais (nomes, endereços)',
          'Dados de contato (endereços de e-mail, números de telefone)',
          'Dados de conteúdo (entradas em formulários on-line)',
          'Dados de uso (sites visitados, interesse em conteúdos, horários de acesso)',
          'Metadados e dados de comunicação (informações do dispositivo, endereços IP)',
          'Dados de localização (posição geográfica do dispositivo)',
          'Dados contratuais (objeto do contrato, condições, classificação do cliente)',
          'Dados de pagamento (dados bancários, faturas, histórico de pagamentos)',
        ),
        h3('Categorias de titulares'),
        ul(
          'Parceiros comerciais e contratuais',
          'Interessados',
          'Interlocutores de comunicação',
          'Clientes',
          'Usuários do site e dos serviços on-line',
        ),
      ],
    },
    {
      heading: '3. Finalidades do tratamento',
      body: [
        ul(
          'Disponibilização e melhoria dos nossos serviços on-line e da experiência do usuário',
          'Avaliação de crédito e de solvência',
          'Prestação de serviços contratuais e atendimento ao cliente',
          'Gestão de contatos e comunicação',
          'Procedimentos administrativos e organizacionais',
          'Marketing baseado em interesses e em comportamento',
          'Marketing direto (e-mail, correio)',
          'Medição de conversões e de alcance',
          'Remarketing e definição de públicos-alvo',
          'Rastreamento entre dispositivos para fins de marketing',
          'Criação de perfis de usuário',
          'Avaliação de ações de visita',
          'Medidas de segurança',
        ),
      ],
    },
    {
      heading: '4. Base legal do tratamento',
      body: [
        p('Tratamos dados pessoais com base nos seguintes fundamentos legais do RGPD:'),
        ul(
          '**Art. 6(1)(a) RGPD** — Consentimento do usuário para finalidades específicas',
          '**Art. 6(1)(b) RGPD** — Tratamento necessário para a execução de um contrato ou para solicitações pré-contratuais',
          '**Art. 6(1)(c) RGPD** — Cumprimento de obrigações legais',
          '**Art. 6(1)(f) RGPD** — Interesses legítimos da nossa organização',
        ),
      ],
    },
    {
      heading: '5. Cookies',
      body: [
        p('Nosso site utiliza cookies — pequenos arquivos de texto armazenados no seu dispositivo. Distinguimos entre:'),
        ul(
          '**Cookies de sessão** — excluídos quando você fecha o navegador',
          '**Cookies persistentes** — armazenados por até 2 anos para fins de funcionalidade e marketing',
        ),
        p('O consentimento é obtido antes do uso, exceto quando não for legalmente necessário. Nosso procedimento de consentimento de cookies armazena seu status de opt-in por até 2 anos. Mascaramento de IP e pseudonimização são aplicados quando cabível.'),
        p('Você pode gerenciar suas preferências de cookies nas configurações do navegador ou pelas seguintes páginas de opt-out:'),
        ul(
          '[youronlinechoices.com](https://www.youronlinechoices.com/)',
          '[optout.aboutads.info](https://optout.aboutads.info/)',
        ),
      ],
    },
    {
      heading: '6. Serviços de terceiros',
      body: [
        h3('Processamento de pagamentos'),
        ul(
          '**PayPal (Europe) S.à r.l.** — Soluções de pagamento. Privacidade: [paypal.com/privacy](https://www.paypal.com/de/webapps/mpp/ua/privacy-full)',
          '**Stripe Payments Europe, Limited** — Serviços de pagamento. Privacidade: [stripe.com/privacy](https://www.stripe.com/privacy)',
        ),
        h3('E-mail e newsletter'),
        ul(
          '**CleverReach GmbH & Co. KG** — Plataforma de e-mail marketing. Privacidade: [cleverreach.com/datenschutz](https://www.cleverreach.com/de/datenschutz/)',
          '**Mailchimp (Rocket Science Group, LLC)** — Envio de e-mails. Privacidade: [mailchimp.com/legal](https://mailchimp.com/legal/). Base da transferência: Data Privacy Framework, cláusulas contratuais-padrão.',
          '**Help Scout Inc.** — Gestão de contatos. Privacidade: [helpscout.net/privacy](https://www.helpscout.net/company/legal/privacy/)',
        ),
        h3('Análise da web'),
        ul(
          '**Google Analytics** (Google Ireland Limited, Dublin) — Análise de uso com identificação pseudônima de usuários e mascaramento de IP. Base da transferência: Data Privacy Framework, cláusulas contratuais-padrão. Opt-out: [tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout?hl=de)',
          '**Google Tag Manager** (Google Ireland Limited) — Gestão de tags do site. Privacidade: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**etracker GmbH** — Medição de alcance. Privacidade: [etracker.com/datenschutz](https://www.etracker.com/datenschutz/)',
          '**Matomo** — Análise com foco em privacidade (com ou sem cookies). Retenção de cookies: máx. 13 meses. Site: [matomo.org](https://matomo.org/)',
        ),
        h3('Marketing e publicidade on-line'),
        ul(
          '**Facebook Pixel / Custom Audiences** (Meta Platforms Ireland Limited) — Usado para definir visitantes como público-alvo de anúncios exibidos apenas a usuários que demonstraram interesse. Base da transferência: Data Privacy Framework, cláusulas contratuais-padrão. Privacidade: [facebook.com/about/privacy](https://www.facebook.com/about/privacy)',
          '**Google Ad Manager** (Google Ireland Limited). Privacidade: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**Google Ads e medição de conversões** (Google Ireland Limited). Base da transferência: Data Privacy Framework, cláusulas contratuais-padrão.',
        ),
        h3('Presença em redes sociais'),
        ul(
          '**Instagram** (Meta Platforms Ireland Limited). Privacidade: [instagram.com/legal/privacy](https://instagram.com/about/legal/privacy)',
          '**Páginas do Facebook** (Meta Platforms Ireland Limited) — Aplica-se o acordo de responsabilidade conjunta. Detalhes: [Page Controller Addendum](https://www.facebook.com/legal/terms/page_controller_addendum)',
        ),
      ],
    },
    {
      heading: '7. Newsletter',
      body: [
        p('A assinatura da newsletter exige confirmação por double opt-in. Registramos o endereço IP e o horário da confirmação como prova do consentimento. Usamos web beacons para medir taxas de abertura e cliques em links para análise de desempenho, com base em interesses legítimos. Toda newsletter contém um link de cancelamento.'),
      ],
    },
    {
      heading: '8. Contas de cliente',
      body: [
        p('No cadastro, o endereço IP e o horário de acesso são registrados como prova do consentimento. Os usuários são responsáveis pelo backup dos seus dados ao encerrar a conta. As contas de cliente não são indexadas por mecanismos de busca.'),
      ],
    },
    {
      heading: '9. Retenção de dados',
      body: [
        ul(
          'Contas de cliente: mantidas conforme as exigências legais de arquivamento (normalmente 10 anos para fins fiscais)',
          'Dados comerciais gerais: 4 anos após o término do contrato',
          'Cancelamentos de newsletter: até 3 anos (interesse legítimo em defesa)',
          'Arquivos de log do servidor: mantidos por motivos de segurança e estabilidade',
          'Cookies: em geral até 2 anos, salvo indicação em contrário',
          'Cookies do Matomo: no máximo 13 meses',
        ),
      ],
    },
    {
      heading: '10. Seus direitos',
      body: [
        p('Nos termos do RGPD (artigos 15 a 22), você tem o direito de:'),
        ul(
          'Acessar seus dados pessoais',
          'Corrigir dados incorretos',
          'Solicitar a exclusão dos seus dados ("direito ao esquecimento")',
          'Limitar o tratamento',
          'Portabilidade dos dados',
          'Opor-se ao tratamento',
          'Direitos relativos a decisões automatizadas',
          'Retirar o consentimento a qualquer momento',
        ),
        p('Para exercer esses direitos, entre em contato pelo e-mail [contact@racespot.tv](mailto:contact@racespot.tv).'),
      ],
    },
    {
      heading: '11. Transferências internacionais de dados',
      body: [
        p('Quando dados são transferidos para fora da UE/EEE, garantimos salvaguardas adequadas conforme os artigos 44 a 49 do RGPD por meio de:'),
        ul(
          'Cláusulas contratuais-padrão (SCCs)',
          'Certificação Data Privacy Framework (DPF) para empresas dos EUA',
          'Decisões de adequação da Comissão Europeia',
          'Consentimento expresso do usuário quando necessário',
        ),
        p('Mais informações: [dataprivacyframework.gov](https://www.dataprivacyframework.gov/)'),
      ],
    },
    {
      heading: '12. Medidas de segurança',
      body: [
        ul(
          'Criptografia SSL/HTTPS na transmissão de dados',
          'Controles de acesso físicos e eletrônicos',
          'Salvaguardas de confidencialidade, integridade e disponibilidade',
          'Princípios de proteção de dados desde a concepção e por padrão',
          'Procedimentos de resposta a incidentes e para o exercício dos direitos dos usuários',
        ),
      ],
    },
    {
      heading: '13. Alterações nesta política',
      body: [
        p('Podemos atualizar esta política de privacidade periodicamente. Alterações relevantes serão comunicadas aos usuários afetados.'),
      ],
    },
  ],
}

const fr: LegalDoc = {
  updated: 'Dernière mise à jour : 20 avril 2024',
  sections: [
    {
      heading: '1. Responsable du traitement',
      body: [
        p('Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Allemagne'),
        p('E-mail : [contact@racespot.tv](mailto:contact@racespot.tv) · Téléphone : +49 (0)163 686 7887'),
      ],
    },
    {
      heading: '2. Catégories de données collectées',
      body: [
        p('Nous pouvons collecter et traiter les catégories de données personnelles suivantes :'),
        ul(
          'Données d’identification (noms, adresses)',
          'Données de contact (adresses e-mail, numéros de téléphone)',
          'Données de contenu (saisies dans les formulaires en ligne)',
          'Données d’utilisation (sites consultés, intérêts pour les contenus, heures d’accès)',
          'Métadonnées et données de communication (informations sur l’appareil, adresses IP)',
          'Données de localisation (position géographique de l’appareil)',
          'Données contractuelles (objet du contrat, conditions, classification du client)',
          'Données de paiement (coordonnées bancaires, factures, historique des paiements)',
        ),
        h3('Catégories de personnes concernées'),
        ul(
          'Partenaires commerciaux et contractuels',
          'Prospects',
          'Interlocuteurs',
          'Clients',
          'Utilisateurs du site web et des services en ligne',
        ),
      ],
    },
    {
      heading: '3. Finalités du traitement',
      body: [
        ul(
          'Fourniture et amélioration de nos services en ligne et de l’expérience utilisateur',
          'Évaluation du crédit et de la solvabilité',
          'Exécution des prestations contractuelles et service client',
          'Gestion des contacts et communication',
          'Procédures administratives et organisationnelles',
          'Marketing basé sur les intérêts et le comportement',
          'Marketing direct (e-mail, courrier)',
          'Mesure des conversions et de l’audience',
          'Remarketing et définition des audiences cibles',
          'Suivi multi-appareils à des fins marketing',
          'Profilage des utilisateurs',
          'Évaluation des actions de visite',
          'Mesures de sécurité',
        ),
      ],
    },
    {
      heading: '4. Base juridique du traitement',
      body: [
        p('Nous traitons les données personnelles sur les bases juridiques suivantes du RGPD :'),
        ul(
          '**Art. 6(1)(a) RGPD** — Consentement de l’utilisateur pour des finalités précises',
          '**Art. 6(1)(b) RGPD** — Traitement nécessaire à l’exécution d’un contrat ou à des demandes précontractuelles',
          '**Art. 6(1)(c) RGPD** — Respect d’obligations légales',
          '**Art. 6(1)(f) RGPD** — Intérêts légitimes de notre organisation',
        ),
      ],
    },
    {
      heading: '5. Cookies',
      body: [
        p('Notre site web utilise des cookies — de petits fichiers texte stockés sur votre appareil. Nous distinguons :'),
        ul(
          '**Cookies de session** — supprimés à la fermeture du navigateur',
          '**Cookies persistants** — conservés jusqu’à 2 ans à des fins de fonctionnement et de marketing',
        ),
        p('Le consentement est recueilli avant l’utilisation, sauf lorsqu’il n’est pas légalement requis. Notre procédure de consentement aux cookies conserve votre statut d’acceptation jusqu’à 2 ans. Le masquage d’IP et la pseudonymisation sont appliqués lorsque c’est pertinent.'),
        p('Vous pouvez gérer vos préférences en matière de cookies dans les paramètres de votre navigateur ou via les pages de désinscription suivantes :'),
        ul(
          '[youronlinechoices.com](https://www.youronlinechoices.com/)',
          '[optout.aboutads.info](https://optout.aboutads.info/)',
        ),
      ],
    },
    {
      heading: '6. Services tiers',
      body: [
        h3('Traitement des paiements'),
        ul(
          '**PayPal (Europe) S.à r.l.** — Solutions de paiement. Confidentialité : [paypal.com/privacy](https://www.paypal.com/de/webapps/mpp/ua/privacy-full)',
          '**Stripe Payments Europe, Limited** — Services de paiement. Confidentialité : [stripe.com/privacy](https://www.stripe.com/privacy)',
        ),
        h3('E-mail et newsletter'),
        ul(
          '**CleverReach GmbH & Co. KG** — Plateforme d’e-mail marketing. Confidentialité : [cleverreach.com/datenschutz](https://www.cleverreach.com/de/datenschutz/)',
          '**Mailchimp (Rocket Science Group, LLC)** — Envoi d’e-mails. Confidentialité : [mailchimp.com/legal](https://mailchimp.com/legal/). Base du transfert : Data Privacy Framework, clauses contractuelles types.',
          '**Help Scout Inc.** — Gestion des contacts. Confidentialité : [helpscout.net/privacy](https://www.helpscout.net/company/legal/privacy/)',
        ),
        h3('Analyse d’audience'),
        ul(
          '**Google Analytics** (Google Ireland Limited, Dublin) — Analyse d’utilisation avec identification pseudonyme des utilisateurs et masquage d’IP. Base du transfert : Data Privacy Framework, clauses contractuelles types. Désinscription : [tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout?hl=de)',
          '**Google Tag Manager** (Google Ireland Limited) — Gestion des balises du site. Confidentialité : [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**etracker GmbH** — Mesure d’audience. Confidentialité : [etracker.com/datenschutz](https://www.etracker.com/datenschutz/)',
          '**Matomo** — Analyse respectueuse de la vie privée (avec ou sans cookies). Durée de conservation des cookies : 13 mois max. Site : [matomo.org](https://matomo.org/)',
        ),
        h3('Marketing et publicité en ligne'),
        ul(
          '**Facebook Pixel / Custom Audiences** (Meta Platforms Ireland Limited) — Sert à définir les visiteurs comme audience cible de publicités affichées uniquement aux utilisateurs ayant manifesté un intérêt. Base du transfert : Data Privacy Framework, clauses contractuelles types. Confidentialité : [facebook.com/about/privacy](https://www.facebook.com/about/privacy)',
          '**Google Ad Manager** (Google Ireland Limited). Confidentialité : [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**Google Ads et mesure des conversions** (Google Ireland Limited). Base du transfert : Data Privacy Framework, clauses contractuelles types.',
        ),
        h3('Présence sur les réseaux sociaux'),
        ul(
          '**Instagram** (Meta Platforms Ireland Limited). Confidentialité : [instagram.com/legal/privacy](https://instagram.com/about/legal/privacy)',
          '**Pages Facebook** (Meta Platforms Ireland Limited) — L’accord de responsabilité conjointe s’applique. Détails : [Page Controller Addendum](https://www.facebook.com/legal/terms/page_controller_addendum)',
        ),
      ],
    },
    {
      heading: '7. Newsletter',
      body: [
        p('L’inscription à la newsletter requiert une confirmation par double opt-in. Nous enregistrons l’adresse IP et l’heure de confirmation comme preuve du consentement. Nous utilisons des pixels de suivi pour mesurer les taux d’ouverture et les clics sur les liens à des fins d’analyse de performance, sur la base de nos intérêts légitimes. Chaque newsletter contient un lien de désinscription.'),
      ],
    },
    {
      heading: '8. Comptes clients',
      body: [
        p('Lors de l’inscription, l’adresse IP et l’heure d’accès sont enregistrées comme preuve du consentement. Les utilisateurs sont responsables de la sauvegarde de leurs données lors de la résiliation du compte. Les comptes clients ne sont pas indexés par les moteurs de recherche.'),
      ],
    },
    {
      heading: '9. Durée de conservation',
      body: [
        ul(
          'Comptes clients : conservés selon les obligations légales d’archivage (généralement 10 ans à des fins fiscales)',
          'Données commerciales générales : 4 ans après la fin du contrat',
          'Désinscriptions de la newsletter : jusqu’à 3 ans (intérêt légitime à des fins de défense)',
          'Fichiers journaux du serveur : conservés pour des raisons de sécurité et de stabilité',
          'Cookies : en général jusqu’à 2 ans, sauf indication contraire',
          'Cookies Matomo : 13 mois maximum',
        ),
      ],
    },
    {
      heading: '10. Vos droits',
      body: [
        p('En vertu du RGPD (articles 15 à 22), vous disposez des droits suivants :'),
        ul(
          'Accéder à vos données personnelles',
          'Rectifier des données inexactes',
          'Demander l’effacement de vos données (« droit à l’oubli »)',
          'Limiter le traitement',
          'Portabilité des données',
          'Vous opposer au traitement',
          'Droits liés aux décisions automatisées',
          'Retirer votre consentement à tout moment',
        ),
        p('Pour exercer ces droits, contactez-nous à [contact@racespot.tv](mailto:contact@racespot.tv).'),
      ],
    },
    {
      heading: '11. Transferts internationaux de données',
      body: [
        p('Lorsque des données sont transférées hors de l’UE/EEE, nous garantissons des garanties appropriées conformément aux articles 44 à 49 du RGPD au moyen de :'),
        ul(
          'Clauses contractuelles types (CCT)',
          'Certification Data Privacy Framework (DPF) pour les entreprises américaines',
          'Décisions d’adéquation de la Commission européenne',
          'Consentement explicite de l’utilisateur lorsque requis',
        ),
        p('Plus d’informations : [dataprivacyframework.gov](https://www.dataprivacyframework.gov/)'),
      ],
    },
    {
      heading: '12. Mesures de sécurité',
      body: [
        ul(
          'Chiffrement SSL/HTTPS pour la transmission des données',
          'Contrôles d’accès physiques et électroniques',
          'Garanties de confidentialité, d’intégrité et de disponibilité',
          'Principes de protection des données dès la conception et par défaut',
          'Procédures de réponse aux violations et d’exercice des droits des utilisateurs',
        ),
      ],
    },
    {
      heading: '13. Modifications de cette politique',
      body: [
        p('Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Les modifications importantes seront communiquées aux utilisateurs concernés.'),
      ],
    },
  ],
}

const it: LegalDoc = {
  updated: 'Ultimo aggiornamento: 20 aprile 2024',
  sections: [
    {
      heading: '1. Titolare del trattamento',
      body: [
        p('Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Germania'),
        p('E-mail: [contact@racespot.tv](mailto:contact@racespot.tv) · Telefono: +49 (0)163 686 7887'),
      ],
    },
    {
      heading: '2. Categorie di dati raccolti',
      body: [
        p('Possiamo raccogliere e trattare le seguenti categorie di dati personali:'),
        ul(
          'Dati anagrafici (nomi, indirizzi)',
          'Dati di contatto (indirizzi e-mail, numeri di telefono)',
          'Dati di contenuto (inserimenti nei moduli online)',
          'Dati di utilizzo (siti visitati, interessi per i contenuti, orari di accesso)',
          'Metadati e dati di comunicazione (informazioni sul dispositivo, indirizzi IP)',
          'Dati di localizzazione (posizione geografica del dispositivo)',
          'Dati contrattuali (oggetto del contratto, condizioni, classificazione del cliente)',
          'Dati di pagamento (coordinate bancarie, fatture, cronologia dei pagamenti)',
        ),
        h3('Categorie di interessati'),
        ul(
          'Partner commerciali e contrattuali',
          'Potenziali clienti',
          'Interlocutori',
          'Clienti',
          'Utenti del sito web e dei servizi online',
        ),
      ],
    },
    {
      heading: '3. Finalità del trattamento',
      body: [
        ul(
          'Fornitura e miglioramento dei nostri servizi online e dell’esperienza utente',
          'Valutazione del credito e della solvibilità',
          'Erogazione delle prestazioni contrattuali e assistenza clienti',
          'Gestione dei contatti e comunicazione',
          'Procedure amministrative e organizzative',
          'Marketing basato sugli interessi e sul comportamento',
          'Marketing diretto (e-mail, posta)',
          'Misurazione delle conversioni e della copertura',
          'Remarketing e definizione dei gruppi target',
          'Tracciamento tra dispositivi a fini di marketing',
          'Profilazione degli utenti',
          'Valutazione delle azioni di visita',
          'Misure di sicurezza',
        ),
      ],
    },
    {
      heading: '4. Base giuridica del trattamento',
      body: [
        p('Trattiamo i dati personali sulle seguenti basi giuridiche previste dal GDPR:'),
        ul(
          '**Art. 6(1)(a) GDPR** — Consenso dell’utente per finalità specifiche',
          '**Art. 6(1)(b) GDPR** — Trattamento necessario all’esecuzione di un contratto o a richieste precontrattuali',
          '**Art. 6(1)(c) GDPR** — Adempimento di obblighi legali',
          '**Art. 6(1)(f) GDPR** — Interessi legittimi della nostra organizzazione',
        ),
      ],
    },
    {
      heading: '5. Cookie',
      body: [
        p('Il nostro sito web utilizza cookie — piccoli file di testo memorizzati sul tuo dispositivo. Distinguiamo tra:'),
        ul(
          '**Cookie di sessione** — eliminati alla chiusura del browser',
          '**Cookie persistenti** — conservati fino a 2 anni per finalità funzionali e di marketing',
        ),
        p('Il consenso viene richiesto prima dell’utilizzo, salvo nei casi in cui non sia legalmente necessario. La nostra procedura di consenso ai cookie conserva il tuo stato di opt-in fino a 2 anni. Mascheramento dell’IP e pseudonimizzazione vengono applicati ove pertinente.'),
        p('Puoi gestire le preferenze sui cookie nelle impostazioni del browser o tramite le seguenti pagine di opt-out:'),
        ul(
          '[youronlinechoices.com](https://www.youronlinechoices.com/)',
          '[optout.aboutads.info](https://optout.aboutads.info/)',
        ),
      ],
    },
    {
      heading: '6. Servizi di terze parti',
      body: [
        h3('Elaborazione dei pagamenti'),
        ul(
          '**PayPal (Europe) S.à r.l.** — Soluzioni di pagamento. Privacy: [paypal.com/privacy](https://www.paypal.com/de/webapps/mpp/ua/privacy-full)',
          '**Stripe Payments Europe, Limited** — Servizi di pagamento. Privacy: [stripe.com/privacy](https://www.stripe.com/privacy)',
        ),
        h3('E-mail e newsletter'),
        ul(
          '**CleverReach GmbH & Co. KG** — Piattaforma di e-mail marketing. Privacy: [cleverreach.com/datenschutz](https://www.cleverreach.com/de/datenschutz/)',
          '**Mailchimp (Rocket Science Group, LLC)** — Invio di e-mail. Privacy: [mailchimp.com/legal](https://mailchimp.com/legal/). Base del trasferimento: Data Privacy Framework, clausole contrattuali standard.',
          '**Help Scout Inc.** — Gestione dei contatti. Privacy: [helpscout.net/privacy](https://www.helpscout.net/company/legal/privacy/)',
        ),
        h3('Analisi web'),
        ul(
          '**Google Analytics** (Google Ireland Limited, Dublino) — Analisi dell’utilizzo con identificazione pseudonima degli utenti e mascheramento dell’IP. Base del trasferimento: Data Privacy Framework, clausole contrattuali standard. Opt-out: [tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout?hl=de)',
          '**Google Tag Manager** (Google Ireland Limited) — Gestione dei tag del sito. Privacy: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**etracker GmbH** — Misurazione della copertura. Privacy: [etracker.com/datenschutz](https://www.etracker.com/datenschutz/)',
          '**Matomo** — Analisi attenta alla privacy (con o senza cookie). Conservazione dei cookie: max. 13 mesi. Sito: [matomo.org](https://matomo.org/)',
        ),
        h3('Marketing e pubblicità online'),
        ul(
          '**Facebook Pixel / Custom Audiences** (Meta Platforms Ireland Limited) — Utilizzato per definire i visitatori come gruppo target di annunci mostrati solo agli utenti che hanno manifestato interesse. Base del trasferimento: Data Privacy Framework, clausole contrattuali standard. Privacy: [facebook.com/about/privacy](https://www.facebook.com/about/privacy)',
          '**Google Ad Manager** (Google Ireland Limited). Privacy: [policies.google.com/privacy](https://policies.google.com/privacy)',
          '**Google Ads e misurazione delle conversioni** (Google Ireland Limited). Base del trasferimento: Data Privacy Framework, clausole contrattuali standard.',
        ),
        h3('Presenza sui social media'),
        ul(
          '**Instagram** (Meta Platforms Ireland Limited). Privacy: [instagram.com/legal/privacy](https://instagram.com/about/legal/privacy)',
          '**Pagine Facebook** (Meta Platforms Ireland Limited) — Si applica l’accordo di contitolarità. Dettagli: [Page Controller Addendum](https://www.facebook.com/legal/terms/page_controller_addendum)',
        ),
      ],
    },
    {
      heading: '7. Newsletter',
      body: [
        p('L’iscrizione alla newsletter richiede la conferma tramite double opt-in. Registriamo l’indirizzo IP e l’ora della conferma come prova del consenso. Utilizziamo web beacon per misurare i tassi di apertura e i clic sui link a fini di analisi delle prestazioni, sulla base di interessi legittimi. Ogni newsletter contiene un link per la disiscrizione.'),
      ],
    },
    {
      heading: '8. Account cliente',
      body: [
        p('Alla registrazione vengono registrati l’indirizzo IP e l’ora di accesso come prova del consenso. Gli utenti sono responsabili del backup dei propri dati alla chiusura dell’account. Gli account cliente non vengono indicizzati dai motori di ricerca.'),
      ],
    },
    {
      heading: '9. Conservazione dei dati',
      body: [
        ul(
          'Account cliente: conservati secondo gli obblighi legali di archiviazione (di norma 10 anni a fini fiscali)',
          'Dati commerciali generali: 4 anni dalla fine del contratto',
          'Disiscrizioni dalla newsletter: fino a 3 anni (interesse legittimo alla difesa)',
          'File di log del server: conservati per motivi di sicurezza e stabilità',
          'Cookie: di norma fino a 2 anni, salvo diversa indicazione',
          'Cookie Matomo: massimo 13 mesi',
        ),
      ],
    },
    {
      heading: '10. I tuoi diritti',
      body: [
        p('Ai sensi del GDPR (articoli 15–22), hai il diritto di:'),
        ul(
          'Accedere ai tuoi dati personali',
          'Rettificare dati inesatti',
          'Chiedere la cancellazione dei tuoi dati („diritto all’oblio")',
          'Limitare il trattamento',
          'Portabilità dei dati',
          'Opporti al trattamento',
          'Diritti relativi alle decisioni automatizzate',
          'Revocare il consenso in qualsiasi momento',
        ),
        p('Per esercitare questi diritti, scrivi a [contact@racespot.tv](mailto:contact@racespot.tv).'),
      ],
    },
    {
      heading: '11. Trasferimenti internazionali di dati',
      body: [
        p('Quando i dati vengono trasferiti al di fuori dell’UE/SEE, garantiamo garanzie adeguate ai sensi degli articoli 44–49 del GDPR mediante:'),
        ul(
          'Clausole contrattuali standard (SCC)',
          'Certificazione Data Privacy Framework (DPF) per le aziende statunitensi',
          'Decisioni di adeguatezza della Commissione europea',
          'Consenso esplicito dell’utente ove richiesto',
        ),
        p('Maggiori informazioni: [dataprivacyframework.gov](https://www.dataprivacyframework.gov/)'),
      ],
    },
    {
      heading: '12. Misure di sicurezza',
      body: [
        ul(
          'Crittografia SSL/HTTPS per la trasmissione dei dati',
          'Controlli di accesso fisici ed elettronici',
          'Garanzie di riservatezza, integrità e disponibilità',
          'Principi di protezione dei dati fin dalla progettazione e per impostazione predefinita',
          'Procedure di risposta alle violazioni e per l’esercizio dei diritti degli utenti',
        ),
      ],
    },
    {
      heading: '13. Modifiche a questa informativa',
      body: [
        p('Potremmo aggiornare periodicamente questa informativa sulla privacy. Le modifiche sostanziali saranno comunicate agli utenti interessati.'),
      ],
    },
  ],
}

export const PRIVACY: Record<Lang, LegalDoc> = { en, de, es, pt, fr, it }
