import { Compass } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pathfinder</span>
          </a>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 15, 2026</p>
          <Separator className="mb-10" />

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">

            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Pathfinder ("we," "our," or "us"). We are committed to protecting your personal
                information and your right to privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our website at{" "}
                <a href="https://pathfinder.casa" className="text-primary underline underline-offset-2">
                  pathfinder.casa
                </a>{" "}
                and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Account information:</strong> name, email address, and password when you create an account.</li>
                <li><strong className="text-foreground">Profile information:</strong> profile picture, military branch, MOS/rate, and career details you choose to provide.</li>
                <li><strong className="text-foreground">Payment information:</strong> billing details processed securely through Stripe. We do not store full card numbers.</li>
                <li><strong className="text-foreground">Communications:</strong> messages you send us and email subscription preferences.</li>
                <li><strong className="text-foreground">Usage data:</strong> pages visited, features used, and interactions with our service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide, operate, and improve our services</li>
                <li>Process transactions and send related information (receipts, confirmations)</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Send marketing communications (only with your consent; you may opt out at any time)</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage trends to improve user experience</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Sharing of Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share
                your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Service providers:</strong> Stripe (payments), SendGrid (email), and cloud infrastructure providers who assist in operating our service.</li>
                <li><strong className="text-foreground">Legal requirements:</strong> when required by law or to protect the rights, property, or safety of Pathfinder, our users, or the public.</li>
                <li><strong className="text-foreground">Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, with notice provided to you.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and
                hold certain information. Cookies are files with a small amount of data that may include
                an anonymous unique identifier. You can instruct your browser to refuse all cookies or
                to indicate when a cookie is being sent. However, if you do not accept cookies, some
                portions of our service may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as your account is active or as needed
                to provide you services. You may request deletion of your account and associated data
                at any time by contacting us. We will respond to deletion requests within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your
                personal information against unauthorized access, alteration, disclosure, or destruction.
                These measures include encrypted data transmission (HTTPS), hashed passwords, and
                access controls. However, no method of transmission over the internet is 100% secure,
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Access:</strong> request a copy of the personal data we hold about you.</li>
                <li><strong className="text-foreground">Correction:</strong> request that we correct inaccurate or incomplete data.</li>
                <li><strong className="text-foreground">Deletion:</strong> request that we delete your personal data.</li>
                <li><strong className="text-foreground">Opt-out:</strong> unsubscribe from marketing emails at any time using the link in any email.</li>
                <li><strong className="text-foreground">Portability:</strong> request a machine-readable copy of your data.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:support@pathfinder.casa" className="text-primary underline underline-offset-2">
                  support@pathfinder.casa
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service may contain links to third-party websites. We have no control over the
                content, privacy policies, or practices of any third-party sites and assume no
                responsibility for them. We encourage you to review the privacy policy of every site
                you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not directed to individuals under the age of 13. We do not knowingly
                collect personal information from children under 13. If you become aware that a child
                has provided us with personal information, please contact us and we will take steps to
                delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new policy on this page and updating the "Last updated" date. You are
                advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:support@pathfinder.casa" className="text-primary underline underline-offset-2">
                  support@pathfinder.casa
                </a>.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Pathfinder</span>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-foreground transition-colors font-medium text-primary">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
          </div>
          <p>© {new Date().getFullYear()} Pathfinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
