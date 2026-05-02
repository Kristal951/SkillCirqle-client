"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Bell,
  CheckCheck,
  Inbox,
  Trash2,
  MessageCircle,
  Briefcase,
  Eye,
  EyeOff,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import NotificationCard from "@/components/notifications/NotificationCard";
import Spinner from "@/components/ui/Spinner";
import { Notification } from "@/types/NotificationStore";

type NotificationGroup = {
  today: Notification[];
  yesterday: Notification[];
  earlier: Notification[];
};

type FilterType = "unread" | "messages" | "proposals" | "all";

const NotificationsPage = () => {
  const {
    notifications,
    fetchNotifications,
    loading,
    markAllAsRead,
    deleteAllNotifications,
  } = useNotificationsStore();

  const { user } = useAuthStore();
  const userId = user?.id || "";

  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // ✅ Counts
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const readCount = useMemo(
    () => notifications.filter((n) => n.is_read).length,
    [notifications]
  );

  const proposalsCount = useMemo(
    () => notifications.filter((n) => n.type.includes("proposal")).length,
    [notifications]
  );

  const messagesCount = useMemo(
    () => notifications.filter((n) => n.type.includes("message")).length,
    [notifications]
  );

  useEffect(() => {
    if (userId) fetchNotifications(userId);
  }, [userId, fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAllAsRead) return;

    setIsMarkingAllAsRead(true);
    try {
      await markAllAsRead(userId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0 || isDeletingAll) return;

    setIsDeletingAll(true);
    try {
      await deleteAllNotifications(userId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filters = [
    { id: "all", label: "All", icon: Bell, count: notifications.length },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      count: messagesCount,
    },
    {
      id: "proposals",
      label: "Proposals",
      icon: Briefcase,
      count: proposalsCount,
    },
    { id: "unread", label: "Unread", icon: EyeOff, count: unreadCount },
  ];

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "messages":
        return notifications.filter((n) => n.type.includes("message"));
      case "proposals":
        return notifications.filter((n) =>
          n.type.includes("proposal")
        );
      case "unread":
        return notifications.filter((n) => !n.is_read);
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
   const groups: NotificationGroup = {
  today: [],
  yesterday: [],
  earlier: [],
};
    const now = new Date();

    filteredNotifications.forEach((notif) => {
      const date = new Date(notif.created_at);
      const diff = (Number(now) - Number(date)) / (1000 * 60 * 60 * 24);

      if (diff < 1) groups.today.push(notif);
      else if (diff < 2) groups.yesterday.push(notif);
      else groups.earlier.push(notif);
    });

    return groups;
  }, [filteredNotifications]);

  const emptyMessage: Record<FilterType, string> = {
    unread: "No unread notifications 🎉",
    messages: "No message notifications",
    proposals: "No proposals yet",
    all: "You're all caught up!",
  };

  return (
    <div className="w-full min-h-screen flex flex-col gap-10 bg-background py-8 px-6">
      <header className="flex flex-col items-center justify-center md:items-start md:justify-start gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col items-start justify-start">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-sm text-text-secondary">
              Stay updated with your activity
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-2 bg-surface/30 p-1.5 rounded-lg border-border border">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || isMarkingAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl hover:bg-surface"
              >
                {isMarkingAllAsRead ? (
                  <Spinner size={14} />
                ) : (
                  <CheckCheck size={14} />
                )}
                Mark Read
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-rose-500 hover:bg-rose-500/10"
              >
                {isDeletingAll ? <Spinner size={14} /> : <Trash2 size={14} />}
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-1 bg-surface/30 border border-border rounded-2xl w-fit">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            const Icon = filter.icon;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as FilterType)}
                className={`relative px-5 py-2 text-sm font-bold transition ${
                  isActive ? "text-white" : "text-text-secondary"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={14} />
                  {filter.label}
                  {filter.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20">
                      {filter.count}
                    </span>
                  )}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-primary rounded-xl"
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-4xl">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size={32} />
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="flex flex-col gap-6">
              {Object.entries(groupedNotifications).map(
                ([key, items]) => {
                  if (items.length === 0) return null;

                  const title =
                    key === "today"
                      ? "Today"
                      : key === "yesterday"
                      ? "Yesterday"
                      : "Earlier";

                  return (
                    <div key={key} className="flex flex-col gap-3">
                      <h2 className="text-xs font-bold text-text-secondary uppercase">
                        {title}
                      </h2>

                      {items.map((notif, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <NotificationCard notif={notif} index={index} />
                        </motion.div>
                      ))}
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <Inbox size={40} />
              <h3 className="mt-4 text-lg font-semibold">
                {emptyMessage[activeFilter]}
              </h3>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default NotificationsPage;