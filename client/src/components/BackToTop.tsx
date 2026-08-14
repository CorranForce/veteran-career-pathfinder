import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export const BACK_TO_TOP_SCROLL_THRESHOLD = 480;

export function shouldShowBackToTop(scrollY: number): boolean {
  return scrollY >= BACK_TO_TOP_SCROLL_THRESHOLD;
}

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(() =>
    typeof window !== "undefined" && shouldShowBackToTop(window.scrollY)
  );

  useEffect(() => {
    const updateVisibility = () => setIsVisible(shouldShowBackToTop(window.scrollY));

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-4 sm:left-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ChevronUp className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
