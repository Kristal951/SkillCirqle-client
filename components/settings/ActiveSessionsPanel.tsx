import React, { useEffect, useState } from "react";
import Spinner from "../ui/Spinner";
import { Trash2 } from "lucide-react";

type Session = {
  id: string;
  session_id: string;
  device_name: string;
  browser: string;
  os: string;
  ip_address: string;
  is_current: boolean;
  last_active: string;
  location: {
    country: string;
    city: string;
    region: string;
    timezone: string;
  };
};

const ActiveSessionsPanel = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDays < 7) return `${diffDays} day(s) ago`;

    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/user/session");
        const data = await res.json();

        setSessions(data.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="col-span-2 bg-surface/50 rounded-2xl flex flex-col p-6">
      <div className="w-full">
        <h1 className="text-4xl font-bold">Active Sessions</h1>
        <p className="text-text-secondary">Currently logged in devices</p>
      </div>

      <div className="w-full py-5">
        {loading && sessions.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <Spinner size={20} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="w-full h-40 flex flex-col items-center justify-center text-center gap-3">
            <span className="material-symbols-outlined text-text-secondary text-4xl">
              devices
            </span>

            <p className="text-sm font-semibold text-text-primary">
              No active sessions found
            </p>

            <p className="text-xs text-text-secondary max-w-xs">
              When you sign in on a new device, it will appear here.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-6 flex group items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-text-primary">
                      {session.device_name === "Desktop"
                        ? "desktop_windows"
                        : "smartphone"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      {session.os} • {session.location?.city || "Unknown"}
                    </p>

                    <p className="text-xs text-text-secondary">
                      {session.is_current
                        ? "Current Session"
                        : `Last active • ${formatLastActive(session.last_active)}`}
                    </p>
                  </div>
                </div>

                <button
                  className={`text-xs font-bold ${
                    session.is_current
                      ? "text-green-500 cursor-not-allowed"
                      : "text-red-500 group-hover:bg-red-500/20 rounded-lg p-2"
                  }`}
                >
                  {session.is_current ? (
                    <p>Active</p>
                  ) : (
                    <Trash2 className="text-sm" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSessionsPanel;
