"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Monitor, Smartphone, Tablet, ShieldCheck, Radio, MapPin, Clock, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { groupSessionsByDevice } from "@/utils/groupSessions";
import { formatDistanceToNow } from "date-fns";
import {
  useRevokeAllSessions,
  useRevokeSession,
  useSessions,
} from "@/hooks/useUserAccountSessions";

function DeviceIcon({ device }: { device: string }) {
  const d = device.toLowerCase();
  if (d.includes("iphone") || d.includes("android") || d.includes("mobile"))
    return <Smartphone size={20} className="text-primary" />;
  if (d.includes("ipad") || d.includes("tablet"))
    return <Tablet size={20} className="text-primary" />;
  return <Monitor size={20} className="text-primary" />;
}

const DEVICES_PER_PAGE = 5;
const SESSIONS_PER_PAGE = 5;

const ActiveSessionsPanel = () => {
  const { data: sessions = [], isLoading } = useSessions();
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession();
  const { mutate: revokeAll, isPending: isRevokingAll } = useRevokeAllSessions();
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [devicePage, setDevicePage] = useState(0);
  const [sessionPage, setSessionPage] = useState(0);
  
  const groupedSessions = groupSessionsByDevice(sessions);
  const otherDeviceCount = sessions.filter((s) => !s.is_current).length;

  const deviceCards = Object.entries(groupedSessions).map(([device, deviceSessions]) => {
    const current = deviceSessions.find((s) => s.is_current);
    const mostRecent = [...deviceSessions].sort(
      (a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime(),
    )[0];
    const representative = current ?? mostRecent;
    const revocableIds = deviceSessions.filter((s) => !s.is_current).map((s) => s.id);

    return {
      device,
      representative,
      sessionCount: deviceSessions.length,
      revocableIds,
      isCurrent: !!current,
      deviceSessions,
    };
  });

  const totalDevicePages = Math.max(1, Math.ceil(deviceCards.length / DEVICES_PER_PAGE));
  const safeDevicePage = Math.min(devicePage, totalDevicePages - 1);
  const paginatedDeviceCards = deviceCards.slice(
    safeDevicePage * DEVICES_PER_PAGE,
    safeDevicePage * DEVICES_PER_PAGE + DEVICES_PER_PAGE,
  );

  const handleExpandDevice = (device: string) => {
    setSessionPage(0);
    setExpandedDevice((prev) => (prev === device ? null : device));
  };

  const handleSignOutAllDevices = async () => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (!error) revokeAll();
  };

  return (
    <div className="col-span-2 bg-surface/40 px-3 py-6 rounded-2xl flex flex-col md:p-8 md:border md:border-border/10">
      <div className="w-full pb-6 px-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-primary/15 to-primary/5 border border-primary/10 text-primary rounded-2xl md:flex items-center justify-center shrink-0 shadow-sm hidden sm:flex">
            <Monitor size={20} className="stroke-2" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-text-primary">
              Active Sessions
            </h1>
            <p className="text-xs text-text-secondary/80 leading-normal">
              {deviceCards.length > 0
                ? `Signed in on ${deviceCards.length} device${deviceCards.length > 1 ? "s" : ""}`
                : "Manage and monitor your authenticated devices."}
            </p>
          </div>
        </div>

        {otherDeviceCount > 0 && (
          <button
            type="button"
            onClick={handleSignOutAllDevices}
            disabled={isRevokingAll}
            className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold uppercase tracking-wider border rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shrink-0
              ${
                isRevokingAll
                  ? "bg-gray-500/5 text-gray-400/40 border-border/20 cursor-not-allowed"
                  : "text-red-500 bg-red-500/5 border-red-500/10 hover:border-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/5"
              }`}
          >
            <LogOut size={14} className={isRevokingAll ? "opacity-30" : ""} />
            <span>
              {isRevokingAll ? "Terminating..." : "Sign All Other Sessions"}
            </span>
          </button>
        )}
      </div>

      <div className="w-full py-6">
        {isLoading && sessions.length === 0 ? (
          <div className="w-full flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 flex items-center justify-between bg-surface/10 border border-border/5 rounded-2xl animate-pulse"
              >
                <div className="flex items-center gap-4 w-full min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-text-secondary/10 shrink-0" />
                  <div className="flex flex-col gap-2 w-full max-w-sm items-start">
                    <div className="h-4 bg-text-secondary/15 rounded-md w-1/2" />
                    <div className="h-3 bg-text-secondary/10 rounded-md w-2/3" />
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <div className="w-20 h-8 bg-text-secondary/10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : deviceCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full py-20 flex flex-col items-center justify-center text-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-text-secondary/5 border border-border/10 flex items-center justify-center mb-1">
              <Monitor size={28} className="text-text-secondary/50" />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              No active sessions found
            </p>
            <p className="text-xs text-text-secondary max-w-xs">
              When you sign in on a new device, it will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {paginatedDeviceCards.map(({ device, representative, sessionCount, revocableIds, isCurrent, deviceSessions }) => {
                const isExpanded = expandedDevice === device;
                const canExpand = sessionCount > 1;
                const totalSessionPages = Math.max(1, Math.ceil(deviceSessions.length / SESSIONS_PER_PAGE));
                const paginatedSessions = deviceSessions.slice(
                  sessionPage * SESSIONS_PER_PAGE,
                  sessionPage * SESSIONS_PER_PAGE + SESSIONS_PER_PAGE,
                );

                return (
                  <motion.div
                    key={device}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="bg-background/40 border border-border/10 rounded-2xl overflow-hidden hover:border-border/30 transition-colors"
                  >
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <DeviceIcon device={device} />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2- w-full justify-between flex-wrap">
                          <span className="text-sm font-bold text-text-primary">
                            {device}
                          </span>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <Radio size={10} className="animate-pulse" />
                              This device
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 flex-wrap text-xs text-text-secondary/70">
                          {representative?.location?.city && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={12} />
                              {representative.location.city}
                              {representative.location.country ? `, ${representative.location.country}` : ""}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {isCurrent
                              ? "Active now"
                              : `Active ${formatDistanceToNow(new Date(representative.last_active), { addSuffix: true })}`}
                          </span>
                        </div>

                        {canExpand && (
                          <button
                            onClick={() => handleExpandDevice(device)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-primary/80 hover:text-primary transition-colors mt-1 w-fit"
                          >
                            <motion.span
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex"
                            >
                              <ChevronDown size={12} />
                            </motion.span>
                            {isExpanded
                              ? "Hide sessions"
                              : `Show ${sessionCount} sessions on this device`}
                          </button>
                        )}
                      </div>

                      {!isCurrent && revocableIds.length > 0 && (
                        <button
                          onClick={() => revocableIds.forEach((id) => revokeSession(id))}
                          disabled={isRevoking}
                          className="shrink-0 px-4 py-2 text-xs font-bold rounded-xl border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Revoke
                        </button>
                      )}
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-border/10"
                        >
                          <div className="p-3 flex flex-col gap-1 bg-surface/20">
                            {paginatedSessions.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-background/40 transition-colors"
                              >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-text-primary truncate">
                                      {s.browser || "Unknown browser"}
                                      {s.os ? ` · ${s.os}` : ""}
                                    </span>
                                    {s.is_current && (
                                      <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-500">
                                        current
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-text-secondary/60">
                                    {s.is_current
                                      ? "Active now"
                                      : `Active ${formatDistanceToNow(new Date(s.last_active), { addSuffix: true })}`}
                                  </span>
                                </div>

                                {!s.is_current && (
                                  <button
                                    onClick={() => revokeSession(s.id)}
                                    disabled={isRevoking}
                                    aria-label="Revoke this session"
                                    className="shrink-0 p-1.5 rounded-lg text-text-secondary/50 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}

                            {totalSessionPages > 1 && (
                              <div className="flex items-center justify-between px-3 pt-2">
                                <span className="text-[11px] text-text-secondary/50">
                                  Page {sessionPage + 1} of {totalSessionPages}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setSessionPage((p) => Math.max(0, p - 1))}
                                    disabled={sessionPage === 0}
                                    className="p-1.5 rounded-lg text-text-secondary/60 hover:text-text-primary hover:bg-background/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Previous sessions page"
                                  >
                                    <ChevronLeft size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setSessionPage((p) => Math.min(totalSessionPages - 1, p + 1))
                                    }
                                    disabled={sessionPage >= totalSessionPages - 1}
                                    className="p-1.5 rounded-lg text-text-secondary/60 hover:text-text-primary hover:bg-background/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Next sessions page"
                                  >
                                    <ChevronRight size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {totalDevicePages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-text-secondary/50">
                  Page {safeDevicePage + 1} of {totalDevicePages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDevicePage((p) => Math.max(0, p - 1))}
                    disabled={safeDevicePage === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-text-secondary/70 hover:text-text-primary hover:bg-background/60 border border-border/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>
                  <button
                    onClick={() => setDevicePage((p) => Math.min(totalDevicePages - 1, p + 1))}
                    disabled={safeDevicePage >= totalDevicePages - 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-text-secondary/70 hover:text-text-primary hover:bg-background/60 border border-border/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 justify-center pt-4">
              <ShieldCheck size={12} className="text-text-secondary/40" />
              <p className="text-[11px] text-text-secondary/50">
                Don't recognize a device? Revoke it immediately and change your password.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSessionsPanel;