import { useState, useEffect } from "react";
import { Clock, Zap } from "lucide-react";

export function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Calculate time until end of day (midnight)
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const difference = endOfDay.getTime() - now.getTime();
      
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    // Update countdown every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4 px-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 animate-pulse" />
            <span className="font-bold text-lg">LIMITED TIME OFFER</span>
          </div>
          
          <div className="flex-1 text-center">
            <p className="text-sm md:text-base font-medium">
              🎯 Get Premium Package at Launch Price - Only 50 Spots Left This Month!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 rounded-lg px-4 py-2">
            <Clock className="h-5 w-5" />
            <div className="flex gap-1 font-mono font-bold text-lg">
              <span>{String(timeLeft.hours).padStart(2, "0")}</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
