"use client";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { Bell, UserPlus, MoreHorizontal, Check, Trash2 } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import NotificationCard from "@/components/notifications/NotificationCard";

const NotificationsPage = () => {
  const { notifications } = useNotificationsStore();

  return (
    <div className="w-full min-h-screen flex flex-col p-4 sm:p-8 bg-background">
      <div className="max-w-3xl w-full space-y-8">
        <div className="flex justify-between w-full  items-end">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Stay up to date with your latest skill swaps and community
              interactions.
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
            <Check size={14} />
            Mark all read
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <NotificationCard key={notif.id || index} index={index} notif={notif}/>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                <div className="w-20 h-20 bg-surface rounded-4xl border border-border flex items-center justify-center mb-4">
                  <Bell size={32} />
                </div>
                <h3 className="font-bold">All caught up</h3>
                <p className="text-xs">No new notifications at the moment.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
