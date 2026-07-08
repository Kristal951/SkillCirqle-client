'use client'
import { useEffect, useState } from "react";

function PreviewCountdown({
  opensAt,
  onWindowOpen,
}: {
  opensAt: Date;
  onWindowOpen: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((opensAt.getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((opensAt.getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onWindowOpen();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [opensAt, onWindowOpen]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="text-center p-6 max-w-sm">
      <p className="text-text-secondary text-sm mb-2">Preview opens in</p>
      <p className="text-4xl font-bold text-text-primary tabular-nums">
        {mins}:{String(secs).padStart(2, "0")}
      </p>
    </div>
  );
}
