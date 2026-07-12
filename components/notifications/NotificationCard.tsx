import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Trash2,
  Bell,
  MessageCircle,
  FileText,
  CalendarDays,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { getConversationById } from "@/utils/getConversationDetails";
import { useRouter } from "next/navigation";
import Spinner from "../ui/Spinner";

const NotificationCard = ({ notif, index }: { notif: any; index: number }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setActiveChat } = useChatStore();
  const { markAsRead, deleteNotification, deletingIds } =
    useNotificationsStore();

  const isDeleting = deletingIds.includes(notif.id);
  const isRead = notif.is_read;

  const getCategoryInfo = () => {
    if (notif.type.includes("proposal"))
      return { Icon: FileText, color: "text-amber-500" };
    if (notif.type.includes("message"))
      return { Icon: MessageCircle, color: "text-blue-500" };
    if (notif.type.includes("session"))
      return { Icon: CalendarDays, color: "text-emerald-500" };
    if (notif.type.includes("review"))
      return { Icon: Star, color: "text-purple-500" };
    return { Icon: Bell, color: "text-text-secondary" };
  };

  const { Icon, color } = getCategoryInfo();

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notif.id);
    if (notif.type.includes("message")) {
      const conv = await getConversationById(
        notif.data.conversationId,
        user?.id || "",
      );
      setActiveChat(conv);
    }
    router.push(notif.data.link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={handleAction}
      className={`relative flex gap-4 p-4 transition-all duration-200 cursor-pointer border-b border-border/50 last:border-0 hover:bg-surface/50 ${!isRead ? "bg-primary/10" : ""}`}
    >
      <div className="relative shrink-0 mt-0.5">
        <div className="w-10 h-10 rounded-full bg-background border border-border/50 flex items-center justify-center overflow-hidden">
          {notif.data?.senderImage ? (
            <img
              src={notif.data.senderImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon size={18} className={color} />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4
            className={`text-sm truncate font-semibold ${isRead ? "text-text-secondary" : "text-text-primary"}`}
          >
            {notif.type.includes("_received")
              ? `${notif.data.senderName} sent a proposal`
              : notif.title}
          </h4>
          <span className="text-[10px] text-text-secondary shrink-0 font-medium">
            {formatDistanceToNowStrict(new Date(notif.created_at), {
              addSuffix: true,
            })
              .replace(" minutes", "m")
              .replace(" hours", "h")
              .replace(" days", "d")}
          </span>
        </div>

        <p className="text-sm text-text-secondary/80 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.data?.msgPrev || notif.message}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNotification(notif.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-500/10 rounded-full text-text-secondary hover:text-rose-500 transition-opacity"
      >
        {isDeleting ? <Spinner size={14} /> : <Trash2 size={14} />}
      </button>
    </motion.div>
  );
};

export default NotificationCard;
