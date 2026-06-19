"use client";

import { useChatStore } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { formatLastSeenShort } from "@/utils/formatTime";
import { EllipsisVertical, Phone, Video, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const { activeChat, setActiveChat } = useChatStore();
  const [tick, setTick] = useState(0);

  const [isInitializing, setIsInitializing] = useState(false);

  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);

  const router = useRouter();

  if (!activeChat) return null;

  const otherUserId = activeChat.other_user_id;
  const isOnline = onlineUsers.has(otherUserId);
  const typingList = typingUsers?.[activeChat.id] || [];

  const isTyping = otherUserId
    ? typingList.some((user) => user.id === otherUserId)
    : false;

  const lastSeenMap = useChatStore((s) => s.lastSeen);
  const lastSeen = lastSeenMap[otherUserId];

  const startSession = async (type: "audio" | "video") => {
    if (isInitializing) return;
    
    try {
      setIsInitializing(true);
      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: activeChat.id,
          callType: type,
          recipientId: otherUserId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create call session record");
      }

      const data = await response.json();
      router.push(`/sessions/video/${data.roomId}`);
    } catch (err) {
      console.error("Could not provision live session hardware link:", err);
      // Optional: Trigger a toast notification to the user here
    } finally {
      setIsInitializing(false);
    }
  };

  const getStatus = () => {
    if (isOnline) return "online";
    if (!lastSeen) return "offline";

    const diff = Date.now() - Number(lastSeen);
    const THRESHOLD = 30 * 1000;

    if (diff < THRESHOLD) return "offline";
    return "last_seen";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-between p-3 border-b border-border">
      <div className="flex gap-2 md:gap-3 items-center min-w-0">
        <button
          onClick={() => setActiveChat(null)}
          className="md:hidden p-1 -ml-1 hover:bg-surface rounded-full transition"
          disabled={isInitializing}
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
            ) : getStatus() === "online" ? (
              <span className="text-green-500">Online</span>
            ) : getStatus() === "offline" ? (
              <span className="text-text-secondary">Offline</span>
            ) : (
              <span className="text-text-secondary">
                {lastSeen
                  ? `Last seen ${formatLastSeenShort(lastSeen)} ago`
                  : "Offline"}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-1 md:gap-2 items-center">
        <button
          onClick={() => startSession("video")}
          disabled={isInitializing}
          className={`p-2 rounded-lg hover:bg-surface transition ${isInitializing ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          <Video className="w-5 h-5 text-text-secondary" />
        </button>

        <button
          onClick={() => startSession("audio")}
          disabled={isInitializing}
          className={`p-2 rounded-lg hover:bg-surface transition ${isInitializing ? "opacity-40 cursor-not-allowed" : ""}`}
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