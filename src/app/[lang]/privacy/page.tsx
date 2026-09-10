import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Racespot Media House GmbH.',
}

export default function PrivacyPage() {
  return (
    <div className="pt-8">
      <div className="container-rs py-8 max-w-3xl">
        <p className="section-label mb-3">Legal</p>
        <h1 className="display-title mb-10">Privacy Policy</h1>
        <p className="text-rs-muted text-sm mb-10">Last updated: April 20, 2024</p>

        <div className="space-y-10 text-rs-muted leading-relaxed text-[15px]">
          {/* 1. Data Controller */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Data Controller</h2>
            <p>
              Racespot Media House GmbH<br />
              An der Hasenkaule 10 (21D)<br />
              50354 Hürth, Deutschland
            </p>
            <p className="mt-2">
              Email:{' '}
              <a href="mailto:contact@racespot.tv" className="text-rs-yellow hover:underline">
                contact@racespot.tv
              </a>
              <br />
              Phone: +49 (0)163 686 7887
            </p>
          </section>

          {/* 2. Data Categories */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Categories of Data Collected</h2>
            <p>We may collect and process the following categories of personal data:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>Inventory data (names, addresses)</li>
              <li>Contact data (email addresses, telephone numbers)</li>
              <li>Content data (entries in online forms)</li>
              <li>Usage data (websites visited, content interests, access times)</li>
              <li>Meta/communication data (device information, IP addresses)</li>
              <li>Location data (geographical position of the device)</li>
              <li>Contract data (contract subject, terms, customer classification)</li>
              <li>Payment data (bank details, invoices, payment history)</li>
            </ul>
            <h3 className="text-white font-medium mt-4 mb-2">Data Subject Categories</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Business and contractual partners</li>
              <li>Interested parties</li>
              <li>Communication partners</li>
              <li>Customers</li>
              <li>Website users and online service users</li>
            </ul>
          </section>

          {/* 3. Purposes */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. Purposes of Processing</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Provision and improvement of our online services and user experience</li>
              <li>Credit assessment and creditworthiness evaluation</li>
              <li>Contractual service delivery and customer support</li>
              <li>Contact management and communication</li>
              <li>Administrative and organisational procedures</li>
              <li>Interest-based and behavioural marketing</li>
              <li>Direct marketing (email, postal)</li>
              <li>Conversion measurement and range measurement</li>
              <li>Remarketing and target audience determination</li>
              <li>Cross-device tracking for marketing purposes</li>
              <li>User profiling</li>
              <li>Visit action evaluation</li>
              <li>Security measures</li>
            </ul>
          </section>

          {/* 4. Legal Basis */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. Legal Basis for Processing</h2>
            <p>We process personal data based on the following legal grounds under the GDPR:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li><strong className="text-white">Art. 6(1)(a) GDPR</strong> — User consent for specific purposes</li>
              <li><strong className="text-white">Art. 6(1)(b) GDPR</strong> — Processing necessary for contract performance or pre-contractual requests</li>
              <li><strong className="text-white">Art. 6(1)(c) GDPR</strong> — Compliance with legal obligations</li>
              <li><strong className="text-white">Art. 6(1)(f) GDPR</strong> — Legitimate interests of our organisation</li>
            </ul>
          </section>

          {/* 5. Cookies */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Cookies</h2>
            <p>
              Our website uses cookies — small text files stored on your device. We distinguish
              between:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li><strong className="text-white">Session cookies</strong> — deleted when you close your browser</li>
              <li><strong className="text-white">Persistent cookies</strong> — stored for up to 2 years for functionality and marketing</li>
            </ul>
            <p className="mt-3">
              Consent is obtained prior to use except where legally unnecessary. Our cookie consent
              procedure stores your opt-in status for up to 2 years. IP masking and pseudonymisation
              are employed where applicable.
            </p>
            <p className="mt-3">
              You can manage cookie preferences in your browser settings or via the following
              opt-out pages:
            </p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside">
              <li>
                <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  youronlinechoices.com
                </a>
              </li>
              <li>
                <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  optout.aboutads.info
                </a>
              </li>
            </ul>
          </section>

          {/* 6. Third-Party Services */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. Third-Party Services</h2>

            <h3 className="text-white font-medium mt-5 mb-2">Payment Processing</h3>
            <ul className="space-y-2">
              <li>
                <strong className="text-white">PayPal (Europe) S.&agrave; r.l.</strong> — Payment solutions.
                Privacy:{' '}
                <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  paypal.com/privacy
                </a>
              </li>
              <li>
                <strong className="text-white">Stripe Payments Europe, Limited</strong> — Payment services.
                Privacy:{' '}
                <a href="https://www.stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  stripe.com/privacy
                </a>
              </li>
            </ul>

            <h3 className="text-white font-medium mt-5 mb-2">Email &amp; Newsletter</h3>
            <ul className="space-y-2">
              <li>
                <strong className="text-white">CleverReach GmbH &amp; Co. KG</strong> — Email marketing platform.
                Privacy:{' '}
                <a href="https://www.cleverreach.com/de/datenschutz/" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  cleverreach.com/datenschutz
                </a>
              </li>
              <li>
                <strong className="text-white">Mailchimp (Rocket Science Group, LLC)</strong> — Email dispatch.
                Privacy:{' '}
                <a href="https://mailchimp.com/legal/" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  mailchimp.com/legal
                </a>.
                Transfer basis: Data Privacy Framework, standard contractual clauses.
              </li>
              <li>
                <strong className="text-white">Help Scout Inc.</strong> — Contact management.
                Privacy:{' '}
                <a href="https://www.helpscout.net/company/legal/privacy/" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  helpscout.net/privacy
                </a>
              </li>
            </ul>

            <h3 className="text-white font-medium mt-5 mb-2">Web Analytics</h3>
            <ul className="space-y-2">
              <li>
                <strong className="text-white">Google Analytics</strong> (Google Ireland Limited, Dublin) — Usage analysis with
                pseudonymous user identification and IP masking. Transfer basis: Data Privacy Framework, standard contractual clauses.
                Opt-out:{' '}
                <a href="https://tools.google.com/dlpage/gaoptout?hl=de" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  tools.google.com/dlpage/gaoptout
                </a>
              </li>
              <li>
                <strong className="text-white">Google Tag Manager</strong> (Google Ireland Limited) — Website tag management.
                Privacy:{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  policies.google.com/privacy
                </a>
              </li>
              <li>
                <strong className="text-white">etracker GmbH</strong> — Reach measurement.
                Privacy:{' '}
                <a href="https://www.etracker.com/datenschutz/" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  etracker.com/datenschutz
                </a>
              </li>
              <li>
                <strong className="text-white">Matomo</strong> — Privacy-focused analytics (with or without cookies). Cookie retention: max. 13 months.
                Website:{' '}
                <a href="https://matomo.org/" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  matomo.org
                </a>
              </li>
            </ul>

            <h3 className="text-white font-medium mt-5 mb-2">Online Marketing &amp; Advertising</h3>
            <ul className="space-y-2">
              <li>
                <strong className="text-white">Facebook Pixel / Custom Audiences</strong> (Meta Platforms Ireland Limited) —
                Used to determine visitors as a target group for ads displayed only to users showing interest.
                Transfer basis: Data Privacy Framework, standard contractual clauses.
                Privacy:{' '}
                <a href="https://www.facebook.com/about/privacy" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  facebook.com/about/privacy
                </a>
              </li>
              <li>
                <strong className="text-white">Google Ad Manager</strong> (Google Ireland Limited).
                Privacy:{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  policies.google.com/privacy
                </a>
              </li>
              <li>
                <strong className="text-white">Google Ads &amp; Conversion Measurement</strong> (Google Ireland Limited).
                Transfer basis: Data Privacy Framework, standard contractual clauses.
              </li>
            </ul>

            <h3 className="text-white font-medium mt-5 mb-2">Social Media Presence</h3>
            <ul className="space-y-2">
              <li>
                <strong className="text-white">Instagram</strong> (Meta Platforms Ireland Limited).
                Privacy:{' '}
                <a href="https://instagram.com/about/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  instagram.com/legal/privacy
                </a>
              </li>
              <li>
                <strong className="text-white">Facebook Pages</strong> (Meta Platforms Ireland Limited) — Joint responsibility agreement applies.
                Details:{' '}
                <a href="https://www.facebook.com/legal/terms/page_controller_addendum" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                  Page Controller Addendum
                </a>
              </li>
            </ul>
          </section>

          {/* 7. Newsletter */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Newsletter</h2>
            <p>
              Newsletter subscriptions require double opt-in confirmation. We log the IP address and
              confirmation time for proof of consent. We use web beacons to track open rates and link
              clicks for performance analysis based on legitimate interests. Every newsletter
              contains an unsubscribe link.
            </p>
          </section>

          {/* 8. Customer Accounts */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. Customer Accounts</h2>
            <p>
              IP addresses and access times are logged at registration for proof of consent. Users
              are responsible for data backup upon account termination. Customer accounts are not
              indexed by search engines.
            </p>
          </section>

          {/* 9. Data Retention */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. Data Retention</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Customer accounts: retained per legal archiving requirements (typically 10 years for tax)</li>
              <li>General commercial data: 4 years after contract expiration</li>
              <li>Newsletter unsubscribes: up to 3 years (legitimate interest in defence)</li>
              <li>Server log files: retained for security and stability purposes</li>
              <li>Cookies: generally up to 2 years unless specified otherwise</li>
              <li>Matomo cookies: maximum 13 months</li>
            </ul>
          </section>

          {/* 10. Your Rights */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. Your Rights</h2>
            <p>Under the GDPR (Articles 15–22), you have the right to:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
              <li>Rights related to automated decision-making</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{' '}
              <a href="mailto:contact@racespot.tv" className="text-rs-yellow hover:underline">
                contact@racespot.tv
              </a>.
            </p>
          </section>

          {/* 11. International Transfers */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">11. International Data Transfers</h2>
            <p>
              Where data is transferred outside the EU/EEA, we ensure appropriate safeguards in
              accordance with GDPR Articles 44–49 through:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>Standard contractual clauses (SCCs)</li>
              <li>Data Privacy Framework (DPF) certification for US companies</li>
              <li>EU Commission adequacy decisions</li>
              <li>Explicit user consent where required</li>
            </ul>
            <p className="mt-3">
              More information:{' '}
              <a href="https://www.dataprivacyframework.gov/" target="_blank" rel="noopener noreferrer" className="text-rs-yellow hover:underline">
                dataprivacyframework.gov
              </a>
            </p>
          </section>

          {/* 12. Security */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">12. Security Measures</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>SSL/HTTPS encryption for data transmission</li>
              <li>Physical and electronic access controls</li>
              <li>Confidentiality, integrity, and availability safeguards</li>
              <li>Data protection by design and default principles</li>
              <li>Procedures for breach response and user rights exercise</li>
            </ul>
          </section>

          {/* 13. Changes */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Material changes will be
              communicated to affected users.
            </p>
          </section>

          {/* Links */}
          <div className="border-t border-rs-border pt-8 flex flex-wrap gap-6">
            <Link href="/imprint" className="text-rs-yellow hover:underline text-sm">
              Imprint
            </Link>
            <Link href="/terms" className="text-rs-yellow hover:underline text-sm">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
