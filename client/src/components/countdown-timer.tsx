import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

interface CountdownTimerProps {
  initialMinutes?: number;
  onExpire?: () => void;
}

export function CountdownTimer({ initialMinutes = 10, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      setTimeLeft(initialMinutes * 60); // Reset timer
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, initialMinutes, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 animate-bounce" />
            <span className="font-semibold">Limited Time Offer!</span>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="font-mono font-bold">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="text-center mt-1">
          <span className="text-sm">⚡ 83% OFF on All Plans - Ends Soon!</span>
        </div>
      </div>
    </div>
  );
}
