import { p, ul, type LegalDoc, type LegalLang } from './types'

/**
 * Terms of use for the website — NOT general terms of business.
 *
 * Replaced 2026-09-14 (decision by Jürgen, docs/TODO.md item 4b). The previous
 * document was an online shop's AGB: order process, delivery costs, product
 * availability, payment terms, retention of title, customer account, product
 * warranty. racespot.tv has no shop, no cart and no customer account, so those
 * clauses described a business that does not happen here.
 *
 * What this document does instead: govern the use of the website itself —
 * copyright in the content, third-party embeds and links, availability,
 * liability, and the fact that nothing on the site is a binding offer.
 * Production work is agreed in individual contracts, which these terms do not
 * touch.
 *
 * ⚠ NOT YET APPROVED by Jürgen (the previous German version was, on
 * 2026-09-10). Both languages were written together on 2026-09-14 and need a
 * read-through; a lawyer's review is advisable before relying on the liability
 * and copyright clauses.
 *
 * Statutory references are to the DDG (Digitale-Dienste-Gesetz), which replaced
 * the TMG in May 2024.
 */

const en: LegalDoc = {
  updated: 'Last updated: September 14, 2026',
  sections: [
    {
      heading: '1. Scope',
      body: [
        p('1.1. These terms govern the use of the website racespot.tv, operated by Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth, Germany ("Racespot", "we").'),
        p('1.2. They apply to the website only. Broadcast production, event support and any other service we provide are agreed individually in writing; the contract concluded there takes precedence and is not affected by these terms.'),
        p('1.3. By using the website you accept these terms in the version current at the time of your visit.'),
      ],
    },
    {
      heading: '2. What the Website Is',
      body: [
        p('2.1. racespot.tv is an information service. It presents our work, our broadcast schedule, news from the sim racing world and ways of getting in touch.'),
        p('2.2. **Nothing on this website is a binding offer.** Descriptions of services, prices mentioned in editorial content and schedule entries are information, not an offer capable of acceptance. A contract with us comes about only through a written agreement signed by both sides.'),
        p('2.3. Sending an enquiry through one of our contact forms does not create a contract and does not oblige either side to enter into one.'),
      ],
    },
    {
      heading: '3. Copyright and Use of Content',
      body: [
        p('3.1. All content on this website — texts, photographs, video, graphics, layout, logos and source code — is protected by copyright and belongs to Racespot Media House GmbH or to the respective rights holders named beside the material.'),
        p('3.2. You may view the website, follow links to it and print or store individual pages for your own private or internal business use.'),
        p('3.3. Any other use requires our prior written consent. This applies in particular to:'),
        ul(
          'reproduction, distribution or public communication of our photographs and video material',
          'republication of our news articles in whole or in substantial part',
          'use of our logos, brand names or design elements',
          'systematic automated retrieval of the site or its content, including for the training of machine learning systems',
        ),
        p('3.4. Short quotations with a clear source reference and a link to the page quoted are permitted within the limits of § 51 UrhG. Press enquiries about image material: [contact@racespot.tv](mailto:contact@racespot.tv)'),
      ],
    },
    {
      heading: '4. Trademarks',
      body: [
        p('Names, brands and logos of third parties shown on this website — series, teams, manufacturers, partners and platforms — belong to their respective owners. They appear for the purpose of describing the events we cover and imply no endorsement or partnership beyond what is expressly stated.'),
      ],
    },
    {
      heading: '5. Editorial Content',
      body: [
        p('5.1. Our news articles are compiled with care from publicly available sources. We do not guarantee that they are complete, accurate or up to date, and reporting on a third party does not make us responsible for that party\'s statements or conduct.'),
        p('5.2. Articles reflect the state of knowledge at the time of publication. We are under no obligation to update them, and we may correct, amend or withdraw content at any time.'),
        p('5.3. If you believe an article contains an error, please write to [contact@racespot.tv](mailto:contact@racespot.tv) — we will look into it.'),
      ],
    },
    {
      heading: '6. Third-Party Content and Links',
      body: [
        p('6.1. Our Live and Events pages embed videos hosted by YouTube. That content is transmitted by Google, not by us; how it behaves and what data it collects is described in our [privacy policy](/en/privacy).'),
        p('6.2. This website contains links to external sites. Those sites are outside our control. At the time of linking we found no unlawful content; we do not monitor linked sites on an ongoing basis, and responsibility for their content lies with their respective operators (§§ 7–10 DDG).'),
        p('6.3. If you become aware of unlawful content behind one of our links, please tell us and we will remove the link without delay.'),
      ],
    },
    {
      heading: '7. Availability',
      body: [
        p('We aim to keep the website available, but we do not owe you a particular level of availability. Maintenance, technical faults and circumstances outside our control — including failures at our hosting provider or at YouTube — may interrupt access. Schedule and live status information is drawn from external sources and may be incomplete or delayed.'),
      ],
    },
    {
      heading: '8. Liability',
      body: [
        p('8.1. We are liable without limitation for damage caused intentionally or by gross negligence, for injury to life, body or health, and where liability is mandatory under the Product Liability Act.'),
        p('8.2. In the case of slight negligence we are liable only for breach of an essential contractual obligation — an obligation whose fulfilment makes the proper use of the website possible in the first place and on whose observance you may reasonably rely — and in that case only for foreseeable damage typical of this kind of use.'),
        p('8.3. Any further liability is excluded. This does not affect the allocation of the burden of proof to your disadvantage.'),
        p('8.4. The limitations in 8.2 and 8.3 also apply in favour of our employees, representatives and agents.'),
      ],
    },
    {
      heading: '9. Data Protection',
      body: [
        p('How we handle personal data is set out in our [privacy policy](/en/privacy), which forms part of the information we provide but is not a contractual term.'),
      ],
    },
    {
      heading: '10. Changes to These Terms',
      body: [
        p('We may amend these terms when the website changes or the legal situation requires it. The version current at the time of your visit applies; the date at the top shows which that is.'),
      ],
    },
    {
      heading: '11. Applicable Law and Place of Jurisdiction',
      body: [
        p('11.1. German law applies, excluding the UN Convention on Contracts for the International Sale of Goods. If you are a consumer resident in the EU, the mandatory consumer protection provisions of your country of residence remain unaffected.'),
        p('11.2. If you are a merchant, a legal person under public law or a special fund under public law, the place of jurisdiction for all disputes arising from the use of this website is Cologne, Germany.'),
        p('11.3. We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.'),
      ],
    },
    {
      heading: '12. Severability',
      body: [
        p('Should any provision of these terms be or become invalid, the validity of the remaining provisions is unaffected.'),
      ],
    },
  ],
}

