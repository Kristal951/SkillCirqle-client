import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  X,
  Check,
  Trash2,
  MessageSquare,
  Heart,
  UserPlus,
  Loader2,
  MessageCircle,
  FileText,
  EyeOff,
  CalendarDays,
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
    fetchNotifications,
    loading,
    markAllAsRead,
    deleteAllNotifications,
  } = useNotificationsStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (userId) fetchNotifications(userId || "");
  }, [userId, fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

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

    {
      id: "unread",
      label: "Unread",
      icon: EyeOff,
      count: unreadCount,
    },
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
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [notifications, activeFilter]);

  const emptyMessage: Record<FilterType, string> = {
    unread: "No unread notifications",
    messages: "No message notifications",
    proposals: "No proposal notification yet",
    sessions: "No sessions notifications yet",
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
              className={`fixed top-0 right-0 h-screen w-full max-w-md bg-surface/80 shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center h-max justify-between py-6 px-4">
                <div className="flex h-full items-center gap-2">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-text-primary rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* {unreadCount > 0 && (
                    <button
                      //   onClick={markAllAsRead}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Clear unread
                    </button>
                  )} */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="hidden md:flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-hide">
                {filters.map((filter) => {
                  const isActive = activeFilter === filter.id;
                  const Icon = filter.icon;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as FilterType)}
                      className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 group select-none active:scale-[0.98] ${
                        isActive
                          ? "text-text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon
                          size={15}
                          className={`transition-transform duration-300 group-hover:scale-105 ${
                            isActive
                              ? "text-text-primary"
                              : "text-text-secondary/80 group-hover:text-text-primary"
                          }`}
                        />

                        <span>{filter.label}</span>

                        {filter.count > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors duration-300 ${
                              isActive
                                ? "bg-text-secondary/50 text-text-primary backdrop-blur-sm"
                                : "bg-text-primary/5 text-text-secondary group-hover:bg-text-primary/10"
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
                          className="absolute inset-0 bg-primary rounded-lg shadow-sm shadow-primary/20"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="h-[calc(100vh-70px)] overflow-y-auto divide-y mt-5">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                    <p className="text-sm">Loading updates...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                    <Bell className="w-12 h-12 mb-2 stroke-[1.5]" />
                    <h3 className="mt-4 text-lg font-semibold">
                      {emptyMessage[activeFilter]}
                    </h3>
                  </div>
                ) : (
                  <div className="w-full flex flex-col mb-22">
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
