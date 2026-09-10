import type { Lang } from '../langs'
import { p, type LegalDoc } from './types'

/**
 * General terms and conditions, one document per language.
 *
 * The English text is the one that was on the site before i18n. The five
 * translations follow it clause by clause; clause numbers are kept so a
 * reference like "5.3" means the same thing in every language.
 *
 * REVIEW: de/es/pt/fr/it are unapproved translations (2026-09-10).
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

const es: LegalDoc = {
  sections: [
    {
      heading: '1. Ámbito de aplicación',
      body: [
        p('1.1. La relación comercial entre Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth («el vendedor») y el cliente se rige exclusivamente por las siguientes Condiciones Generales en la versión vigente en el momento del pedido.'),
        p('1.2. Es consumidor toda persona física que celebra un negocio jurídico con fines que, de forma predominante, no pueden atribuirse ni a su actividad comercial ni a su actividad profesional independiente. Es empresario toda persona física o jurídica, o sociedad con capacidad jurídica, que al celebrar un negocio jurídico actúa en el ejercicio de su actividad comercial o profesional independiente.'),
        p('1.3. El vendedor no reconoce condiciones divergentes del cliente, salvo acuerdo expreso por escrito.'),
      ],
    },
    {
      heading: '2. Ofertas y descripciones de servicios',
      body: [
        p('2.1. La presentación de productos y servicios en nuestro sitio web constituye una invitación a realizar pedidos, no una oferta vinculante. Las descripciones de servicios en catálogos o en el sitio web no constituyen garantías ni promesas.'),
        p('2.2. Todas las ofertas son válidas hasta agotar existencias, salvo que se indique otra cosa en las descripciones de los productos. Salvo error u omisión.'),
      ],
    },
    {
      heading: '3. Proceso de pedido y celebración del contrato',
      body: [
        p('3.1. El cliente selecciona los productos y los añade a la cesta con el botón «Añadir a la cesta»; a continuación, procede al pago.'),
        p('3.2. El botón «Realizar pedido vinculante» genera una solicitud de compra vinculante. Antes de finalizar, el cliente puede modificar los datos del pedido o cancelarlo. Los campos obligatorios están marcados con un asterisco (*).'),
        p('3.3. El vendedor envía una confirmación automática de recepción. El contrato de compraventa vinculante solo se considera celebrado cuando el vendedor envía el producto pedido o confirma su envío en un plazo de 2 días mediante correo electrónico, confirmación de pedido o factura.'),
        p('3.4. Para clientes empresariales, el plazo de envío/confirmación se amplía a siete días.'),
        p('3.5. En caso de pago anticipado, el contrato se celebra cuando el cliente recibe los datos bancarios y efectúa el pago. Si el pago no se recibe en un plazo de 10 días naturales desde la confirmación del pedido a pesar de los recordatorios, el vendedor podrá desistir del contrato y quedará liberado de su obligación de entrega.'),
      ],
    },
    {
      heading: '4. Precios y gastos de envío',
      body: [
        p('4.1. Todos los precios indicados en el sitio web del vendedor incluyen el impuesto sobre el valor añadido (IVA) legal al tipo vigente.'),
        p('4.2. Los gastos de envío se cobran por separado y se comunican claramente en una página aparte y durante el proceso de pago.'),
      ],
    },
    {
      heading: '5. Entrega y disponibilidad de los productos',
      body: [
        p('5.1. Si se elige el pago anticipado, la entrega se realiza tras la recepción del pago.'),
        p('5.2. El vendedor podrá desistir del contrato si la entrega fracasa tras tres intentos por causas imputables al cliente. Los pagos realizados se reembolsarán sin demora.'),
        p('5.3. El vendedor podrá desistir si el producto pedido deja de estar disponible sin culpa suya. El cliente será informado de inmediato. El vendedor podrá ofrecer productos comparables; si no los hay o no se desean, los pagos se reembolsarán sin demora.'),
        p('5.4. Los plazos y restricciones de entrega se indican en una página aparte o en la descripción del producto correspondiente.'),
        p('5.5. Para clientes empresariales, el riesgo de pérdida y deterioro accidental de la mercancía se transmite al comprador en cuanto el vendedor entrega el artículo al transportista. Las fechas de entrega no son vinculantes para empresarios.'),
        p('5.6. El vendedor no responde de los retrasos causados por fuerza mayor o acontecimientos imprevisibles. Podrá aplazar la entrega por la duración del impedimento más un plazo razonable de reanudación. Si el retraso resulta inaceptable, los clientes empresariales podrán desistir tras fijar un plazo razonable.'),
      ],
    },
    {
      heading: '6. Condiciones de pago',
      body: [
        p('6.1. El cliente elige un método de pago durante el proceso de compra. Los métodos de pago disponibles se muestran en una página aparte.'),
        p('6.2. Cuando esté disponible el pago contra factura, el pago deberá efectuarse en un plazo de 30 días desde la recepción de la mercancía y de la factura correspondiente. Los demás métodos de pago requieren pago anticipado.'),
        p('6.3. Cuando corresponda, se aplican las condiciones de los proveedores de pago externos (p. ej. PayPal).'),
        p('6.4. Cuando la fecha de vencimiento del pago venga determinada por el calendario, el cliente incurrirá en mora en cuanto incumpla dicha fecha. Los intereses de demora no impiden al vendedor reclamar otros daños derivados del retraso.'),
        p('6.5. El cliente solo podrá compensar créditos firmes o reconocidos por el vendedor. El derecho de retención solo se aplica a créditos derivados de la misma relación contractual.'),
      ],
    },
    {
      heading: '7. Reserva de dominio',
      body: [
        p('El vendedor conserva la propiedad de la mercancía entregada hasta el pago íntegro. Para clientes empresariales: el vendedor conserva la propiedad hasta la liquidación de todos los créditos pendientes derivados de la relación comercial en curso. El cliente debe tratar la mercancía con cuidado, asegurarla adecuadamente a valor de reposición contra robo, incendio y daños por agua, y realizar el mantenimiento oportuno a su cargo. El acceso de terceros a mercancía propiedad del vendedor debe comunicarse de inmediato. El cliente puede revender la mercancía reservada en el curso ordinario de su negocio; los créditos derivados de la reventa se ceden automáticamente al vendedor en garantía. El vendedor autoriza al cliente a cobrar los créditos cedidos, pero puede revocar dicha autorización si el cliente incumple sus obligaciones de pago. El vendedor liberará las garantías cuando su valor total supere los créditos pendientes en un 10 % (o un 50 % si existe riesgo de realización). Al liquidarse todos los créditos del vendedor, la propiedad y los créditos cedidos pasan al comprador.'),
      ],
    },
    {
      heading: '8. Cuenta de cliente',
      body: [
        p('8.1. El vendedor pone a disposición cuentas de cliente que muestran la información de los pedidos y los datos almacenados del cliente. La información de la cuenta no es de acceso público. El cliente puede realizar pedidos como invitado sin crear una cuenta.'),
        p('8.2. El cliente debe facilitar información veraz y actualizarla cuando cambien las circunstancias. El cliente asume los perjuicios derivados de información inexacta.'),
        p('8.3. La cuenta debe utilizarse conforme a la legislación aplicable, en particular la que protege los derechos de terceros. Está prohibido el uso de software externo como bots o rastreadores.'),
        p('8.4. El cliente es responsable de los contenidos publicados en su cuenta. El vendedor se reserva el derecho a eliminar contenidos, solicitar explicaciones, emitir advertencias o bloquear cuentas en función del riesgo de infracción.'),
        p('8.5. El cliente puede cancelar su cuenta en cualquier momento. El vendedor puede cancelar cuentas con un preaviso razonable (normalmente dos semanas) y se reserva el derecho de resolución extraordinaria. Tras la cancelación, el acceso a la cuenta y la información almacenada dejan de estar disponibles. El cliente debe hacer una copia de seguridad de sus datos antes de la cancelación.'),
      ],
    },
    {
      heading: '9. Garantía legal y garantía comercial',
      body: [
        p('9.1. La garantía legal (responsabilidad por defectos) se rige por las disposiciones legales, con sujeción a las siguientes condiciones.'),
        p('9.2. Las garantías comerciales solo se aplican cuando el cliente ha sido informado expresamente antes del pedido.'),
        p('9.3. Los clientes empresariales deben examinar la mercancía sin demora y notificar por escrito al vendedor los defectos visibles en un plazo de dos semanas desde la entrega y los defectos no visibles en un plazo de dos semanas desde su descubrimiento. Las desviaciones habituales en el comercio no constituyen defectos.'),
        p('9.4. Para clientes empresariales, el vendedor elige entre la reparación o la sustitución de la mercancía defectuosa. Los defectos materiales prescriben al año de la transmisión del riesgo (se aplican plazos más largos cuando la ley lo exige). Se excluye la garantía para bienes usados vendidos a empresarios.'),
        p('9.5. Si un cliente empresarial ha instalado un artículo defectuoso, el vendedor no estará obligado a reembolsarle los gastos necesarios de desmontaje y reinstalación en el marco del cumplimiento posterior o del recurso en la cadena de suministro.'),
      ],
    },
    {
      heading: '10. Responsabilidad',
      body: [
        p('10.1. Estas exclusiones de responsabilidad se aplican con independencia de otros requisitos legales.'),
        p('10.2. El vendedor responde de forma ilimitada de los daños causados por dolo o negligencia grave.'),
        p('10.3. En caso de negligencia leve que infrinja obligaciones esenciales para la finalidad del contrato, la responsabilidad se limita al daño previsible y típico del contrato. La negligencia leve que infrinja otras obligaciones excluye la responsabilidad.'),
        p('10.4. Estas limitaciones no se aplican a los daños a la vida, la integridad física o la salud, a los defectos detectados tras la aceptación de una garantía sobre las características del producto ni a los defectos ocultados dolosamente. La responsabilidad conforme a la Ley alemana de responsabilidad por productos no se ve afectada.'),
        p('10.5. Las exclusiones y limitaciones de responsabilidad del vendedor se aplican también a la responsabilidad personal de sus empleados, representantes y auxiliares.'),
      ],
    },
    {
      heading: '11. Conservación del contrato',
      body: [
        p('11.1. El cliente puede imprimir el contrato con la función de impresión del navegador en el último paso del pedido.'),
        p('11.2. El vendedor envía al cliente una confirmación de pedido con todos los datos del pedido a la dirección de correo electrónico facilitada. Con la confirmación o la entrega se adjuntan copias de las condiciones generales, la política de desistimiento, los gastos de envío y las condiciones de pago.'),
        p('11.3. Los clientes registrados pueden consultar sus pedidos en el perfil de su cuenta. Los contratos se almacenan, pero no son accesibles a través de internet. Los clientes empresariales pueden recibir la documentación contractual por correo electrónico, correo postal o referencias en línea.'),
      ],
    },
    {
      heading: '12. Disposiciones finales',
      body: [
        p('12.1. Para empresarios, el lugar de cumplimiento y la jurisdicción competente es la sede del vendedor, siempre que el cliente sea comerciante, entidad de derecho público o carezca de fuero general en Alemania. El vendedor se reserva el derecho a elegir otros fueros admisibles.'),
        p('12.2. A los contratos con empresarios se aplica el derecho alemán, con exclusión de la Convención de las Naciones Unidas sobre los Contratos de Compraventa Internacional de Mercaderías (CISG), salvo que disposiciones legales imperativas dispongan otra cosa.'),
        p('12.3. El idioma del contrato es el alemán.'),
        p(`12.4. La Comisión Europea ofrece una plataforma de resolución de litigios en línea (ODR): [${ODR}](${ODR}). El vendedor no está dispuesto ni obligado a participar en procedimientos de resolución de litigios ante una junta arbitral de consumo.`),
      ],
    },
  ],
}

const pt: LegalDoc = {
  sections: [
    {
      heading: '1. Aplicabilidade',
      body: [
        p('1.1. A relação comercial entre a Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth ("o fornecedor") e o cliente rege-se exclusivamente pelos seguintes Termos e Condições Gerais, na versão vigente no momento do pedido.'),
        p('1.2. Consumidor é toda pessoa física que celebra um negócio jurídico com finalidades que, predominantemente, não podem ser atribuídas nem à sua atividade comercial nem à sua atividade profissional autônoma. Empresário é toda pessoa física ou jurídica, ou sociedade com capacidade jurídica, que, ao celebrar um negócio jurídico, atua no exercício de sua atividade comercial ou profissional autônoma.'),
        p('1.3. O fornecedor não reconhece condições divergentes do cliente, salvo acordo expresso por escrito.'),
      ],
    },
    {
      heading: '2. Ofertas e descrições de serviços',
      body: [
        p('2.1. A apresentação de produtos e serviços em nosso site constitui um convite a pedido, não uma oferta vinculante. As descrições de serviços em catálogos ou no site não representam garantias nem promessas.'),
        p('2.2. Todas as ofertas são válidas enquanto durarem os estoques, salvo indicação em contrário nas descrições dos produtos. Salvo erros.'),
      ],
    },
    {
      heading: '3. Processo de pedido e celebração do contrato',
      body: [
        p('3.1. O cliente seleciona os produtos e os coloca no carrinho com o botão "Adicionar ao carrinho"; em seguida, prossegue para o checkout.'),
        p('3.2. O botão "Fazer pedido vinculante" gera uma solicitação de compra vinculante. Antes da conclusão, o cliente pode alterar os dados do pedido ou cancelá-lo. Os campos obrigatórios estão marcados com asterisco (*).'),
        p('3.3. O fornecedor envia uma confirmação automática de recebimento. O contrato de compra vinculante só é considerado celebrado quando o fornecedor expede o produto pedido ou confirma a expedição dentro de 2 dias, por e-mail, confirmação de pedido ou fatura.'),
        p('3.4. Para clientes empresariais, o prazo de expedição/confirmação é de sete dias.'),
        p('3.5. No pagamento antecipado, o contrato é celebrado quando o cliente recebe os dados bancários e efetua o pagamento. Se o pagamento não for recebido em 10 dias corridos após a confirmação do pedido, apesar dos lembretes, o fornecedor pode rescindir o contrato, ficando liberado da obrigação de entrega.'),
      ],
    },
    {
      heading: '4. Preços e custos de entrega',
      body: [
        p('4.1. Todos os preços indicados no site do fornecedor incluem o imposto sobre valor agregado (IVA) legal à alíquota vigente.'),
        p('4.2. Os custos de entrega são cobrados separadamente e comunicados de forma clara em uma página específica e durante o processo de checkout.'),
      ],
    },
    {
      heading: '5. Entrega e disponibilidade dos produtos',
      body: [
        p('5.1. Quando o pagamento antecipado for selecionado, a entrega ocorre após o recebimento do pagamento.'),
        p('5.2. O fornecedor pode rescindir o contrato se a entrega falhar após três tentativas por culpa do cliente. Os pagamentos já efetuados são reembolsados prontamente.'),
        p('5.3. O fornecedor pode rescindir se o produto pedido ficar indisponível sem culpa sua. O cliente é informado imediatamente. O fornecedor pode oferecer produtos comparáveis; se não houver ou não forem desejados, os pagamentos são reembolsados prontamente.'),
        p('5.4. Prazos e restrições de entrega constam em uma página específica ou na respectiva descrição do produto.'),
        p('5.5. Para clientes empresariais, o risco de perda e deterioração acidental da mercadoria passa ao comprador assim que o vendedor entrega o item ao transportador. As datas de entrega não são vinculantes para empresários.'),
        p('5.6. O fornecedor não responde por atrasos causados por força maior ou eventos imprevisíveis. Pode adiar a entrega pela duração do impedimento mais um período razoável de retomada. Se o atraso se tornar inaceitável, clientes empresariais podem rescindir após fixar um prazo razoável.'),
      ],
    },
    {
      heading: '6. Condições de pagamento',
      body: [
        p('6.1. O cliente seleciona uma forma de pagamento durante o checkout. As formas de pagamento disponíveis são exibidas em uma página específica.'),
        p('6.2. Quando o pagamento por fatura estiver disponível, o pagamento deve ser efetuado em 30 dias após o recebimento da mercadoria e da respectiva fatura. Todas as outras formas exigem pagamento antecipado.'),
        p('6.3. Quando aplicável, valem as condições dos prestadores de serviços de pagamento terceirizados (p. ex. PayPal).'),
        p('6.4. Quando a data de vencimento for definida pelo calendário, o cliente entra em inadimplência assim que a descumprir. Os juros de mora não impedem o fornecedor de exigir outras indenizações decorrentes do atraso.'),
        p('6.5. O cliente só pode compensar créditos incontestáveis ou reconhecidos pelo fornecedor. O direito de retenção aplica-se apenas a créditos decorrentes da mesma relação contratual.'),
      ],
    },
    {
      heading: '7. Reserva de domínio',
      body: [
        p('O fornecedor mantém a propriedade da mercadoria fornecida até o pagamento integral. Para clientes empresariais: o fornecedor mantém a propriedade até a liquidação de todos os créditos pendentes decorrentes da relação comercial em curso. O cliente deve tratar os itens adquiridos com cuidado, segurá-los adequadamente pelo valor de reposição contra roubo, incêndio e danos por água, e realizar a manutenção em tempo hábil às suas custas. O acesso de terceiros a mercadorias de propriedade do fornecedor deve ser comunicado imediatamente. O cliente pode revender a mercadoria reservada no curso normal dos negócios; os créditos da revenda são automaticamente cedidos ao fornecedor como garantia. O fornecedor autoriza o cliente a cobrar os créditos cedidos, mas pode revogar essa autorização se as obrigações de pagamento não forem cumpridas. O fornecedor libera as garantias quando seu valor total exceder os créditos pendentes em 10% (ou 50% se houver risco de realização). Com a liquidação de todos os créditos do fornecedor, a propriedade e os créditos cedidos passam ao comprador.'),
      ],
    },
    {
      heading: '8. Conta de cliente',
      body: [
        p('8.1. O fornecedor disponibiliza contas de cliente que exibem informações de pedidos e dados armazenados do cliente. As informações da conta não são de acesso público. O cliente pode fazer pedidos como convidado, sem criar conta.'),
        p('8.2. O cliente deve fornecer informações verdadeiras e atualizá-las quando as circunstâncias mudarem. O cliente arca com os prejuízos decorrentes de informações incorretas.'),
        p('8.3. A conta deve ser usada de acordo com as disposições legais aplicáveis, em especial as que protegem direitos de terceiros. É proibido o uso de software externo, como bots ou crawlers.'),
        p('8.4. O cliente é responsável pelo conteúdo publicado em sua conta. O fornecedor reserva-se o direito de excluir conteúdos, solicitar esclarecimentos, emitir advertências ou bloquear contas conforme o risco de infração.'),
        p('8.5. O cliente pode encerrar sua conta a qualquer momento. O fornecedor pode encerrar contas com aviso prévio razoável (normalmente duas semanas) e reserva-se o direito de rescisão extraordinária. Após o encerramento, o acesso à conta e as informações armazenadas deixam de estar disponíveis. O cliente deve fazer backup de seus dados antes do encerramento.'),
      ],
    },
    {
      heading: '9. Garantia legal e garantia comercial',
      body: [
        p('9.1. A garantia legal (responsabilidade por defeitos) rege-se pelas disposições legais, sujeita às condições a seguir.'),
        p('9.2. Garantias comerciais aplicam-se somente quando o cliente tiver sido expressamente informado antes do pedido.'),
        p('9.3. Clientes empresariais devem inspecionar a mercadoria prontamente e notificar o fornecedor por escrito sobre defeitos visíveis em até duas semanas após a entrega e sobre defeitos não visíveis em até duas semanas após a descoberta. Variações usuais no comércio não constituem defeitos.'),
        p('9.4. Para clientes empresariais, o fornecedor escolhe entre reparo ou substituição da mercadoria defeituosa. Defeitos materiais prescrevem um ano após a transferência do risco (prazos mais longos aplicam-se quando exigidos por lei). A garantia é excluída para bens usados vendidos a empresários.'),
        p('9.5. Se um cliente empresarial tiver instalado um item defeituoso, o fornecedor não é obrigado a reembolsar as despesas necessárias de remoção e reinstalação no âmbito do cumprimento posterior ou do regresso na cadeia de fornecimento.'),
      ],
    },
    {
      heading: '10. Responsabilidade',
      body: [
        p('10.1. Estas exclusões de responsabilidade aplicam-se independentemente de outros requisitos legais.'),
        p('10.2. O fornecedor responde de forma ilimitada por danos causados por dolo ou negligência grave.'),
        p('10.3. Em caso de negligência leve que viole obrigações essenciais à finalidade do contrato, a responsabilidade limita-se ao dano previsível e típico do contrato. A negligência leve que viole outras obrigações exclui a responsabilidade.'),
        p('10.4. Estas limitações não se aplicam a danos à vida, à integridade física ou à saúde, a defeitos identificados após a aceitação de garantia quanto à natureza do produto, nem a defeitos ocultados dolosamente. A responsabilidade nos termos da Lei alemã de Responsabilidade pelo Produto permanece inalterada.'),
        p('10.5. As exclusões e limitações de responsabilidade do fornecedor aplicam-se também à responsabilidade pessoal de seus funcionários, representantes e prepostos.'),
      ],
    },
    {
      heading: '11. Armazenamento do contrato',
      body: [
        p('11.1. O cliente pode imprimir o contrato usando a função de impressão do navegador na etapa final do pedido.'),
        p('11.2. O fornecedor envia ao cliente uma confirmação de pedido com todos os dados do pedido para o endereço de e-mail informado. Cópias dos termos gerais, da política de cancelamento, dos custos de envio e das condições de pagamento acompanham a confirmação ou a entrega.'),
        p('11.3. Clientes registrados podem consultar seus pedidos no perfil da conta. Os contratos são armazenados, mas não são acessíveis pela internet. Clientes empresariais podem receber os documentos contratuais por e-mail, correio ou referências on-line.'),
      ],
    },
    {
      heading: '12. Disposições finais',
      body: [
        p('12.1. Para empresários, o local de cumprimento e o foro competente é a sede do fornecedor, desde que o cliente seja comerciante, pessoa jurídica de direito público ou não tenha foro geral na Alemanha. O fornecedor reserva-se o direito de escolher outros foros admissíveis.'),
        p('12.2. Aos contratos com empresários aplica-se o direito alemão, com exclusão da Convenção das Nações Unidas sobre Contratos de Compra e Venda Internacional de Mercadorias (CISG), salvo disposição legal imperativa em contrário.'),
        p('12.3. O idioma do contrato é o alemão.'),
        p(`12.4. A Comissão Europeia disponibiliza uma plataforma de resolução de litígios on-line (ODR): [${ODR}](${ODR}). O fornecedor não está disposto nem obrigado a participar de procedimentos de resolução de litígios perante um órgão de arbitragem de consumo.`),
      ],
    },
  ],
}

const fr: LegalDoc = {
  sections: [
    {
      heading: '1. Champ d’application',
      body: [
        p('1.1. La relation commerciale entre Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth (« le vendeur ») et le client est exclusivement régie par les présentes Conditions générales, dans leur version en vigueur au moment de la commande.'),
        p('1.2. Est consommateur toute personne physique qui conclut un acte juridique à des fins qui ne peuvent être rattachées, de manière prédominante, ni à son activité commerciale ni à son activité professionnelle indépendante. Est entrepreneur toute personne physique ou morale, ou société dotée de la capacité juridique, qui, lors de la conclusion d’un acte juridique, agit dans l’exercice de son activité commerciale ou professionnelle indépendante.'),
        p('1.3. Le vendeur ne reconnaît pas les conditions divergentes du client, sauf accord exprès et écrit.'),
      ],
    },
    {
      heading: '2. Offres et descriptions des prestations',
      body: [
        p('2.1. La présentation des produits et prestations sur notre site web constitue une invitation à commander et non une offre ferme. Les descriptions de prestations dans les catalogues ou sur le site ne constituent ni garanties ni engagements.'),
        p('2.2. Toutes les offres sont valables dans la limite des stocks disponibles, sauf mention contraire dans les descriptions des produits. Sous réserve d’erreurs.'),
      ],
    },
    {
      heading: '3. Processus de commande et conclusion du contrat',
      body: [
        p('3.1. Le client sélectionne des produits et les place dans un panier à l’aide du bouton « Ajouter au panier », puis passe à la caisse.'),
        p('3.2. Le bouton « Commander avec obligation de paiement » crée une demande d’achat ferme. Avant la validation, le client peut modifier les données de la commande ou l’annuler. Les champs obligatoires sont marqués d’un astérisque (*).'),
        p('3.3. Le vendeur envoie une confirmation de réception automatique. Le contrat de vente n’est réputé conclu que lorsque le vendeur expédie le produit commandé ou confirme son expédition dans un délai de 2 jours par e-mail, confirmation de commande ou facture.'),
        p('3.4. Pour les clients professionnels, le délai d’expédition/confirmation est porté à sept jours.'),
        p('3.5. En cas de paiement anticipé, le contrat est conclu lorsque le client reçoit les coordonnées bancaires et effectue le paiement. Si le paiement n’est pas reçu dans les 10 jours calendaires suivant la confirmation de commande malgré les rappels, le vendeur peut se retirer du contrat et est libéré de son obligation de livraison.'),
      ],
    },
    {
      heading: '4. Prix et frais de livraison',
      body: [
        p('4.1. Tous les prix indiqués sur le site du vendeur s’entendent taxe sur la valeur ajoutée (TVA) légale comprise, au taux en vigueur.'),
        p('4.2. Les frais de livraison sont facturés séparément et clairement indiqués sur une page dédiée ainsi que lors du processus de commande.'),
      ],
    },
    {
      heading: '5. Livraison et disponibilité des produits',
      body: [
        p('5.1. Lorsque le paiement anticipé est choisi, la livraison a lieu après réception du paiement.'),
        p('5.2. Le vendeur peut se retirer du contrat si la livraison échoue après trois tentatives pour des raisons imputables au client. Les paiements déjà effectués sont remboursés sans délai.'),
        p('5.3. Le vendeur peut se retirer si le produit commandé devient indisponible sans faute de sa part. Le client en est informé immédiatement. Le vendeur peut proposer des produits comparables ; à défaut ou si le client ne les souhaite pas, les paiements sont remboursés sans délai.'),
        p('5.4. Les délais et restrictions de livraison sont indiqués sur une page dédiée ou dans la description du produit concerné.'),
        p('5.5. Pour les clients professionnels, le risque de perte et de détérioration accidentelles de la marchandise est transféré à l’acheteur dès que le vendeur a remis l’article au transporteur. Les dates de livraison ne sont pas contraignantes pour les entrepreneurs.'),
        p('5.6. Le vendeur n’est pas responsable des retards dus à la force majeure ou à des événements imprévisibles. Il peut reporter la livraison de la durée de l’empêchement, majorée d’un délai de reprise raisonnable. Si le retard devient déraisonnable, les clients professionnels peuvent se retirer après avoir fixé un délai raisonnable.'),
      ],
    },
    {
      heading: '6. Conditions de paiement',
      body: [
        p('6.1. Le client choisit un mode de paiement lors de la commande. Les modes de paiement disponibles sont présentés sur une page dédiée.'),
        p('6.2. Lorsque le paiement sur facture est proposé, le paiement doit être effectué dans les 30 jours suivant la réception de la marchandise et de la facture correspondante. Tous les autres modes de paiement exigent un paiement anticipé.'),
        p('6.3. Le cas échéant, les conditions des prestataires de paiement tiers s’appliquent (p. ex. PayPal).'),
        p('6.4. Lorsque la date d’échéance est fixée par le calendrier, le client est en retard dès qu’il ne respecte pas cette date. Les intérêts de retard n’empêchent pas le vendeur de faire valoir d’autres dommages liés au retard.'),
        p('6.5. Le client ne peut compenser qu’avec des créances incontestées ou reconnues par le vendeur. Le droit de rétention ne s’applique qu’aux créances issues de la même relation contractuelle.'),
      ],
    },
    {
      heading: '7. Réserve de propriété',
      body: [
        p('Le vendeur conserve la propriété des marchandises livrées jusqu’au paiement intégral. Pour les clients professionnels : le vendeur conserve la propriété jusqu’au règlement de toutes les créances issues de la relation commerciale en cours. Le client doit traiter les articles achetés avec soin, les assurer de manière adéquate à leur valeur de remplacement contre le vol, l’incendie et les dégâts des eaux, et en assurer l’entretien en temps utile à ses frais. Tout accès de tiers aux marchandises appartenant au vendeur doit être signalé immédiatement. Le client peut revendre les marchandises sous réserve dans le cours normal de ses affaires ; toutes les créances issues de la revente sont automatiquement cédées au vendeur à titre de garantie. Le vendeur autorise le client à recouvrer les créances cédées, mais peut révoquer cette autorisation si les obligations de paiement ne sont pas respectées. Le vendeur libère les garanties lorsque leur valeur totale dépasse les créances en cours de 10 % (ou 50 % en cas de risque de réalisation). Après règlement de toutes les créances du vendeur, la propriété et les créances cédées passent à l’acheteur.'),
      ],
    },
    {
      heading: '8. Compte client',
      body: [
        p('8.1. Le vendeur met à disposition des comptes clients affichant les informations de commande et les données client enregistrées. Les informations du compte ne sont pas accessibles au public. Le client peut commander en tant qu’invité sans créer de compte.'),
        p('8.2. Le client doit fournir des informations exactes et les mettre à jour en cas de changement. Le client assume les inconvénients résultant d’informations inexactes.'),
        p('8.3. Le compte doit être utilisé conformément aux dispositions légales applicables, notamment celles protégeant les droits des tiers. L’utilisation de logiciels externes tels que des bots ou des robots d’indexation est interdite.'),
        p('8.4. Le client est responsable des contenus publiés dans son compte. Le vendeur se réserve le droit de supprimer des contenus, de demander des explications, d’émettre des avertissements ou de bloquer des comptes selon le risque d’infraction.'),
        p('8.5. Le client peut résilier son compte à tout moment. Le vendeur peut résilier des comptes moyennant un préavis raisonnable (généralement deux semaines) et se réserve le droit de résiliation extraordinaire. Après résiliation, l’accès au compte et les informations enregistrées ne sont plus disponibles. Le client doit sauvegarder ses données avant la résiliation.'),
      ],
    },
    {
      heading: '9. Garantie légale et garantie commerciale',
      body: [
        p('9.1. La garantie légale (responsabilité pour défauts) est régie par les dispositions légales, sous réserve des conditions suivantes.'),
        p('9.2. Les garanties commerciales ne s’appliquent que si le client en a été expressément informé avant la commande.'),
        p('9.3. Les clients professionnels doivent examiner la marchandise sans délai et signaler par écrit au vendeur les défauts apparents dans les deux semaines suivant la livraison, et les défauts cachés dans les deux semaines suivant leur découverte. Les écarts d’usage dans le commerce ne constituent pas des défauts.'),
        p('9.4. Pour les clients professionnels, le vendeur choisit entre la réparation et le remplacement de la marchandise défectueuse. Les défauts matériels sont prescrits un an après le transfert des risques (des délais plus longs s’appliquent lorsque la loi l’exige). La garantie est exclue pour les biens d’occasion vendus à des entrepreneurs.'),
        p('9.5. Si un client professionnel a installé un article défectueux, le vendeur n’est pas tenu de lui rembourser les frais nécessaires de dépose et de réinstallation dans le cadre de l’exécution ultérieure ou du recours dans la chaîne d’approvisionnement.'),
      ],
    },
    {
      heading: '10. Responsabilité',
      body: [
        p('10.1. Ces exclusions de responsabilité s’appliquent indépendamment des autres conditions légales.'),
        p('10.2. Le vendeur est responsable sans limitation des dommages causés intentionnellement ou par négligence grave.'),
        p('10.3. En cas de négligence légère portant sur des obligations essentielles à la finalité du contrat, la responsabilité est limitée aux dommages prévisibles et typiques du contrat. La négligence légère portant sur d’autres obligations exclut toute responsabilité.'),
        p('10.4. Ces limitations ne s’appliquent pas aux atteintes à la vie, à l’intégrité physique ou à la santé, aux défauts constatés après acceptation d’une garantie relative aux caractéristiques du produit, ni aux défauts dissimulés frauduleusement. La responsabilité au titre de la loi allemande sur la responsabilité du fait des produits reste inchangée.'),
        p('10.5. Les exclusions et limitations de responsabilité du vendeur s’appliquent également à la responsabilité personnelle de ses employés, représentants et auxiliaires d’exécution.'),
      ],
    },
    {
      heading: '11. Conservation du contrat',
      body: [
        p('11.1. Le client peut imprimer le contrat à l’aide de la fonction d’impression du navigateur lors de la dernière étape de la commande.'),
        p('11.2. Le vendeur envoie au client une confirmation de commande contenant toutes les données de la commande à l’adresse e-mail indiquée. Des copies des conditions générales, de la politique de rétractation, des frais de port et des conditions de paiement accompagnent la confirmation ou la livraison.'),
        p('11.3. Les clients enregistrés peuvent consulter leurs commandes dans le profil de leur compte. Les contrats sont conservés mais ne sont pas accessibles via internet. Les clients professionnels peuvent recevoir les documents contractuels par e-mail, courrier ou références en ligne.'),
      ],
    },
    {
      heading: '12. Dispositions finales',
      body: [
        p('12.1. Pour les entrepreneurs, le lieu d’exécution et la juridiction compétente sont le siège du vendeur, à condition que le client soit commerçant, personne morale de droit public ou n’ait pas de juridiction générale en Allemagne. Le vendeur se réserve le droit de choisir d’autres juridictions admissibles.'),
        p('12.2. Le droit allemand s’applique aux contrats conclus avec des entrepreneurs, à l’exclusion de la Convention des Nations unies sur les contrats de vente internationale de marchandises (CVIM), sauf disposition légale impérative contraire.'),
        p('12.3. La langue du contrat est l’allemand.'),
        p(`12.4. La Commission européenne met à disposition une plateforme de règlement en ligne des litiges (RLL) : [${ODR}](${ODR}). Le vendeur n’est ni disposé ni tenu de participer à une procédure de règlement des litiges devant une commission d’arbitrage des consommateurs.`),
      ],
    },
  ],
}

const it: LegalDoc = {
  sections: [
    {
      heading: '1. Ambito di applicazione',
      body: [
        p('1.1. Il rapporto commerciale tra Racespot Media House GmbH, An der Hasenkaule 10 (21D), 50354 Hürth („il venditore") e il cliente è regolato esclusivamente dalle seguenti Condizioni generali, nella versione in vigore al momento dell’ordine.'),
        p('1.2. È consumatore ogni persona fisica che conclude un negozio giuridico per scopi che, in misura prevalente, non possono essere riferiti né alla sua attività commerciale né alla sua attività professionale autonoma. È imprenditore ogni persona fisica o giuridica, o società dotata di capacità giuridica, che al momento della conclusione di un negozio giuridico agisce nell’esercizio della propria attività commerciale o professionale autonoma.'),
        p('1.3. Il venditore non riconosce condizioni del cliente difformi, salvo espresso accordo scritto.'),
      ],
    },
    {
      heading: '2. Offerte e descrizioni dei servizi',
      body: [
        p('2.1. La presentazione di prodotti e servizi sul nostro sito web costituisce un invito a ordinare, non un’offerta vincolante. Le descrizioni dei servizi nei cataloghi o sul sito non rappresentano garanzie né promesse.'),
        p('2.2. Tutte le offerte sono valide fino a esaurimento scorte, salvo diversa indicazione nelle descrizioni dei prodotti. Salvo errori.'),
      ],
    },
    {
      heading: '3. Procedura d’ordine e conclusione del contratto',
      body: [
        p('3.1. Il cliente seleziona i prodotti e li inserisce nel carrello con il pulsante „Aggiungi al carrello", quindi procede al checkout.'),
        p('3.2. Il pulsante „Ordina con obbligo di pagamento" genera una richiesta di acquisto vincolante. Prima della conferma, il cliente può modificare i dati dell’ordine o annullarlo. I campi obbligatori sono contrassegnati da un asterisco (*).'),
        p('3.3. Il venditore invia una conferma automatica di ricezione. Il contratto di acquisto vincolante si considera concluso solo quando il venditore spedisce il prodotto ordinato o ne conferma la spedizione entro 2 giorni tramite e-mail, conferma d’ordine o fattura.'),
        p('3.4. Per i clienti aziendali, il termine di spedizione/conferma è di sette giorni.'),
        p('3.5. In caso di pagamento anticipato, il contratto si conclude quando il cliente riceve le coordinate bancarie ed effettua il pagamento. Se il pagamento non viene ricevuto entro 10 giorni di calendario dalla conferma dell’ordine nonostante i solleciti, il venditore può recedere dal contratto ed è liberato dall’obbligo di consegna.'),
      ],
    },
    {
      heading: '4. Prezzi e costi di consegna',
      body: [
        p('4.1. Tutti i prezzi indicati sul sito del venditore sono comprensivi dell’imposta sul valore aggiunto (IVA) di legge all’aliquota vigente.'),
        p('4.2. I costi di consegna sono addebitati separatamente e comunicati chiaramente in una pagina dedicata e durante il processo di checkout.'),
      ],
    },
    {
      heading: '5. Consegna e disponibilità dei prodotti',
      body: [
        p('5.1. In caso di pagamento anticipato, la consegna avviene dopo la ricezione del pagamento.'),
        p('5.2. Il venditore può recedere dal contratto se la consegna fallisce dopo tre tentativi per colpa del cliente. I pagamenti già effettuati vengono rimborsati tempestivamente.'),
        p('5.3. Il venditore può recedere se il prodotto ordinato diventa indisponibile senza sua colpa. Il cliente viene informato immediatamente. Il venditore può proporre prodotti comparabili; se non disponibili o non graditi, i pagamenti vengono rimborsati tempestivamente.'),
        p('5.4. Termini e limitazioni di consegna sono indicati in una pagina dedicata o nella rispettiva descrizione del prodotto.'),
        p('5.5. Per i clienti aziendali, il rischio di perdita e deterioramento accidentale della merce passa all’acquirente nel momento in cui il venditore consegna l’articolo allo spedizioniere. Le date di consegna non sono vincolanti per gli imprenditori.'),
        p('5.6. Il venditore non è responsabile di ritardi dovuti a forza maggiore o eventi imprevedibili. Può posticipare la consegna per la durata dell’impedimento più un ragionevole periodo di ripresa. Se il ritardo diventa irragionevole, i clienti aziendali possono recedere dopo aver fissato un termine ragionevole.'),
      ],
    },
    {
      heading: '6. Condizioni di pagamento',
      body: [
        p('6.1. Il cliente sceglie un metodo di pagamento durante il checkout. I metodi di pagamento disponibili sono indicati in una pagina dedicata.'),
        p('6.2. Se è disponibile il pagamento su fattura, il pagamento deve essere effettuato entro 30 giorni dalla ricezione della merce e della relativa fattura. Tutti gli altri metodi richiedono il pagamento anticipato.'),
        p('6.3. Ove applicabile, valgono le condizioni dei fornitori di servizi di pagamento terzi (ad es. PayPal).'),
        p('6.4. Se la scadenza del pagamento è determinata dal calendario, il cliente è in mora dal momento in cui non la rispetta. Gli interessi di mora non impediscono al venditore di far valere ulteriori danni da ritardo.'),
        p('6.5. Il cliente può compensare solo con crediti accertati o riconosciuti dal venditore. Il diritto di ritenzione si applica solo a crediti derivanti dallo stesso rapporto contrattuale.'),
      ],
    },
    {
      heading: '7. Riserva di proprietà',
      body: [
        p('Il venditore conserva la proprietà della merce fornita fino al pagamento integrale. Per i clienti aziendali: il venditore conserva la proprietà fino al saldo di tutti i crediti derivanti dal rapporto commerciale in corso. Il cliente deve trattare con cura gli articoli acquistati, assicurarli adeguatamente al valore di sostituzione contro furto, incendio e danni da acqua, ed eseguirne tempestivamente la manutenzione a proprie spese. L’accesso di terzi a merce di proprietà del venditore deve essere comunicato immediatamente. Il cliente può rivendere la merce riservata nel normale corso degli affari; tutti i crediti derivanti dalla rivendita sono automaticamente ceduti al venditore a titolo di garanzia. Il venditore autorizza il cliente a incassare i crediti ceduti, ma può revocare tale autorizzazione se gli obblighi di pagamento non vengono rispettati. Il venditore libera le garanzie quando il loro valore complessivo supera i crediti in essere del 10% (o del 50% in caso di rischio di realizzo). Con il saldo di tutti i crediti del venditore, la proprietà e i crediti ceduti passano all’acquirente.'),
      ],
    },
    {
      heading: '8. Account cliente',
      body: [
        p('8.1. Il venditore mette a disposizione account cliente che mostrano le informazioni sugli ordini e i dati cliente memorizzati. Le informazioni dell’account non sono accessibili al pubblico. Il cliente può ordinare come ospite senza creare un account.'),
        p('8.2. Il cliente deve fornire informazioni veritiere e aggiornarle in caso di cambiamenti. Il cliente si assume gli svantaggi derivanti da informazioni inesatte.'),
        p('8.3. L’account deve essere utilizzato nel rispetto delle disposizioni di legge applicabili, in particolare di quelle a tutela dei diritti di terzi. È vietato l’uso di software esterni come bot o crawler.'),
        p('8.4. Il cliente è responsabile dei contenuti pubblicati nel proprio account. Il venditore si riserva il diritto di eliminare contenuti, chiedere chiarimenti, emettere avvertimenti o bloccare account in base al rischio di violazione.'),
        p('8.5. Il cliente può chiudere il proprio account in qualsiasi momento. Il venditore può chiudere account con un ragionevole preavviso (di norma due settimane) e si riserva il diritto di recesso straordinario. Alla chiusura, l’accesso all’account e le informazioni memorizzate non sono più disponibili. Il cliente deve eseguire il backup dei propri dati prima della chiusura.'),
      ],
    },
    {
      heading: '9. Garanzia legale e garanzia commerciale',
      body: [
        p('9.1. La garanzia legale (responsabilità per vizi) è determinata dalle disposizioni di legge, fatte salve le condizioni seguenti.'),
        p('9.2. Le garanzie commerciali si applicano solo se il cliente ne è stato espressamente informato prima dell’ordine.'),
        p('9.3. I clienti aziendali devono ispezionare tempestivamente la merce e comunicare per iscritto al venditore i vizi palesi entro due settimane dalla consegna e i vizi occulti entro due settimane dalla scoperta. Le variazioni d’uso commerciale non costituiscono vizi.'),
        p('9.4. Per i clienti aziendali, il venditore sceglie tra riparazione e sostituzione della merce difettosa. I vizi materiali si prescrivono un anno dopo il trasferimento del rischio (termini più lunghi si applicano ove previsti dalla legge). La garanzia è esclusa per beni usati venduti a imprenditori.'),
        p('9.5. Se un cliente aziendale ha installato un articolo difettoso, il venditore non è tenuto a rimborsargli le spese necessarie di rimozione e reinstallazione nell’ambito dell’adempimento successivo o del regresso nella catena di fornitura.'),
      ],
    },
    {
      heading: '10. Responsabilità',
      body: [
        p('10.1. Le presenti esclusioni di responsabilità si applicano indipendentemente da altri requisiti di legge.'),
        p('10.2. Il venditore risponde in modo illimitato dei danni causati con dolo o colpa grave.'),
        p('10.3. In caso di colpa lieve nella violazione di obblighi essenziali per lo scopo del contratto, la responsabilità è limitata al danno prevedibile e tipico del contratto. La colpa lieve nella violazione di altri obblighi esclude la responsabilità.'),
        p('10.4. Queste limitazioni non si applicano ai danni alla vita, all’integrità fisica o alla salute, ai vizi accertati dopo l’assunzione di una garanzia sulle caratteristiche del prodotto, né ai vizi dolosamente occultati. La responsabilità ai sensi della legge tedesca sulla responsabilità per danno da prodotti resta invariata.'),
        p('10.5. Le esclusioni e limitazioni di responsabilità del venditore si applicano anche alla responsabilità personale di dipendenti, rappresentanti e ausiliari.'),
      ],
    },
    {
      heading: '11. Conservazione del contratto',
      body: [
        p('11.1. Il cliente può stampare il contratto con la funzione di stampa del browser nell’ultima fase dell’ordine.'),
        p('11.2. Il venditore invia al cliente una conferma d’ordine con tutti i dati dell’ordine all’indirizzo e-mail indicato. Copie delle condizioni generali, dell’informativa sul recesso, dei costi di spedizione e delle condizioni di pagamento accompagnano la conferma o la consegna.'),
        p('11.3. I clienti registrati possono consultare i propri ordini nel profilo dell’account. I contratti vengono conservati ma non sono accessibili via internet. I clienti aziendali possono ricevere i documenti contrattuali via e-mail, posta o riferimenti online.'),
      ],
    },
    {
      heading: '12. Disposizioni finali',
      body: [
        p('12.1. Per gli imprenditori, il luogo di adempimento e il foro competente è la sede del venditore, a condizione che il cliente sia un commerciante, una persona giuridica di diritto pubblico o non abbia un foro generale in Germania. Il venditore si riserva il diritto di scegliere altri fori ammissibili.'),
        p('12.2. Ai contratti con imprenditori si applica il diritto tedesco, con esclusione della Convenzione delle Nazioni Unite sui contratti di vendita internazionale di merci (CISG), salvo diversa disposizione imperativa di legge.'),
        p('12.3. La lingua del contratto è il tedesco.'),
        p(`12.4. La Commissione europea mette a disposizione una piattaforma per la risoluzione online delle controversie (ODR): [${ODR}](${ODR}). Il venditore non è disposto né obbligato a partecipare a procedure di risoluzione delle controversie dinanzi a un organismo di conciliazione dei consumatori.`),
      ],
    },
  ],
}

export const TERMS: Record<Lang, LegalDoc> = { en, de, es, pt, fr, it }
