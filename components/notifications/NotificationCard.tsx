"use client";
import {
  MoreHorizontal,
  Trash2,
  User,
  ArrowRight,
  UserPlus,
  Bell,
  Check,
} from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { Notification } from "@/types/NotificationStore";
import { formatDistanceToNowStrict } from "date-fns";

const NotificationCard = ({
  notif,
  index,
}: {
  notif: Notification;
  index: number;
}) => {
  const formatTimeAgoShort = (dateString?: string) => {
    if (!dateString) return "";
    return (
      formatDistanceToNowStrict(new Date(dateString), { addSuffix: false })
        .replace("minutes", "m")
        .replace("minute", "m")
        .replace("hours", "h")
        .replace("hour", "h")
        .replace("seconds", "s")
        .replace("second", "s")
        .replace("days", "d")
        .replace("day", "d") + " ago"
    );
  };

  const firstName = notif?.data?.senderName.trim().split(/\s+/)[0] || "User";

  const getIcon = (type: string) => {
    if (type.includes("message")) {
      return (
        <span className="material-symbols-outlined text-[14px]!">chat</span>
      );
    }

    if (type === "proposal") {
      return (
        <span className="material-symbols-outlined text-[14px]!">
          swap_horiz
        </span>
      );
    }

    if (type === "review") {
      return (
        <span
          className="material-symbols-outlined text-amber-500"
          style={{
            fontVariationSettings: "'FILL' 1",
            fontSize: "18px",
          }}
        >
          star
        </span>
      );
    }

    return <Bell size={18} className="text-text-secondary" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, ease: "easeOut" }}
      className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
        notif.is_read
          ? "bg-surface/40 border-border/50 opacity-80 hover:opacity-100"
          : "bg-linear-to-r from-surface to-surface/80 border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      } hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5`}
    >
      {!notif.is_read && (
        <div className="absolute -left-px top-1/2 -translate-y-1/2 w-0.75 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
      )}

      <div className="relative shrink-0">
        <div
          className={`w-14 h-14 rounded-2xl overflow-hidden border-2 bg-background flex items-center justify-center transition-transform duration-500 group-hover:scale-105 ${
            notif.is_read ? "border-border" : "border-primary/20"
          }`}
        >
          {notif?.data?.senderImage ? (
            <img
              src={notif.data.senderImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={24} className="text-text-secondary/40" />
          )}
        </div>

        <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-primary text-white rounded-lg flex items-center justify-center border-2 border-background shadow-lg scale-90 group-hover:scale-100 transition-transform">
          {notif?.type.includes("proposal")
            ? getIcon("proposal")
            : notif?.type.includes("new_message")
              ? getIcon("message")
              : getIcon("notification")}
        </div>
      </div>

      <div className="flex-1 min-w-0 py-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-center">
            <h4
              className={`text-base font-bold tracking-tight truncate ${
                notif.is_read ? "text-text-primary/70" : "text-text-primary"
              }`}
            >
              {notif?.type.includes("proposal")
                ? `${firstName} sent a Proposal`
                : notif?.type.includes('message') ? (
                    `${firstName} sent a Message`
                ) : (
                    notif.title
                )
            }
            </h4>
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">
              {formatTimeAgoShort(notif.created_at)}
            </span>
          </div>

          <p className="text-sm font-medium text-text-secondary line-clamp-1 group-hover:text-text-primary/80 transition-colors">
            {notif.data?.proposalMsg || notif?.data?.msgPrev || notif.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 transition-all duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-9 h-9 flex items-center justify-center hover:bg-red-500/10 rounded-xl text-text-secondary hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
