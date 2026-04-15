import { Compass } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
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
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 15, 2026</p>
          <Separator className="mb-10" />

          <div className="space-y-8 text-foreground">

            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Pathfinder ("the Service") at{" "}
                <a href="https://pathfinder.casa" className="text-primary underline underline-offset-2">
                  pathfinder.casa
                </a>
                , you agree to be bound by these Terms of Service ("Terms"). If you do not agree to
                these Terms, please do not use the Service. These Terms apply to all visitors, users,
                and others who access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pathfinder is an AI-powered career transition platform designed to help military
                veterans translate their service experience into civilian career opportunities. The
                Service provides AI-generated career guidance, resume tools, interview preparation
                resources, and related content. The Service is intended for informational and
                educational purposes only and does not constitute professional career counseling,
                legal, or financial advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To access certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and accept responsibility for all activity under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Not share your account credentials with any third party</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                We reserve the right to terminate accounts that violate these Terms or engage in
                fraudulent, abusive, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Subscriptions and Payments</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Pathfinder offers free and paid subscription tiers. By subscribing to a paid plan:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You authorize us to charge your payment method on a recurring basis for the selected subscription period.</li>
                <li>Subscription fees are billed in advance and are non-refundable except as described in our <a href="/refund" className="text-primary underline underline-offset-2">Refund Policy</a>.</li>
                <li>You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period.</li>
                <li>We reserve the right to change subscription prices with 30 days' notice.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                All payments are processed securely through Stripe. We do not store your full payment
                card details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the intellectual property rights of others</li>
                <li>Transmit any harmful, offensive, or unlawful content</li>
                <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure</li>
                <li>Use automated tools to scrape, crawl, or extract data from the Service without permission</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                <li>Engage in any activity that disrupts or interferes with the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are and will remain
                the exclusive property of Pathfinder and its licensors. Our trademarks and trade dress
                may not be used in connection with any product or service without the prior written
                consent of Pathfinder. Content you create using the Service (such as generated resumes
                or career plans) belongs to you; however, you grant us a non-exclusive license to use
                such content to improve and operate the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. AI-Generated Content Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service uses artificial intelligence to generate career guidance and related
                content. AI-generated content may contain inaccuracies, errors, or outdated
                information. Pathfinder does not warrant the accuracy, completeness, or suitability
                of any AI-generated content for any particular purpose. You should independently
                verify any career, legal, or financial information before acting on it. Pathfinder
                is not responsible for any decisions you make based on AI-generated content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by applicable law, Pathfinder shall not be liable
                for any indirect, incidental, special, consequential, or punitive damages, including
                but not limited to loss of profits, data, use, goodwill, or other intangible losses,
                resulting from your use of or inability to use the Service. In no event shall our
                total liability to you exceed the amount you paid us in the twelve months preceding
                the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties
                of any kind, either express or implied, including but not limited to implied warranties
                of merchantability, fitness for a particular purpose, or non-infringement. We do not
                warrant that the Service will be uninterrupted, error-free, or free of viruses or
                other harmful components.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the
                United States, without regard to its conflict of law provisions. Any disputes arising
                under these Terms shall be resolved through binding arbitration in accordance with
                the rules of the American Arbitration Association.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of
                significant changes by updating the "Last updated" date and, where appropriate,
                notifying you by email. Your continued use of the Service after changes become
                effective constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at{" "}
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
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors font-medium text-primary">Terms of Service</a>
            <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
          </div>
          <p>© {new Date().getFullYear()} Pathfinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
