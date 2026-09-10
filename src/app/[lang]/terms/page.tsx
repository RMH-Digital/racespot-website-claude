import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'General terms and conditions for Racespot Media House GmbH.',
}

export default function TermsPage() {
  return (
    <div className="pt-8">
      <div className="container-rs py-8 max-w-3xl">
        <p className="section-label mb-3">Legal</p>
        <h1 className="display-title mb-10">Terms &amp; Conditions</h1>

        <div className="space-y-10 text-rs-muted leading-relaxed text-[15px]">
          {/* 1. Applicability */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Applicability</h2>
            <p>
              1.1. The business relationship between Racespot Media House GmbH, An der Hasenkaule 10
              (21D), 50354 Hürth (&quot;the vendor&quot;) and the customer is exclusively governed by
              the following General Terms and Conditions in the version valid at the time of the
              order.
            </p>
            <p className="mt-3">
              1.2. A consumer is any natural person who enters into a legal transaction for a purpose
              that can predominantly be attributed neither to his commercial nor to his independent
              professional activity. An entrepreneur means any natural person or legal person or
              partnership with legal capacity who, when concluding a legal transaction, acts in the
              exercise of his commercial or independent professional activity.
            </p>
            <p className="mt-3">
              1.3. The vendor does not recognise deviating customer terms unless expressly agreed upon
              in writing.
            </p>
          </section>

          {/* 2. Offers */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Offers and Service Descriptions</h2>
            <p>
              2.1. Product and service displays on our website constitute invitations to order, not
              binding offers. Service descriptions in catalogues or on the website do not represent
              guarantees or promises.
            </p>
            <p className="mt-3">
              2.2. All offers are valid as long as stocks last, unless otherwise stated in product
              descriptions. Errors excepted.
            </p>
          </section>

          {/* 3. Order Process */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. Order Process and Contract Conclusion</h2>
            <p>
              3.1. Customers select products and place them in a cart using the &quot;Add to
              Cart&quot; button, then proceed to checkout.
            </p>
            <p className="mt-3">
              3.2. The &quot;Place Binding Order&quot; button creates a binding purchase request.
              Customers can modify order data or cancel before completion. Required fields are marked
              with asterisks (*).
            </p>
            <p className="mt-3">
              3.3. The vendor sends an automatic receipt confirmation. A binding purchase contract is
              only deemed to be concluded when the vendor dispatches or confirms the dispatch of the
              product ordered within 2 days by sending the customer an email, order confirmation, or
              invoice.
            </p>
            <p className="mt-3">
              3.4. For business customers, the dispatch/confirmation timeframe extends to seven days.
            </p>
            <p className="mt-3">
              3.5. For advance payment: the contract concludes when customers provide bank details and
              fulfil payment. If payment is not received within 10 calendar days of order
              confirmation despite reminders, the vendor may withdraw from the contract, freeing them
              from supply obligations.
            </p>
          </section>

          {/* 4. Prices */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. Prices and Delivery Costs</h2>
            <p>
              4.1. All prices indicated on the vendor&apos;s website are inclusive of statutory
              value-added tax (VAT) at the valid rate.
            </p>
            <p className="mt-3">
              4.2. Delivery costs are charged separately and clearly communicated on a separate
              webpage and during the checkout process.
            </p>
          </section>

          {/* 5. Delivery */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Delivery and Product Availability</h2>
            <p>
              5.1. Where advance payment is selected, delivery occurs after receipt of payment.
            </p>
            <p className="mt-3">
              5.2. The vendor may withdraw from the contract if delivery fails after three attempts
              due to customer fault. Previous payments are refunded promptly.
            </p>
            <p className="mt-3">
              5.3. The vendor may withdraw if the ordered product becomes unavailable through no
              vendor fault. Customers are notified immediately. The vendor may offer comparable
              products; if none are available or unwanted, payments are refunded promptly.
            </p>
            <p className="mt-3">
              5.4. Delivery periods and restrictions are noted on a separate page or in the
              respective product description.
            </p>
            <p className="mt-3">
              5.5. For business customers, the risk of accidental loss and accidental deterioration
              of the goods shall pass to the buyer as soon as the seller has delivered the item to
              the forwarding agent. Delivery dates are not binding for entrepreneurs.
            </p>
            <p className="mt-3">
              5.6. The vendor is not responsible for delays caused by force majeure or unforeseeable
              events. The vendor may postpone delivery by the duration of the impediment plus a
              reasonable start-up period. If the delay becomes unreasonable, business customers may
              withdraw after setting a reasonable deadline.
            </p>
          </section>

          {/* 6. Payment */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. Terms of Payment</h2>
            <p>
              6.1. Customers select a payment method during checkout. Available payment methods are
              displayed on a separate webpage.
            </p>
            <p className="mt-3">
              6.2. Where payment on account is available, payment must be made within 30 days of
              receipt of the goods and the corresponding invoice. All other payment types require
              advance payment.
            </p>
            <p className="mt-3">
              6.3. Third-party payment processors&apos; terms apply where applicable (e.g. PayPal).
            </p>
            <p className="mt-3">
              6.4. Where a calendar date defines the payment due date, customers will be deemed to be
              in arrears as soon as they fail to comply with that due date. Interest on arrears does
              not preclude the vendor from enforcing other delay-related damage claims.
            </p>
            <p className="mt-3">
              6.5. Customers may set off only valid or vendor-acknowledged counterclaims. Retention
              rights apply only to claims arising from the same contractual relationship.
            </p>
          </section>

          {/* 7. Retention of Title */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Retention of Title</h2>
            <p>
              The vendor retains title of the goods supplied until full payment has been received.
            </p>
            <p className="mt-3">
              For business customers: the vendor retains title until all outstanding claims arising
              from the ongoing business relationship are settled. Customers must treat purchased
              items with care, insure them adequately at replacement value against theft, fire, and
              water damage, and perform timely maintenance at their own expense.
            </p>
            <p className="mt-3">
              Third-party access to vendor-owned goods must be reported immediately. Customers may
              resell reserved goods in the ordinary course of business, with all resale claims
              automatically assigned to the vendor for security. The vendor authorises the customer
              to collect assigned claims but may revoke this if payment obligations are not met.
            </p>
            <p className="mt-3">
              The vendor releases securities when their total value exceeds outstanding claims by 10%
              (or 50% if liquidation risk exists). Upon settlement of all vendor claims, ownership
              and assigned claims pass to the buyer.
            </p>
          </section>

          {/* 8. Customer Account */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. Customer Account</h2>
            <p>
              8.1. The vendor provides customer accounts displaying order information and stored
              customer data. Account information is not publicly accessible. Customers may order as
              guests without creating an account.
            </p>
            <p className="mt-3">
              8.2. Customers must provide truthful information and update it when circumstances
              change. Customers bear responsibility for disadvantages arising from inaccurate
              information.
            </p>
            <p className="mt-3">
              8.3. Accounts must be used in accordance with applicable legal provisions, particularly
              those protecting third-party rights. External software such as bots or crawlers is
              prohibited.
            </p>
            <p className="mt-3">
              8.4. Customers bear responsibility for content posted in accounts. The vendor reserves
              the right to delete content, request explanations, issue warnings, or impose account
              bans based on infringement risk.
            </p>
            <p className="mt-3">
              8.5. Customers may terminate their account at any time. The vendor may terminate
              accounts with reasonable notice (typically two weeks). The vendor reserves the right to
              extraordinary termination. Upon termination, account access and stored information
              become unavailable. Customers must back up their data before termination.
            </p>
          </section>

          {/* 9. Warranty */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. Product Warranty and Guarantee</h2>
            <p>
              9.1. Warranty (liability for defects) shall be determined in accordance with statutory
              provisions, subject to the following terms.
            </p>
            <p className="mt-3">
              9.2. Guarantees apply only when customers have received express notice before ordering.
            </p>
            <p className="mt-3">
              9.3. Business customers must inspect goods promptly and notify the vendor in writing of
              visible defects within two weeks after delivery and non-visible defects within two
              weeks after discovery. Trade-customary deviations do not constitute defects.
            </p>
            <p className="mt-3">
              9.4. For business customers, the vendor chooses between rectification or replacement
              for defective goods. Material defects become statute-barred one year after risk
              transfer (longer periods apply per law). Warranty is excluded for used goods sold to
              entrepreneurs.
            </p>
            <p className="mt-3">
              9.5. If a business customer has installed a defective item, the vendor shall not be
              obliged to reimburse the customer for the necessary expenses of removal and
              reinstallation under subsequent performance or recourse within supply chains.
            </p>
          </section>

          {/* 10. Liability */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. Liability</h2>
            <p>
              10.1. These liability exclusions apply regardless of other statutory eligibility
              criteria.
            </p>
            <p className="mt-3">
              10.2. The vendor bears unrestricted liability for damage caused by wilful intent or
              gross negligence.
            </p>
            <p className="mt-3">
              10.3. For minor negligence violating fundamental obligations essential to the
              contractual purpose, liability is restricted to foreseeable, contract-typical damage.
              Minor negligence violating other obligations excludes liability.
            </p>
            <p className="mt-3">
              10.4. These restrictions do not apply to damage to life, limb, or health, defects
              identified after guarantee acceptance regarding product nature, or defects kept secret
              with wilful deceit. Liability under the German Product Liability Act remains
              unaffected.
            </p>
            <p className="mt-3">
              10.5. The vendor&apos;s liability exclusions and restrictions also apply to the
              personal liability of employees, representatives, and agents.
            </p>
          </section>

          {/* 11. Contract Storage */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">11. Storage of the Contract</h2>
            <p>
              11.1. Customers may print contracts using browser print functions during the final
              order step.
            </p>
            <p className="mt-3">
              11.2. The vendor sends the customer an order confirmation containing all order data to
              the email address provided. Copies of general terms, cancellation policy, shipping
              costs, and payment terms accompany the confirmation or delivery.
            </p>
            <p className="mt-3">
              11.3. Registered customers can view their orders in their account profiles. Contracts
              are stored but are not accessible via the internet. Business customers may receive
              contract documents via email, mail, or online references.
            </p>
          </section>

          {/* 12. Closing Remarks */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">12. Closing Remarks</h2>
            <p>
              12.1. For entrepreneurs, the place of performance and jurisdiction is the vendor&apos;s
              seat, provided the customer is a merchant, a public-law entity, or has no general
              jurisdiction domicile in Germany. The vendor reserves the right to choose alternative
              admissible jurisdictions.
            </p>
            <p className="mt-3">
              12.2. German law applies to contracts with entrepreneurs, excluding the UN Convention
              on Contracts for the International Sale of Goods (CISG), unless mandatory statutory
              provisions dictate otherwise.
            </p>
            <p className="mt-3">
              12.3. The contract language is German.
            </p>
            <p className="mt-3">
              12.4. The European Commission provides a platform for Online Dispute Resolution
              (ODR):{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rs-yellow hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . The vendor is neither willing nor obliged to participate in dispute resolution
              proceedings before a consumer arbitration board.
            </p>
          </section>

          {/* Links */}
          <div className="border-t border-rs-border pt-8 flex flex-wrap gap-6">
            <Link href="/imprint" className="text-rs-yellow hover:underline text-sm">
              Imprint
            </Link>
            <Link href="/privacy" className="text-rs-yellow hover:underline text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
