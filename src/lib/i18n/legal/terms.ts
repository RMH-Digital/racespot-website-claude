import { p, type LegalDoc, type LegalLang } from './types'

/**
 * General terms and conditions, one document per language.
 *
 * The English text is the one that was on the site before i18n. The German
 * version follows it clause by clause; clause numbers are kept so a reference
 * like "5.3" means the same thing in both languages.
 *
 * REVIEW: de is an unapproved translation (2026-09-10). Only en and de exist
 * by decision — see ./types.ts.
 */

const ODR = 'https://ec.europa.eu/consumers/odr/'

const en: LegalDoc = {
  sections: [
    {
      heading: '1. Applicability',
      body: [
        p('1.1. The business relationship between Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth ("the vendor") and the customer is exclusively governed by the following General Terms and Conditions in the version valid at the time of the order.'),
        p('1.2. A consumer is any natural person who enters into a legal transaction for a purpose that can predominantly be attributed neither to his commercial nor to his independent professional activity. An entrepreneur means any natural person or legal person or partnership with legal capacity who, when concluding a legal transaction, acts in the exercise of his commercial or independent professional activity.'),
        p('1.3. The vendor does not recognise deviating customer terms unless expressly agreed upon in writing.'),
      ],
    },
    {
      heading: '2. Offers and Service Descriptions',
      body: [
        p('2.1. Product and service displays on our website constitute invitations to order, not binding offers. Service descriptions in catalogues or on the website do not represent guarantees or promises.'),
        p('2.2. All offers are valid as long as stocks last, unless otherwise stated in product descriptions. Errors excepted.'),
      ],
    },
    {
      heading: '3. Order Process and Contract Conclusion',
      body: [
        p('3.1. Customers select products and place them in a cart using the "Add to Cart" button, then proceed to checkout.'),
        p('3.2. The "Place Binding Order" button creates a binding purchase request. Customers can modify order data or cancel before completion. Required fields are marked with asterisks (*).'),
        p('3.3. The vendor sends an automatic receipt confirmation. A binding purchase contract is only deemed to be concluded when the vendor dispatches or confirms the dispatch of the product ordered within 2 days by sending the customer an email, order confirmation, or invoice.'),
        p('3.4. For business customers, the dispatch/confirmation timeframe extends to seven days.'),
        p('3.5. For advance payment: the contract concludes when customers provide bank details and fulfil payment. If payment is not received within 10 calendar days of order confirmation despite reminders, the vendor may withdraw from the contract, freeing them from supply obligations.'),
      ],
    },
    {
      heading: '4. Prices and Delivery Costs',
      body: [
        p("4.1. All prices indicated on the vendor's website are inclusive of statutory value-added tax (VAT) at the valid rate."),
        p('4.2. Delivery costs are charged separately and clearly communicated on a separate webpage and during the checkout process.'),
      ],
    },
    {
      heading: '5. Delivery and Product Availability',
      body: [
        p('5.1. Where advance payment is selected, delivery occurs after receipt of payment.'),
        p('5.2. The vendor may withdraw from the contract if delivery fails after three attempts due to customer fault. Previous payments are refunded promptly.'),
        p('5.3. The vendor may withdraw if the ordered product becomes unavailable through no vendor fault. Customers are notified immediately. The vendor may offer comparable products; if none are available or unwanted, payments are refunded promptly.'),
        p('5.4. Delivery periods and restrictions are noted on a separate page or in the respective product description.'),
        p('5.5. For business customers, the risk of accidental loss and accidental deterioration of the goods shall pass to the buyer as soon as the seller has delivered the item to the forwarding agent. Delivery dates are not binding for entrepreneurs.'),
        p('5.6. The vendor is not responsible for delays caused by force majeure or unforeseeable events. The vendor may postpone delivery by the duration of the impediment plus a reasonable start-up period. If the delay becomes unreasonable, business customers may withdraw after setting a reasonable deadline.'),
      ],
    },
    {
      heading: '6. Terms of Payment',
      body: [
        p('6.1. Customers select a payment method during checkout. Available payment methods are displayed on a separate webpage.'),
        p('6.2. Where payment on account is available, payment must be made within 30 days of receipt of the goods and the corresponding invoice. All other payment types require advance payment.'),
        p("6.3. Third-party payment processors' terms apply where applicable (e.g. PayPal)."),
        p('6.4. Where a calendar date defines the payment due date, customers will be deemed to be in arrears as soon as they fail to comply with that due date. Interest on arrears does not preclude the vendor from enforcing other delay-related damage claims.'),
        p('6.5. Customers may set off only valid or vendor-acknowledged counterclaims. Retention rights apply only to claims arising from the same contractual relationship.'),
      ],
    },
    {
      heading: '7. Retention of Title',
      body: [
        p('The vendor retains title of the goods supplied until full payment has been received. For business customers: the vendor retains title until all outstanding claims arising from the ongoing business relationship are settled. Customers must treat purchased items with care, insure them adequately at replacement value against theft, fire, and water damage, and perform timely maintenance at their own expense. Third-party access to vendor-owned goods must be reported immediately. Customers may resell reserved goods in the ordinary course of business, with all resale claims automatically assigned to the vendor for security. The vendor authorises the customer to collect assigned claims but may revoke this if payment obligations are not met. The vendor releases securities when their total value exceeds outstanding claims by 10% (or 50% if liquidation risk exists). Upon settlement of all vendor claims, ownership and assigned claims pass to the buyer.'),
      ],
    },
    {
      heading: '8. Customer Account',
      body: [
        p('8.1. The vendor provides customer accounts displaying order information and stored customer data. Account information is not publicly accessible. Customers may order as guests without creating an account.'),
        p('8.2. Customers must provide truthful information and update it when circumstances change. Customers bear responsibility for disadvantages arising from inaccurate information.'),
        p('8.3. Accounts must be used in accordance with applicable legal provisions, particularly those protecting third-party rights. External software such as bots or crawlers is prohibited.'),
        p('8.4. Customers bear responsibility for content posted in accounts. The vendor reserves the right to delete content, request explanations, issue warnings, or impose account bans based on infringement risk.'),
        p('8.5. Customers may terminate their account at any time. The vendor may terminate accounts with reasonable notice (typically two weeks). The vendor reserves the right to extraordinary termination. Upon termination, account access and stored information become unavailable. Customers must back up their data before termination.'),
      ],
    },
    {
      heading: '9. Product Warranty and Guarantee',
      body: [
        p('9.1. Warranty (liability for defects) shall be determined in accordance with statutory provisions, subject to the following terms.'),
        p('9.2. Guarantees apply only when customers have received express notice before ordering.'),
        p('9.3. Business customers must inspect goods promptly and notify the vendor in writing of visible defects within two weeks after delivery and non-visible defects within two weeks after discovery. Trade-customary deviations do not constitute defects.'),
        p('9.4. For business customers, the vendor chooses between rectification or replacement for defective goods. Material defects become statute-barred one year after risk transfer (longer periods apply per law). Warranty is excluded for used goods sold to entrepreneurs.'),
        p('9.5. If a business customer has installed a defective item, the vendor shall not be obliged to reimburse the customer for the necessary expenses of removal and reinstallation under subsequent performance or recourse within supply chains.'),
      ],
    },
    {
      heading: '10. Liability',
      body: [
        p('10.1. These liability exclusions apply regardless of other statutory eligibility criteria.'),
        p('10.2. The vendor bears unrestricted liability for damage caused by wilful intent or gross negligence.'),
        p('10.3. For minor negligence violating fundamental obligations essential to the contractual purpose, liability is restricted to foreseeable, contract-typical damage. Minor negligence violating other obligations excludes liability.'),
        p('10.4. These restrictions do not apply to damage to life, limb, or health, defects identified after guarantee acceptance regarding product nature, or defects kept secret with wilful deceit. Liability under the German Product Liability Act remains unaffected.'),
        p("10.5. The vendor's liability exclusions and restrictions also apply to the personal liability of employees, representatives, and agents."),
      ],
    },
    {
      heading: '11. Storage of the Contract',
      body: [
        p('11.1. Customers may print contracts using browser print functions during the final order step.'),
        p('11.2. The vendor sends the customer an order confirmation containing all order data to the email address provided. Copies of general terms, cancellation policy, shipping costs, and payment terms accompany the confirmation or delivery.'),
        p('11.3. Registered customers can view their orders in their account profiles. Contracts are stored but are not accessible via the internet. Business customers may receive contract documents via email, mail, or online references.'),
      ],
    },
    {
      heading: '12. Closing Remarks',
      body: [
        p("12.1. For entrepreneurs, the place of performance and jurisdiction is the vendor's seat, provided the customer is a merchant, a public-law entity, or has no general jurisdiction domicile in Germany. The vendor reserves the right to choose alternative admissible jurisdictions."),
        p('12.2. German law applies to contracts with entrepreneurs, excluding the UN Convention on Contracts for the International Sale of Goods (CISG), unless mandatory statutory provisions dictate otherwise.'),
        p('12.3. The contract language is German.'),
        p(`12.4. The European Commission provides a platform for Online Dispute Resolution (ODR): [${ODR}](${ODR}). The vendor is neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.`),
      ],
    },
  ],
}

