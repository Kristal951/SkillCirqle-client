"use client";

import React, { useMemo, useState } from "react";
import {
  Monitor,
  Smartphone,
  MapPin,
  Network,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Spinner from "../ui/Spinner";

interface SessionLocation {
  city?: string;
  country?: string;
}

interface Session {
  id: string;
  device_name: "Desktop" | "Mobile" | string;
  os: string;
  browser?: string;
  location: SessionLocation;
  ip_address?: string;
  is_current: boolean;
  last_active: string;
}

interface ActiveSessionsListProps {
  sessions: Session[];
  onRevokeSession?: (id: string) => void;
  revokingId: string;
}

const SESSIONS_PER_PAGE = 5;

export default function ActiveSessionsList({
  sessions = [],
  onRevokeSession,
  revokingId,
}: ActiveSessionsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sessions.length / SESSIONS_PER_PAGE);

  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * SESSIONS_PER_PAGE;
    const end = start + SESSIONS_PER_PAGE;

    return sessions.slice(start, end);
  }, [sessions, currentPage]);

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

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-col gap-3">
        {paginatedSessions.map((session) => (
          <div
            key={session.id}
            className="p-4 md:p-5 flex group items-center justify-between md:rounded-2xl lg:rounded-2xl rounded-xl transition-all duration-200 md:hover:bg-surface/40 bg-surface/40 lg:hover:bg-surface/40"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 relative rounded-xl bg-background/60 border border-border/40 text-text-primary flex items-center justify-center shrink-0 shadow-inner">
                {session.device_name === "Desktop" ? (
                  <Monitor size={18} className="text-text-primary/80" />
                ) : (
                  <Smartphone size={18} className="text-text-primary/80" />
                )}

                {session.is_current && (
                  <span className="bg-green-500 bottom-0 right-0 absolute w-2 h-2 rounded-full" />
                )}
              </div>

              <div className="flex flex-col gap-1 items-start min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">
                  {session.os} • {session.browser || "Unknown Browser"}
                </p>

                <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-text-secondary font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-text-secondary" />

                    <span>
                      {session.location?.city || "Unknown"},{" "}
                      {session.location?.country || "Unknown"}
                    </span>
                  </span>

                  {!session.is_current && (
                    <span className="md:hidden lg:hidden flex items-center gap-1">
                      <Clock size={13} className="text-text-secondary" />

                      <span>
                        {formatLastActive(session.last_active)}
                      </span>
                    </span>
                  )}

                  <span className="md:flex lg:flex hidden items-center gap-1">
                    <Network size={13} className="text-text-secondary" />

                    <span className="font-mono">
                      {session.ip_address || "Unknown IP"}
                    </span>
                  </span>

                  {!session.is_current && (
                    <span className="md:flex lg:flex hidden items-center gap-1">
                      <Clock size={13} className="text-text-secondary" />

                      <span>
                        {formatLastActive(session.last_active)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              {!session.is_current && (
                <button
                  type="button"
                  onClick={() => onRevokeSession?.(session.id)}
                  disabled={revokingId === session.id}
                  className="p-2 disabled:opacity-50 text-text-secondary/60 hover:text-red-500 bg-transparent hover:bg-red-500/10 border border-transparent hover:border-red-500/10 rounded-xl transition-all active:scale-95"
                  title="Revoke session authority"
                >
                  {revokingId === session.id ? (
                    <Spinner size={20} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-secondary font-medium">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center disabled:opacity-40 hover:bg-surface-container-high transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages),
                )
              }
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center disabled:opacity-40 hover:bg-surface-container-high transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}