import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Compass } from "lucide-react";
import { getLoginUrl, getSignupUrl } from "@/const";

interface MobileNavProps {
  onScrollToPrompt: () => void;
}

export default function MobileNav({ onScrollToPrompt }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleNavClick = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pathfinder</span>
          </div>
          <nav className="flex flex-col gap-4">
            <Button 
              variant="ghost" 
              className="justify-start text-lg"
              onClick={() => handleNavClick(onScrollToPrompt)}
            >
              View Prompt
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-lg"
              asChild
            >
              <a href="/pricing" onClick={() => setOpen(false)}>Pricing</a>
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-lg"
              asChild
            >
              <a href="/blog" onClick={() => setOpen(false)}>Blog</a>
            </Button>
            {isAuthenticated ? (
              <Button 
                className="justify-start text-lg mt-4"
                asChild
              >
                <a href="/tools" onClick={() => setOpen(false)}>Dashboard</a>
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  className="justify-start text-lg mt-4"
                  asChild
                >
                  <a href="/login" onClick={() => setOpen(false)}>Login</a>
                </Button>
                <Button 
                  className="justify-start text-lg"
                  asChild
                >
                  <a href="/pricing" onClick={() => setOpen(false)}>Get Started</a>
                </Button>
              </>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
