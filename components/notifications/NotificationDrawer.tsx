import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  X,
  Trash2,
  Loader2,
  MessageCircle,
  FileText,
  EyeOff,
  CalendarDays,
  CheckCheck,
} from "lucide-react";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import NotificationCard from "./NotificationCard";

type FilterType = "unread" | "messages" | "proposals" | "all" | "sessions";

const NotificationDrawer = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const { notifications, loading, markAllAsRead, deleteAllNotifications } =
    useNotificationsStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (!isOpen) setConfirmingDeleteAll(false);
  }, [isOpen]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const proposalsCount = useMemo(
    () => notifications.filter((n) => n.type.includes("proposal")).length,
    [notifications],
  );

  const messagesCount = useMemo(
    () => notifications.filter((n) => n.type.includes("message")).length,
    [notifications],
  );

  const sessionsCount = useMemo(
    () => notifications.filter((n) => n.type.includes("session")).length,
    [notifications],
  );

  const filters = [
    { id: "all", label: "All", icon: Bell, count: notifications.length },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      count: messagesCount,
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: CalendarDays,
      count: sessionsCount,
    },
    {
      id: "proposals",
      label: "Proposals",
      icon: FileText,
      count: proposalsCount,
    },
    { id: "unread", label: "Unread", icon: EyeOff, count: unreadCount },
  ] as const;

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    switch (activeFilter) {
      case "messages":
        filtered = notifications.filter((n) => n.type.includes("message"));
        break;
      case "proposals":
        filtered = notifications.filter((n) => n.type.includes("proposal"));
        break;
      case "sessions":
        filtered = notifications.filter((n) => n.type.includes("session"));
        break;
      case "unread":
        filtered = notifications.filter((n) => !n.is_read);
        break;
      default:
        filtered = notifications;
    }

    return [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [notifications, activeFilter]);

  const emptyMessage: Record<FilterType, string> = {
    unread: "No unread notifications.",
    messages: "No message notifications.",
    proposals: "No proposal notifications yet.",
    sessions: "No session notifications yet.",
    all: "You're all caught up.",
  };

  const handleDeleteAll = async () => {
    if (!confirmingDeleteAll) {
      setConfirmingDeleteAll(true);
      return;
    }

    setDeletingAll(true);
    try {
      await deleteAllNotifications(userId || "");
    } finally {
      setDeletingAll(false);
      setConfirmingDeleteAll(false);
    }
  };

  return (
    <div className="relative inline-block font-sans">
      {typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 pointer-events-none font-sans"
            style={{ zIndex: 99999 }}
          >
            {isOpen && (
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                onClick={() => setIsOpen(false)}
              />
            )}

            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Notifications"
              className={`fixed top-0 right-0 h-screen w-full max-w-md bg-surface border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto flex flex-col ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between pt-6 pb-4 px-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-text-primary">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-white rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount} new
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                  className="p-1.5 text-text-secondary rounded-lg hover:bg-text-primary/5 active:scale-95 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-hide shrink-0">
                {filters.map((filter) => {
                  const isActive = activeFilter === filter.id;
                  const Icon = filter.icon;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as FilterType)}
                      aria-pressed={isActive}
                      className={`relative px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group select-none shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon
                          size={14}
                          className={
                            isActive ? "text-white" : "text-text-secondary/70"
                          }
                        />
                        <span>{filter.label}</span>
                        {filter.count > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-text-primary/5 text-text-secondary"
                            }`}
                          >
                            {filter.count}
                          </span>
                        )}
                      </span>

                      {isActive && (
                        <motion.div
                          layoutId="activeFilterAnimationPill"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                          className="absolute inset-0 bg-primary rounded-lg"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="w-full flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
                {(unreadCount > 0 || notifications.length > 0) && (
                  <div className="w-full flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
                    <button
                      onClick={() => markAllAsRead(userId || "")}
                      disabled={unreadCount === 0}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all as read</span>
                    </button>

                    {confirmingDeleteAll ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirmingDeleteAll(false)}
                          className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAll}
                          disabled={deletingAll}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-60 transition-all"
                        >
                          {deletingAll ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Confirm delete</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleDeleteAll}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-500 hover:text-red-600 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete all</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-secondary py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                    <p className="text-sm">Loading notifications…</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-secondary/60 py-12 px-6 text-center">
                    <div className="p-4 bg-text-primary/5 rounded-full mb-3">
                      <Bell className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <h3 className="text-base font-medium text-text-primary">
                      {emptyMessage[activeFilter]}
                    </h3>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-0.5 pb-12 pt-1">
                    {filteredNotifications.map((notification, i) => (
                      <NotificationCard
                        notif={notification}
                        index={i}
                        key={notification.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default NotificationDrawer;
