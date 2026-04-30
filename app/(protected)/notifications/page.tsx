"use client";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { Bell, CheckCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import NotificationCard from "@/components/notifications/NotificationCard";
import { useAuthStore } from "@/store/useAuthStore";
import Spinner from "@/components/ui/Spinner";
import BackButton from "@/components/ui/Back";

const NotificationsPage = () => {
  const { notifications, fetchNotifications, loading, markAllAsRead } =
    useNotificationsStore();
  const { user } = useAuthStore();
  const userId = user?.id || "";

  useEffect(() => {
    fetchNotifications(userId);
  }, []);

  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllAsRead(true);
    try {
      await markAllAsRead(userId);
    } catch (error) {
      console.log(error);
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-4 sm:p-8 bg-background">
      <div className="max-w-5xl w-full space-y-8">
        <div className="flex justify-between w-full items-end">
          <div className="flex flex-col gap-10">
            <div>
              <BackButton />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-text-primary">
                Notifications
              </h1>
              <p className="text-sm sm:text-base text-text-secondary">
                Stay up to date with your latest skill swaps and community
                interactions.
              </p>
            </div>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary bg-surface/50 hover:bg-surface rounded-lg transition-all"
          >
            {isMarkingAllAsRead ? (
              <Spinner size={20} />
            ) : (
              <div className="w-full flex items-center gap-2">
                <CheckCheck size={14} />
                <p> Mark all read</p>
              </div>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-3 max-w-2xl">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="w-full h-screen flex items-center justify-center">
                <Spinner size={30} />
              </div>
            ) : !loading && notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <NotificationCard
                  key={notif.id || index}
                  index={index}
                  notif={notif}
                />
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
