import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Compass } from "lucide-react";

interface MobileNavProps {
  onScrollToPrompt: () => void;
}

export default function MobileNav({ onScrollToPrompt }: MobileNavProps) {
  const [open, setOpen] = useState(false);

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
              className="justify-start text-lg mt-4"
              asChild
            >
              <a href="/pricing" onClick={() => setOpen(false)}>Get Started</a>
            </Button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
