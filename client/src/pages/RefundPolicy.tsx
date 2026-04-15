import { Compass } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function RefundPolicy() {
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
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Refund Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 15, 2026</p>
          <Separator className="mb-10" />

          {/* Highlight box */}
          <div className="bg-accent/20 border border-accent/40 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-semibold mb-2 text-accent-foreground">30-Day Money-Back Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed">
              We stand behind Pathfinder. If you are not completely satisfied with your purchase,
              you may request a full refund within <strong className="text-foreground">30 days</strong> of
              your original purchase date — no questions asked.
            </p>
          </div>

          <div className="space-y-8 text-foreground">

            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Eligibility for Refunds</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You are eligible for a full refund if:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your refund request is submitted within 30 days of the original purchase date.</li>
                <li>You have not violated our <a href="/terms" className="text-primary underline underline-offset-2">Terms of Service</a>.</li>
                <li>The purchase was made directly through Pathfinder (not through a third-party reseller).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Non-Refundable Items</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">The following are not eligible for refunds:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Purchases older than 30 days from the original purchase date.</li>
                <li>Accounts that have been suspended or terminated for Terms of Service violations.</li>
                <li>Promotional or discounted purchases where the refund policy was explicitly excluded at the time of purchase.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Subscription Cancellations</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your subscription at any time from your account settings. Cancellation
                stops future billing but does not automatically trigger a refund for the current billing
                period. If you cancel within 30 days of your initial subscription purchase, you may
                request a full refund under our money-back guarantee. Subsequent renewal charges are
                not eligible for refunds unless required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. How to Request a Refund</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To request a refund, please email us at{" "}
                <a href="mailto:support@pathfinder.casa" className="text-primary underline underline-offset-2">
                  support@pathfinder.casa
                </a>{" "}
                with the subject line <strong className="text-foreground">"Refund Request"</strong> and include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Your full name and the email address associated with your account.</li>
                <li>The date of purchase and the product or plan purchased.</li>
                <li>A brief reason for your refund request (optional but appreciated).</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We will process your request within <strong className="text-foreground">5 business days</strong>.
                Approved refunds will be credited to your original payment method. Depending on your
                card issuer, it may take an additional 5–10 business days for the refund to appear on
                your statement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Chargebacks</h2>
              <p className="text-muted-foreground leading-relaxed">
                We ask that you contact us before initiating a chargeback with your bank or credit
                card company. Chargebacks can result in account suspension and additional processing
                fees. We are committed to resolving any issues fairly and promptly through direct
                communication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this Refund Policy at any time. Changes will be
                effective immediately upon posting to this page. Your continued use of the Service
                after any changes constitutes your acceptance of the new policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have questions about our refund policy or would like to submit a refund request,
                please reach out:
              </p>
              <Button asChild>
                <a href="mailto:support@pathfinder.casa?subject=Refund Request">
                  Request a Refund
                </a>
              </Button>
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
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/refund" className="hover:text-foreground transition-colors font-medium text-primary">Refund Policy</a>
          </div>
          <p>© {new Date().getFullYear()} Pathfinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
