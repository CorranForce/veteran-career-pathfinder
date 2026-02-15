import { useState, useEffect } from "react";
import { CheckCircle2, MapPin } from "lucide-react";

interface Purchase {
  name: string;
  location: string;
  timeAgo: string;
  package: string;
}

const recentPurchases: Purchase[] = [
  { name: "Michael R.", location: "Texas", timeAgo: "2 hours ago", package: "Premium Package" },
  { name: "Sarah K.", location: "California", timeAgo: "4 hours ago", package: "Premium Package" },
  { name: "James T.", location: "Florida", timeAgo: "5 hours ago", package: "Premium Package" },
  { name: "David M.", location: "Virginia", timeAgo: "7 hours ago", package: "Premium Package" },
  { name: "Robert L.", location: "North Carolina", timeAgo: "9 hours ago", package: "Premium Package" },
  { name: "Jennifer W.", location: "Georgia", timeAgo: "11 hours ago", package: "Premium Package" },
  { name: "Christopher B.", location: "Arizona", timeAgo: "13 hours ago", package: "Premium Package" },
  { name: "Amanda S.", location: "Colorado", timeAgo: "15 hours ago", package: "Premium Package" },
  { name: "Daniel P.", location: "Washington", timeAgo: "17 hours ago", package: "Premium Package" },
  { name: "Jessica H.", location: "Tennessee", timeAgo: "19 hours ago", package: "Premium Package" },
];

export function SocialProof() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // Wait for fade out, then change content
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % recentPurchases.length);
        setIsVisible(true);
      }, 500);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentPurchase = recentPurchases[currentIndex];

  return (
    <div className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Join Veterans Who've Already Started Their Transition</h3>
            <p className="text-muted-foreground">Real veterans getting real results</p>
          </div>

          <div 
            className={`bg-card border-2 border-accent/20 rounded-lg p-6 shadow-lg transition-opacity duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Avatar Placeholder */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                  {currentPurchase.name.charAt(0)}
                </div>
              </div>

              {/* Purchase Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg">{currentPurchase.name}</span>
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <p className="text-sm text-muted-foreground">
                  purchased <span className="font-medium text-foreground">{currentPurchase.package}</span>
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{currentPurchase.location}</span>
                  </div>
                  <span>•</span>
                  <span>{currentPurchase.timeAgo}</span>
                </div>
              </div>

              {/* Badge */}
              <div className="hidden sm:block">
                <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                  Verified Purchase
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-3xl font-bold text-primary">847+</div>
              <div className="text-sm text-muted-foreground mt-1">Veterans Helped</div>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground mt-1">Average Rating</div>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-3xl font-bold text-primary">94%</div>
              <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
