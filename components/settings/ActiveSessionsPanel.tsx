import React, { useEffect, useState } from "react";
import Spinner from "../ui/Spinner";
import { LogOut, Monitor, Trash2 } from "lucide-react";
import ActiveSessionsList from "./SessionCard";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

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
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>("");

  useEffect(() => {
    const fetchSessions = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();

      console.log(data);
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

  const handleSignOutAllDevices = async () => {
    try {
      setIsRevokingAll(true);

      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase.auth.signOut({
        scope: "others",
      });

      if (error) throw error;

      const res = await fetch("/api/user/session/revoke-all", {
        method: "POST",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSessions((prev) => prev.filter((session) => session.is_current));
    } catch (err) {
      console.error(err);
    } finally {
      setIsRevokingAll(false);
    }
  };

  const revokeSession = async (id: string) => {
    try {
      setRevokingId(id);

      const res = await fetch(`/api/user/session/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSessions((prev) => prev.filter((session) => session.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="col-span-2 md:bg-surface/50 lg:bg-surface/50 rounded-2xl flex flex-col md:p-6">
      <div className="w-full pt-4 pb-2 px-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 border border-primary/10 text-primary rounded-xl md:flex items-center justify-center shrink-0 shadow-sm hidden sm:flex">
            <Monitor size={20} className="stroke-2" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-text-primary">
              Active Sessions
            </h1>
            <p className="text-xs text-text-secondary/80 leading-normal">
              Manage and monitor your currently authenticated device profiles.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={handleSignOutAllDevices}
            disabled={isRevokingAll}
            className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold uppercase tracking-wider border rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]
              ${
                isRevokingAll
                  ? "bg-gray-500/5 text-gray-400/40 border-border/20 cursor-not-allowed"
                  : "text-red-500 bg-red-500/5 border-red-500/10 hover:border-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/5"
              }`}
          >
            <LogOut size={14} className={isRevokingAll ? "opacity-30" : ""} />
            <span>
              {isRevokingAll ? "Terminating..." : "Sign Out All Devices"}
            </span>
          </button>
        </div>
      </div>

      <div className="w-full py-5">
        {loading && sessions.length === 0 ? (
          <div className="w-full flex flex-col gap-3 aria-hidden='true'">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 md:p-5 flex items-center justify-between bg-surface/10 border border-border/5 rounded-2xl animate-pulse"
              >
                <div className="flex items-center gap-4 w-full min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-text-secondary/10 shrink-0" />

                  <div className="flex flex-col gap-2 w-full max-w-xs items-start">
                    <div className="h-4 bg-text-secondary/15 rounded-md w-3/4" />
                    <div className="flex gap-3 w-full">
                      <div className="h-3 bg-text-secondary/10 rounded-md w-1/3" />
                      <div className="h-3 bg-text-secondary/10 rounded-md w-1/4" />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div className="w-14 h-6 bg-text-secondary/10 rounded-full" />
                </div>
              </div>
            ))}
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
          <ActiveSessionsList
            sessions={sessions}
            onRevokeSession={revokeSession}
            revokingId={revokingId || ""}
          />
        )}
      </div>
    </div>
  );
};

export default ActiveSessionsPanel;
