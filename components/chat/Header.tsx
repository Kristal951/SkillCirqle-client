"use client";

import { useChatStore } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { EllipsisVertical, Phone, Video, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const { activeChat, setActiveChat } = useChatStore();

  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);

  const router = useRouter();

  if (!activeChat) return null;

  const otherUserId = activeChat.other_user_id;

  const isOnline = onlineUsers.has(otherUserId);

  const typingList = typingUsers?.[activeChat.id] || [];

  const isTyping = otherUserId ? typingList.includes(otherUserId) : false;

  const startSession = async (type: "audio" | "video") => {
    const roomId = `${activeChat.id}-${Date.now()}`;
    router.push(`/sessions/video/${roomId}`);
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-between p-3 border-b border-border">
      <div className="flex gap-2 md:gap-3 items-center min-w-0">
        <button
          onClick={() => setActiveChat(null)}
          className="md:hidden p-1 -ml-1 hover:bg-surface rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-border">
            <img
              src={activeChat.avatar_url || "/default-avatar.png"}
              alt={activeChat.name}
              className="w-full h-full object-cover"
            />
          </div>

          {isOnline && (
            <span className="w-3 h-3 rounded-full bg-green-500 absolute bottom-0 right-0 border-2 border-background" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-semibold truncate">
            {activeChat.name}
          </h2>

          <p className="text-[10px] md:text-xs font-medium">
            {isTyping ? (
              <span className="text-text-primary animate-pulse">typing...</span>
            ) : isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              <span className="text-gray-400">Offline</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-1 md:gap-2 items-center">
        <button
          onClick={() => startSession("video")}
          className="p-2 rounded-lg hover:bg-surface transition"
        >
          <Video className="w-5 h-5 text-text-secondary" />
        </button>

        <button
          onClick={() => startSession("audio")}
          className="p-2 rounded-lg hover:bg-surface transition"
        >
          <Phone className="w-5 h-5 text-text-secondary" />
        </button>

        <button className="p-2 rounded-lg hover:bg-surface transition">
          <EllipsisVertical className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </div>
  );
};

export default Header;
