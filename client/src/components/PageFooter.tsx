import { Compass } from "lucide-react";

export function PageFooter() {
  return (
    <footer className="py-12 border-t bg-card mt-auto">
      <div className="container mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <span className="font-semibold">Pathfinder</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Empowering veterans to translate their service into successful civilian careers
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pathfinder. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-t pt-6">
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
          <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
          <a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="mailto:support@pathfinder.casa" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
