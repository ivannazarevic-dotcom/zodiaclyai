import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import Navbar from '@/components/Navbar'
import Card from '@/components/ui/Card'

export default async function PrivacyPolicyPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen">
      <Navbar user={session} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: December 26, 2025</p>
        </div>

        <Card className="prose prose-invert max-w-none">
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                Welcome to Zodiacly ("we," "our," or "us"). We are committed to protecting your personal
                information and your right to privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our astrology services.
              </p>
              <p>
                By using Zodiacly, you agree to the collection and use of information in accordance with
                this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mb-3">2.1 Personal Information</h3>
              <p>When you register for an account, we collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email address</li>
                <li>Password (encrypted)</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Birth Data</h3>
              <p>To calculate your natal chart, we collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Date of birth</li>
                <li>Time of birth</li>
                <li>Place of birth (location coordinates)</li>
                <li>Timezone</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Usage Information</h3>
              <p>We automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and features used</li>
                <li>AI interpretation usage statistics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Calculate accurate natal charts based on your birth data</li>
                <li>Generate AI-powered astrological interpretations</li>
                <li>Process subscription payments</li>
                <li>Send service-related communications</li>
                <li>Improve our services and user experience</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage and Security</h2>
              <p>
                Your birth data and personal information are stored securely in encrypted databases.
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted password storage using bcrypt</li>
                <li>Secure database access controls</li>
                <li>Regular security audits</li>
                <li>GDPR-compliant data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>

              <h3 className="text-xl font-semibold text-white mb-3">5.1 Stripe</h3>
              <p>
                We use Stripe for payment processing. Stripe may collect and process your payment
                information in accordance with their{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cosmic-primary hover:underline">
                  Privacy Policy
                </a>.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 OpenAI</h3>
              <p>
                We use OpenAI's API to generate astrological interpretations. Your birth data and
                calculated chart positions are sent to OpenAI for processing. OpenAI's data usage
                is governed by their{' '}
                <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cosmic-primary hover:underline">
                  Privacy Policy
                </a>.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.3 OpenStreetMap</h3>
              <p>
                We use OpenStreetMap's Nominatim service for location search. This service may
                collect your search queries and IP address.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights (GDPR)</h2>
              <p>Under GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Restriction:</strong> Restrict processing of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@zodiacly.online" className="text-cosmic-primary hover:underline">
                  privacy@zodiacly.online
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <p>We retain your data for as long as your account is active or as needed to provide services.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account data: Until account deletion</li>
                <li>Birth data and charts: Until account deletion or manual deletion</li>
                <li>Payment records: 7 years (legal requirement)</li>
                <li>Usage logs: 90 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Cookies</h2>
              <p>We use essential cookies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain your login session (httpOnly cookies)</li>
                <li>Remember your preferences</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="mt-4">
                We do not use tracking cookies or third-party advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 16 years of age. We do not knowingly
                collect personal information from children under 16. If you become aware that a child
                has provided us with personal data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries other than your country
                of residence. We ensure appropriate safeguards are in place for such transfers in
                compliance with GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <ul className="list-none space-y-2 mt-4">
                <li>Email: <a href="mailto:privacy@zodiacly.online" className="text-cosmic-primary hover:underline">privacy@zodiacly.online</a></li>
                <li>Contact Form: <Link href="/contact" className="text-cosmic-primary hover:underline">zodiacly.online/contact</Link></li>
              </ul>
            </section>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
