"use client";

import { useChatStore } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { formatLastSeenShort } from "@/utils/formatTime";
import {
  EllipsisVertical,
  ChevronLeft,
  Image as ImageIcon,
  User,
  BellOff,
  Bell,
  Trash2,
  Ban,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";
import { useMediaViewer } from "@/store/useMediaViewer";

const Header = () => {
  const { activeChat, setActiveChat, messages } = useChatStore();
  const lastSeenMap = useChatStore((s) => s.lastSeen);
  const [tick, setTick] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [confirmingBlock, setConfirmingBlock] = useState(false);

  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { openViewer } = useMediaViewer();

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmingClear(false);
        setConfirmingBlock(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!activeChat) return null;

  const otherUserId = activeChat.other_user_id;
  const isOnline = onlineUsers.has(otherUserId);
  const typingList = typingUsers?.[activeChat.id] || [];

  const isTyping = otherUserId
    ? typingList.some((user) => user.id === otherUserId)
    : false;

  const lastSeen = lastSeenMap[otherUserId];

  const getStatus = () => {
    if (isOnline) return "online";
    if (!lastSeen) return "offline";

    const diff = Date.now() - Number(lastSeen);
    const THRESHOLD = 30 * 1000;

    if (diff < THRESHOLD) return "offline";
    return "last_seen";
  };

  const chatMedia = (messages[activeChat.id] || [])
    .flatMap((msg) => msg.metadata?.media || [])
    .filter((m) => m.type === "image")
    .map((m) => ({ url: m.url, name: m.name }));

  const handleViewMedia = () => {
    setMenuOpen(false);
    if (chatMedia.length === 0) {
      toast.info("No media yet", "No images have been shared in this conversation.");
      return;
    }
    openViewer({ images: chatMedia, index: 0 });
  };

  const handleViewProfile = () => {
    setMenuOpen(false);
    router.push(`/profile/${otherUserId}`);
  };

  const handleToggleMute = async () => {
    const next = !muted;
    setMuted(next);
    setMenuOpen(false);

    try {
      const res = await fetch(`/api/user/conversations/${activeChat.id}/mute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muted: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Notifications muted" : "Notifications unmuted", "");
    } catch {
      setMuted(!next);
      toast.error("Unable to update mute setting", "Please try again.");
    }
  };

  const handleClearChat = async () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }

    try {
      const res = await fetch(`/api/user/conversations/${activeChat.id}/messages`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Chat cleared", "");
    } catch {
      toast.error("Unable to clear chat", "Please try again.");
    } finally {
      setMenuOpen(false);
      setConfirmingClear(false);
    }
  };

  const handleBlockUser = async () => {
    if (!confirmingBlock) {
      setConfirmingBlock(true);
      return;
    }

    try {
      const res = await fetch(`/api/user/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: otherUserId }),
      });
      if (!res.ok) throw new Error();
      toast.success("User blocked", "");
      setActiveChat(null);
    } catch {
      toast.error("Unable to block user", "Please try again.");
    } finally {
      setMenuOpen(false);
      setConfirmingBlock(false);
    }
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

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Conversation options"
          aria-expanded={menuOpen}
          className="p-2 rounded-lg hover:bg-surface transition"
        >
          <EllipsisVertical className="w-5 h-5 text-text-secondary" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden z-50">
            <button
              onClick={handleViewMedia}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-background transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-text-secondary" />
              View media
              {chatMedia.length > 0 && (
                <span className="ml-auto text-xs text-text-secondary">
                  {chatMedia.length}
                </span>
              )}
            </button>

            <button
              onClick={handleViewProfile}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-background transition-colors"
            >
              <User className="w-4 h-4 text-text-secondary" />
              View profile
            </button>

            <button
              onClick={handleToggleMute}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-background transition-colors"
            >
              {muted ? (
                <Bell className="w-4 h-4 text-text-secondary" />
              ) : (
                <BellOff className="w-4 h-4 text-text-secondary" />
              )}
              {muted ? "Unmute notifications" : "Mute notifications"}
            </button>

            <div className="h-px bg-border/60 my-1" />

            <button
              onClick={handleClearChat}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                confirmingClear
                  ? "bg-red-500/10 text-red-500"
                  : "text-text-primary hover:bg-background"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {confirmingClear ? "Click again to confirm" : "Clear chat"}
            </button>

            <button
              onClick={handleBlockUser}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                confirmingBlock
                  ? "bg-red-500/10 text-red-500"
                  : "text-red-500 hover:bg-red-500/5"
              }`}
            >
              <Ban className="w-4 h-4" />
              {confirmingBlock ? "Click again to confirm" : "Block user"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;