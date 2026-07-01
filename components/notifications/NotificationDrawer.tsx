import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  X,
  Trash2,
  MessageSquare,
  Heart,
  UserPlus,
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
  const {
    notifications,
    loading,
    markAllAsRead,
    deleteAllNotifications,
  } = useNotificationsStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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
    { id: "messages", label: "Messages", icon: MessageCircle, count: messagesCount },
    { id: "sessions", label: "Sessions", icon: CalendarDays, count: sessionsCount },
    { id: "proposals", label: "Proposals", icon: FileText, count: proposalsCount },
    { id: "unread", label: "Unread", icon: EyeOff, count: unreadCount },
  ];

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
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [notifications, activeFilter]);

  const emptyMessage: Record<FilterType, string> = {
    unread: "No unread notifications",
    messages: "No message notifications",
    proposals: "No proposal notifications yet",
    sessions: "No session notifications yet",
    all: "You're all caught up!",
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
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity pointer-events-auto"
                onClick={() => setIsOpen(false)}
              />
            )}

            <div
              className={`fixed top-0 right-0 h-screen w-full max-w-md bg-surface/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto flex flex-col ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between pt-6 pb-4 px-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-text-primary">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-text-primary rounded-full shadow-sm shadow-primary/20">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsOpen(false)}
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
                      className={`relative px-3.5 py-2 text-xs font-bold rounded-lg transition-colors duration-200 focus-visible:outline-none group select-none shrink-0 ${
                        isActive
                          ? "text-text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon
                          size={14}
                          className={`transition-transform duration-200 group-hover:scale-105 ${
                            isActive ? "text-text-primary" : "text-text-secondary/70"
                          }`}
                        />
                        <span>{filter.label}</span>
                        {filter.count > 0 && (
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md transition-colors ${
                              isActive
                                ? "bg-text-secondary/30 text-text-primary"
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
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          className="absolute inset-0 bg-primary rounded-lg shadow-sm shadow-primary/20"
                        />
                      )}
                    </button>
                  );
                })}
              </div>


              <div className="w-full flex items-center justify-between px-4 py-2 border-b border-text-secondary/5 shrink-0">
                <button
                  onClick={() => markAllAsRead(userId || "")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 active:scale-95 transition-all"
                >
                  <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark all as read</span>
                </button>

                <button
                  onClick={() => deleteAllNotifications(userId || "")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Delete all</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-text-secondary/5">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-secondary py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium">Loading updates...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-secondary/60 py-12 px-6 text-center">
                    <div className="p-4 bg-text-primary/3 rounded-full mb-3">
                      <Bell className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      {emptyMessage[activeFilter]}
                    </h3>
                  </div>
                ) : (
                  <div className="w-full flex flex-col pb-12">
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