import { useState, useEffect } from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface DemoSessionBannerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export function DemoSessionBanner({ expiresAt, onExpired }: DemoSessionBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expireTime = new Date(expiresAt).getTime();
      const diff = expireTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        onExpired?.();
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (isExpired) {
    return null;
  }

  return (
    <div className="w-full bg-orange-500 border-b-2 border-orange-600 px-4 py-3 text-white">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">
            Demo Mode Active - Your data will reset when the timer expires
          </p>
          <p className="text-xs text-orange-100 mt-1">
            Any changes you make will not be saved after this session ends.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-orange-600 rounded px-3 py-1 flex-shrink-0">
          <Clock className="h-4 w-4" />
          <span className="font-mono font-semibold text-sm">{timeRemaining}</span>
        </div>
      </div>
    </div>
  );
}
