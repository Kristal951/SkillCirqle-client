import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaChrome, FaFirefox, FaSafari, FaGlobe } from "react-icons/fa";

const BROWSER_ICONS = {
  chrome: <FaChrome className="text-blue-500" size={24} />,
  firefox: <FaFirefox className="text-orange-500" size={24} />,
  safari: <FaSafari className="text-blue-400" size={24} />,
  other: <FaGlobe className="text-gray-400" size={24} />,
};

const BlockedNotificationsHelp = ({ onClose }: { onClose: () => void }) => {
  const [browser, setBrowser] = useState<keyof typeof BROWSER_ICONS>("other");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("firefox")) setBrowser("firefox");
    else if (ua.includes("chrome") || ua.includes("edg")) setBrowser("chrome");
    else if (ua.includes("safari")) setBrowser("safari");
    else setBrowser("other");
  }, []);

  const steps = {
    chrome: [
      "Click the lock icon (left of the URL bar)",
      'Find "Notifications" and switch to "Allow"',
      "Refresh this page",
    ],
    firefox: [
      "Click the lock icon (left of the URL bar)",
      'Click the "x" next to "Blocked" for Notifications',
      "Refresh this page",
    ],
    safari: [
      "Open Safari Settings (Cmd + ,)",
      'Go to "Websites" > "Notifications"',
      'Find this site and toggle "Allow"',
    ],
    other: [
      "Open your browser's site settings",
      'Find "Notifications" and set to "Allow"',
      "Refresh this page",
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-surface rounded-3xl shadow-2xl p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-background rounded-2xl mb-3">
            {BROWSER_ICONS[browser]}
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            Notifications Blocked
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Browser permissions are currently restricted. Please enable them to
            receive updates.
          </p>
        </div>

        <div className="bg-background rounded-2xl p-4 mb-6">
          <ol className="space-y-4">
            {steps[browser].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-primary">
                <span className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-text-primary font-bold text-xs">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-primary/80 text-text-primary py-3 font-semibold hover:bg-primary transition active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default BlockedNotificationsHelp