const de: LegalDoc = {
  sections: [
    {
      heading: '1. Geltungsbereich',
      body: [
        p('1.1. Für die Geschäftsbeziehung zwischen der Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth („der Anbieter") und dem Kunden gelten ausschließlich die folgenden Allgemeinen Geschäftsbedingungen in ihrer zum Zeitpunkt der Bestellung gültigen Fassung.'),
        p('1.2. Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können. Unternehmer ist eine natürliche oder juristische Person oder eine rechtsfähige Personengesellschaft, die bei Abschluss eines Rechtsgeschäfts in Ausübung ihrer gewerblichen oder selbständigen beruflichen Tätigkeit handelt.'),
        p('1.3. Abweichende Bedingungen des Kunden erkennt der Anbieter nicht an, es sei denn, ihrer Geltung wurde ausdrücklich schriftlich zugestimmt.'),
      ],
    },
    {
      heading: '2. Angebote und Leistungsbeschreibungen',
      body: [
        p('2.1. Die Darstellung der Produkte und Leistungen auf unserer Website stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar. Leistungsbeschreibungen in Katalogen oder auf der Website haben nicht den Charakter einer Zusicherung oder Garantie.'),
        p('2.2. Alle Angebote gelten, solange der Vorrat reicht, wenn nicht in den Produktbeschreibungen etwas anderes vermerkt ist. Irrtümer vorbehalten.'),
      ],
    },
    {
      heading: '3. Bestellvorgang und Vertragsschluss',
      body: [
        p('3.1. Der Kunde wählt Produkte aus und legt sie über den Button „In den Warenkorb" in einen Warenkorb, anschließend geht er zur Kasse.'),
        p('3.2. Mit dem Button „Zahlungspflichtig bestellen" gibt der Kunde ein verbindliches Angebot ab. Vor dem Absenden kann der Kunde die Bestelldaten ändern oder die Bestellung abbrechen. Pflichtangaben sind mit einem Sternchen (*) gekennzeichnet.'),
        p('3.3. Der Anbieter schickt eine automatische Empfangsbestätigung. Ein verbindlicher Kaufvertrag kommt erst zustande, wenn der Anbieter das bestellte Produkt innerhalb von 2 Tagen versendet oder den Versand per E-Mail, Auftragsbestätigung oder Rechnung bestätigt.'),
        p('3.4. Für Geschäftskunden verlängert sich die Frist für Versand bzw. Bestätigung auf sieben Tage.'),
        p('3.5. Bei Vorkasse kommt der Vertrag zustande, wenn der Kunde die Bankdaten erhält und die Zahlung leistet. Geht die Zahlung trotz Mahnung nicht innerhalb von 10 Kalendertagen nach Auftragsbestätigung ein, kann der Anbieter vom Vertrag zurücktreten und ist von der Lieferpflicht befreit.'),
      ],
    },
    {
      heading: '4. Preise und Versandkosten',
      body: [
        p('4.1. Alle auf der Website des Anbieters angegebenen Preise verstehen sich einschließlich der jeweils gültigen gesetzlichen Umsatzsteuer.'),
        p('4.2. Versandkosten werden gesondert berechnet und auf einer separaten Seite sowie im Bestellvorgang deutlich mitgeteilt.'),
      ],
    },
    {
      heading: '5. Lieferung und Verfügbarkeit',
      body: [
        p('5.1. Bei Vorkasse erfolgt die Lieferung nach Zahlungseingang.'),
        p('5.2. Scheitert die Zustellung dreimal aus Gründen, die der Kunde zu verantworten hat, kann der Anbieter vom Vertrag zurücktreten. Geleistete Zahlungen werden unverzüglich erstattet.'),
        p('5.3. Ist das bestellte Produkt ohne Verschulden des Anbieters nicht verfügbar, kann der Anbieter zurücktreten. Der Kunde wird unverzüglich informiert. Der Anbieter kann vergleichbare Produkte anbieten; sind keine verfügbar oder nicht gewünscht, werden Zahlungen unverzüglich erstattet.'),
        p('5.4. Lieferfristen und -beschränkungen sind auf einer separaten Seite oder in der jeweiligen Produktbeschreibung angegeben.'),
        p('5.5. Bei Geschäftskunden geht die Gefahr des zufälligen Untergangs und der zufälligen Verschlechterung der Ware auf den Käufer über, sobald der Verkäufer die Sache dem Spediteur übergeben hat. Liefertermine sind für Unternehmer unverbindlich.'),
        p('5.6. Der Anbieter haftet nicht für Verzögerungen durch höhere Gewalt oder unvorhersehbare Ereignisse. Er kann die Lieferung um die Dauer der Behinderung zuzüglich einer angemessenen Anlaufzeit verschieben. Wird die Verzögerung unzumutbar, können Geschäftskunden nach Setzen einer angemessenen Frist zurücktreten.'),
      ],
    },
    {
      heading: '6. Zahlungsbedingungen',
      body: [
        p('6.1. Der Kunde wählt im Bestellvorgang eine Zahlungsart. Die verfügbaren Zahlungsarten sind auf einer separaten Seite dargestellt.'),
        p('6.2. Ist Kauf auf Rechnung möglich, ist die Zahlung innerhalb von 30 Tagen nach Erhalt der Ware und der Rechnung fällig. Alle anderen Zahlungsarten setzen Vorkasse voraus.'),
        p('6.3. Soweit einschlägig, gelten die Bedingungen der jeweiligen Zahlungsdienstleister (z. B. PayPal).'),
        p('6.4. Ist die Fälligkeit nach dem Kalender bestimmt, kommt der Kunde bereits mit Versäumen des Termins in Verzug. Verzugszinsen schließen weitergehende Verzugsschadensansprüche des Anbieters nicht aus.'),
        p('6.5. Der Kunde kann nur mit rechtskräftig festgestellten oder vom Anbieter anerkannten Gegenforderungen aufrechnen. Ein Zurückbehaltungsrecht besteht nur für Ansprüche aus demselben Vertragsverhältnis.'),
      ],
    },
    {
      heading: '7. Eigentumsvorbehalt',
      body: [
        p('Der Anbieter behält sich das Eigentum an der gelieferten Ware bis zur vollständigen Bezahlung vor. Gegenüber Geschäftskunden behält er sich das Eigentum bis zur Erfüllung aller Forderungen aus der laufenden Geschäftsbeziehung vor. Der Kunde hat die Kaufsache pfleglich zu behandeln, auf eigene Kosten zum Neuwert gegen Diebstahl, Feuer- und Wasserschäden zu versichern und rechtzeitig zu warten. Zugriffe Dritter auf Vorbehaltsware sind unverzüglich anzuzeigen. Der Kunde darf Vorbehaltsware im ordentlichen Geschäftsgang weiterverkaufen; die Forderungen aus dem Weiterverkauf gelten zur Sicherheit als an den Anbieter abgetreten. Der Anbieter ermächtigt den Kunden zum Einzug der abgetretenen Forderungen, kann dies aber widerrufen, wenn der Kunde seine Zahlungspflichten nicht erfüllt. Der Anbieter gibt Sicherheiten frei, wenn ihr Wert die Forderungen um 10 % (bei Verwertungsrisiko um 50 %) übersteigt. Mit Erfüllung aller Forderungen gehen Eigentum und abgetretene Forderungen auf den Käufer über.'),
      ],
    },
    {
      heading: '8. Kundenkonto',
      body: [
        p('8.1. Der Anbieter stellt Kundenkonten bereit, in denen Bestellinformationen und gespeicherte Kundendaten angezeigt werden. Kontodaten sind nicht öffentlich zugänglich. Kunden können auch als Gast ohne Konto bestellen.'),
        p('8.2. Kunden müssen wahrheitsgemäße Angaben machen und diese bei Änderungen aktualisieren. Nachteile aus unrichtigen Angaben trägt der Kunde.'),
        p('8.3. Das Konto ist im Einklang mit den geltenden gesetzlichen Bestimmungen zu nutzen, insbesondere zum Schutz der Rechte Dritter. Der Einsatz externer Software wie Bots oder Crawler ist untersagt.'),
        p('8.4. Für Inhalte, die im Konto veröffentlicht werden, ist der Kunde verantwortlich. Der Anbieter behält sich vor, Inhalte zu löschen, Erklärungen zu verlangen, Verwarnungen auszusprechen oder Konten je nach Verstoßrisiko zu sperren.'),
        p('8.5. Kunden können ihr Konto jederzeit kündigen. Der Anbieter kann Konten mit angemessener Frist (in der Regel zwei Wochen) kündigen; das Recht zur außerordentlichen Kündigung bleibt vorbehalten. Mit der Kündigung sind Kontozugang und gespeicherte Informationen nicht mehr verfügbar. Kunden müssen ihre Daten vor der Kündigung sichern.'),
      ],
    },
    {
      heading: '9. Gewährleistung und Garantie',
      body: [
        p('9.1. Die Gewährleistung (Mängelhaftung) richtet sich nach den gesetzlichen Vorschriften, soweit nachfolgend nichts anderes bestimmt ist.'),
        p('9.2. Garantien gelten nur, wenn der Kunde vor der Bestellung ausdrücklich darauf hingewiesen wurde.'),
        p('9.3. Geschäftskunden müssen die Ware unverzüglich prüfen und offensichtliche Mängel innerhalb von zwei Wochen nach Lieferung, verdeckte Mängel innerhalb von zwei Wochen nach Entdeckung schriftlich anzeigen. Handelsübliche Abweichungen stellen keinen Mangel dar.'),
        p('9.4. Gegenüber Geschäftskunden wählt der Anbieter zwischen Nachbesserung und Ersatzlieferung. Sachmängelansprüche verjähren ein Jahr nach Gefahrübergang (gesetzlich längere Fristen bleiben unberührt). Bei gebrauchten Waren ist die Gewährleistung gegenüber Unternehmern ausgeschlossen.'),
        p('9.5. Hat ein Geschäftskunde eine mangelhafte Sache eingebaut, ist der Anbieter im Rahmen der Nacherfüllung oder des Lieferantenregresses nicht zum Ersatz der erforderlichen Aus- und Einbaukosten verpflichtet.'),
      ],
    },
    {
      heading: '10. Haftung',
      body: [
        p('10.1. Die folgenden Haftungsausschlüsse gelten unabhängig von sonstigen gesetzlichen Anspruchsvoraussetzungen.'),
        p('10.2. Der Anbieter haftet unbeschränkt für Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen.'),
        p('10.3. Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt. Bei leicht fahrlässiger Verletzung sonstiger Pflichten ist die Haftung ausgeschlossen.'),
        p('10.4. Diese Beschränkungen gelten nicht für Schäden an Leben, Körper oder Gesundheit, für Mängel nach Übernahme einer Beschaffenheitsgarantie oder für arglistig verschwiegene Mängel. Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.'),
        p('10.5. Die Haftungsausschlüsse und -beschränkungen gelten auch für die persönliche Haftung von Mitarbeitern, Vertretern und Erfüllungsgehilfen des Anbieters.'),
      ],
    },
    {
      heading: '11. Speicherung des Vertragstextes',
      body: [
        p('11.1. Der Kunde kann den Vertragstext im letzten Bestellschritt über die Druckfunktion des Browsers ausdrucken.'),
        p('11.2. Der Anbieter sendet dem Kunden eine Auftragsbestätigung mit allen Bestelldaten an die angegebene E-Mail-Adresse. Die AGB, die Widerrufsbelehrung, Versandkosten und Zahlungsbedingungen werden mit der Bestätigung oder der Lieferung übermittelt.'),
        p('11.3. Registrierte Kunden können ihre Bestellungen im Kundenkonto einsehen. Der Vertragstext wird gespeichert, ist aber nicht über das Internet abrufbar. Geschäftskunden können Vertragsunterlagen per E-Mail, Post oder Online-Verweis erhalten.'),
      ],
    },
    {
      heading: '12. Schlussbestimmungen',
      body: [
        p('12.1. Für Unternehmer ist Erfüllungsort und Gerichtsstand der Sitz des Anbieters, sofern der Kunde Kaufmann, juristische Person des öffentlichen Rechts ist oder keinen allgemeinen Gerichtsstand in Deutschland hat. Der Anbieter behält sich vor, auch andere zulässige Gerichtsstände zu wählen.'),
        p('12.2. Für Verträge mit Unternehmern gilt deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG), soweit zwingende gesetzliche Vorschriften nichts anderes bestimmen.'),
        p('12.3. Vertragssprache ist Deutsch.'),
        p(`12.4. Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: [${ODR}](${ODR}). Der Anbieter ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`),
      ],
    },
  ],
}

export const TERMS: Record<LegalLang, LegalDoc> = { en, de }