const de: LegalDoc = {
  updated: 'Stand: 14. September 2026',
  sections: [
    {
      heading: '1. Geltungsbereich',
      body: [
        p('1.1. Diese Bedingungen regeln die Nutzung der Website racespot.tv, betrieben von der Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth („Racespot", „wir").'),
        p('1.2. Sie gelten ausschließlich für die Website. Broadcast-Produktionen, Event-Unterstützung und sonstige Leistungen vereinbaren wir individuell und schriftlich; der dort geschlossene Vertrag geht vor und bleibt von diesen Bedingungen unberührt.'),
        p('1.3. Mit der Nutzung der Website erkennen Sie diese Bedingungen in der zum Zeitpunkt Ihres Besuchs geltenden Fassung an.'),
      ],
    },
    {
      heading: '2. Was diese Website ist',
      body: [
        p('2.1. racespot.tv ist ein Informationsangebot. Sie stellt unsere Arbeit, unseren Sendeplan, Nachrichten aus dem Simracing und Wege der Kontaktaufnahme dar.'),
        p('2.2. **Nichts auf dieser Website ist ein verbindliches Angebot.** Leistungsbeschreibungen, in redaktionellen Inhalten genannte Preise und Einträge im Sendeplan sind Informationen, kein annahmefähiges Angebot. Ein Vertrag mit uns kommt erst durch eine beiderseits unterzeichnete schriftliche Vereinbarung zustande.'),
        p('2.3. Das Absenden einer Anfrage über unsere Kontaktformulare begründet keinen Vertrag und verpflichtet keine Seite zum Vertragsschluss.'),
      ],
    },
    {
      heading: '3. Urheberrecht und Nutzung der Inhalte',
      body: [
        p('3.1. Sämtliche Inhalte dieser Website — Texte, Fotografien, Videomaterial, Grafiken, Gestaltung, Logos und Quellcode — sind urheberrechtlich geschützt und stehen der Racespot Media House GmbH oder den jeweils beim Material genannten Rechteinhabern zu.'),
        p('3.2. Sie dürfen die Website ansehen, auf sie verlinken und einzelne Seiten für Ihren privaten oder innerbetrieblichen Gebrauch ausdrucken oder speichern.'),
        p('3.3. Jede weitergehende Nutzung bedarf unserer vorherigen schriftlichen Zustimmung. Das gilt insbesondere für:'),
        ul(
          'Vervielfältigung, Verbreitung oder öffentliche Wiedergabe unserer Fotos und Videos',
          'die Weiterveröffentlichung unserer Nachrichtenartikel im Ganzen oder in wesentlichen Teilen',
          'die Verwendung unserer Logos, Marken oder Gestaltungselemente',
          'das systematische automatisierte Auslesen der Seite oder ihrer Inhalte, auch zum Training maschineller Lernverfahren',
        ),
        p('3.4. Kurze Zitate mit deutlicher Quellenangabe und Link auf die zitierte Seite sind im Rahmen von § 51 UrhG zulässig. Presseanfragen zu Bildmaterial: [contact@racespot.tv](mailto:contact@racespot.tv)'),
      ],
    },
    {
      heading: '4. Marken Dritter',
      body: [
        p('Auf dieser Website gezeigte Namen, Marken und Logos Dritter — Serien, Teams, Hersteller, Partner und Plattformen — stehen den jeweiligen Inhabern zu. Sie dienen der Beschreibung der von uns begleiteten Veranstaltungen und begründen keine Empfehlung oder Partnerschaft über das ausdrücklich Genannte hinaus.'),
      ],
    },
    {
      heading: '5. Redaktionelle Inhalte',
      body: [
        p('5.1. Unsere Nachrichtenartikel werden sorgfältig aus öffentlich zugänglichen Quellen zusammengestellt. Eine Gewähr für Vollständigkeit, Richtigkeit und Aktualität übernehmen wir nicht; die Berichterstattung über Dritte macht uns nicht für deren Aussagen oder Verhalten verantwortlich.'),
        p('5.2. Artikel geben den Kenntnisstand zum Zeitpunkt der Veröffentlichung wieder. Eine Pflicht zur Aktualisierung besteht nicht; wir können Inhalte jederzeit berichtigen, ergänzen oder zurückziehen.'),
        p('5.3. Wenn Sie in einem Artikel einen Fehler vermuten, schreiben Sie uns an [contact@racespot.tv](mailto:contact@racespot.tv) — wir gehen dem nach.'),
      ],
    },
    {
      heading: '6. Inhalte Dritter und Verlinkungen',
      body: [
        p('6.1. Auf unseren Seiten Live und Events sind Videos eingebunden, die bei YouTube liegen. Diese Inhalte werden von Google ausgeliefert, nicht von uns; wie sie sich verhalten und welche Daten dabei anfallen, steht in unserer [Datenschutzerklärung](/de/privacy).'),
        p('6.2. Diese Website enthält Links auf externe Seiten. Auf deren Inhalte haben wir keinen Einfluss. Zum Zeitpunkt der Verlinkung waren keine rechtswidrigen Inhalte erkennbar; eine laufende Überprüfung verlinkter Seiten findet nicht statt, und für deren Inhalte ist der jeweilige Betreiber verantwortlich (§§ 7–10 DDG).'),
        p('6.3. Wird Ihnen hinter einem unserer Links ein rechtswidriger Inhalt bekannt, teilen Sie es uns bitte mit — wir entfernen den Link umgehend.'),
      ],
    },
    {
      heading: '7. Verfügbarkeit',
      body: [
        p('Wir bemühen uns um einen durchgehenden Betrieb, schulden aber keine bestimmte Verfügbarkeit. Wartungsarbeiten, technische Störungen und Umstände außerhalb unseres Einflussbereichs — darunter Ausfälle bei unserem Hoster oder bei YouTube — können den Zugriff unterbrechen. Angaben zu Sendeplan und Live-Status stammen aus externen Quellen und können unvollständig oder verzögert sein.'),
      ],
    },
    {
      heading: '8. Haftung',
      body: [
        p('8.1. Wir haften unbeschränkt für Schäden aus Vorsatz und grober Fahrlässigkeit, für die Verletzung von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz.'),
        p('8.2. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht — einer Pflicht, deren Erfüllung die ordnungsgemäße Nutzung der Website überhaupt erst ermöglicht und auf deren Einhaltung Sie regelmäßig vertrauen dürfen — und dann begrenzt auf den vorhersehbaren, für diese Art der Nutzung typischen Schaden.'),
        p('8.3. Eine weitergehende Haftung ist ausgeschlossen. Eine Änderung der Beweislast zu Ihrem Nachteil ist damit nicht verbunden.'),
        p('8.4. Die Beschränkungen aus 8.2 und 8.3 gelten auch zugunsten unserer Mitarbeiter, Vertreter und Erfüllungsgehilfen.'),
      ],
    },
    {
      heading: '9. Datenschutz',
      body: [
        p('Wie wir mit personenbezogenen Daten umgehen, steht in unserer [Datenschutzerklärung](/de/privacy). Sie ist Teil unserer Informationen, aber keine Vertragsbedingung.'),
      ],
    },
    {
      heading: '10. Änderungen dieser Bedingungen',
      body: [
        p('Wir passen diese Bedingungen an, wenn sich die Website ändert oder die Rechtslage es erfordert. Es gilt die zum Zeitpunkt Ihres Besuchs abrufbare Fassung; das Datum oben zeigt, welche das ist.'),
      ],
    },
    {
      heading: '11. Anwendbares Recht und Gerichtsstand',
      body: [
        p('11.1. Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Sind Sie Verbraucher mit Wohnsitz in der EU, bleiben die zwingenden Verbraucherschutzvorschriften Ihres Wohnsitzstaates unberührt.'),
        p('11.2. Sind Sie Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand für alle Streitigkeiten aus der Nutzung dieser Website Köln.'),
        p('11.3. Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'),
      ],
    },
    {
      heading: '12. Salvatorische Klausel',
      body: [
        p('Sollte eine Bestimmung dieser Bedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.'),
      ],
    },
  ],
}

export const TERMS: Record<LegalLang, LegalDoc> = { en, de }
