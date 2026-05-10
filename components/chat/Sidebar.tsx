"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Spinner from "../ui/Spinner";
import { formatDistanceToNowStrict } from "date-fns";
import { useSocketStore } from "@/store/useSocketStore";
import { FileText, Image, MessageSquarePlus, Mic } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { formatLastSeenShort } from "@/utils/formatTime";

const Sidebar = () => {
  const { activeChat, setActiveChat } = useChatStore();
  const { user } = useAuthStore();

  const chats = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const lastSeenMap = useChatStore((s) => s.lastSeen);
  const setLastSeen = useChatStore((s) => s.setLastSeen);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "online">("all");

  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);

  const supabase = getSupabaseBrowserClient();

  const fetchChats = async (silent = false, userId?: string) => {
    const id = userId || user?.id;
    if (!id) return;

    if (!silent) setLoading(true);

    const { data, error } = await supabase
      .from("dm_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .eq("me_id", id);

    if (!error) setConversations(data || []);

    if (!silent) setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchChats(false, user?.id);
  }, [user?.id, supabase]);

  const userIds = useMemo(() => {
    return chats
      .map(
        (chat) =>
          chat.participants?.find((id: string) => id !== user?.id) ||
          chat.other_user_id,
      )
      .filter(Boolean);
  }, [chats, user?.id]);

  useEffect(() => {
    if (!userIds.length) return;

    const socket = getSocket();

    socket?.emit("get_last_seen_bulk", { userIds }, (data: any[]) => {
      if (!Array.isArray(data)) return;

      data.forEach((item) => {
        if (item?.userId && item?.lastSeen) {
          setLastSeen(item.userId, Number(item.lastSeen));
        }
      });
    });
  }, [userIds]);

  const handleOpenChat = (chatId: string) => {
    const socket = getSocket();

    const chat = chats.find((c) => c.id === chatId);

    if (!chat) return;

    const otherUserId =
      chat.participants?.find((id: string) => id !== user?.id) ||
      chat.other_user_id;

    socket?.emit("chat_close", {
      conversationId: activeChat?.id,
    });

    socket?.emit("chat_open", {
      conversationId: chat.id,
    });

    socket?.emit("get_last_seen", { userId: otherUserId }, (data: any) => {
      if (data?.lastSeen) {
        setLastSeen(data.userId, Number(data.lastSeen));
      }
    });

    setActiveChat(chat);
  };

  const filteredChats = useMemo(() => {
    const query = search.toLowerCase().trim();

    let result = chats;

    if (query) {
      result = result.filter((chat) => {
        const name = chat.name?.toLowerCase() || "";

        const lastMessage = chat.last_message?.text?.toLowerCase() || "";

        return name.includes(query) || lastMessage.includes(query);
      });
    }

    switch (filter) {
      case "unread":
        result = result.filter((chat) => (chat.unread_count || 0) > 0);
        break;

      case "online":
        result = result.filter((chat) => {
          const otherUserId =
            chat.participants?.find((id: string) => id !== user?.id) ||
            chat.other_user_id;

          return onlineUsers?.has?.(otherUserId);
        });
        break;

      default:
        break;
    }

    return result;
  }, [search, chats, filter, onlineUsers, user?.id]);

  return (
    <aside className="h-screen w-full md:w-84 md:border-r border-border bg-background fixed overflow-y-auto px-4 py-6 flex flex-col gap-6 z-10">
      <div className="flex flex-col gap-3 border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground px-1">
          Chats
        </h2>

        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl pointer-events-none group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            type="text"
            placeholder="Search Conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-secondary/60"
          />
        </div>

        <div className="flex items-center gap-2 mt-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            {
              key: "all",
              label: "All",
              count: chats.length,
            },
            {
              key: "unread",
              label: "Unread",
              count: chats.filter((c) => (c.unread_count || 0) > 0).length,
            },
            {
              key: "online",
              label: "Online",
              count: chats.filter((c) => {
                const id =
                  c.participants?.find((p: string) => p !== user?.id) ||
                  c.other_user_id;
                return onlineUsers?.has?.(id);
              }).length,
            },
          ].map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-2.5 active:scale-95 ${
                  active
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-surface border-border text-text-secondary hover:border-primary/50"
                }`}
              >
                {item.label}
                {item.count > 0 && (
                  <span
                    className={`min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-primary text-white"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const isActive = activeChat?.id === chat.id;

            const otherUserId =
              chat.participants?.find((id: string) => id !== user?.id) ||
              chat.other_user_id;

            const isOnline = onlineUsers?.has?.(otherUserId);

            const isTyping = typingUsers?.[chat.id]?.includes?.(otherUserId);

            const unreadCount = chat.unread_count || 0;

            const userLastSeen = lastSeenMap[otherUserId];

            return (
              <button
                key={chat.id}
                onClick={() => handleOpenChat(chat.id)}
                className={`w-full px-2 py-3 flex gap-3 rounded-lg transition-all text-left ${
                  isActive ? "bg-surface/50 shadow-sm" : "hover:bg-surface/50"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                    <img
                      src={chat.avatar_url || "/default-avatar.png"}
                      alt={chat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isOnline && (
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500 absolute bottom-0 right-0 border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold truncate">{chat.name}</h3>

                    <span className="text-[10px] text-text-secondary">
                      {!isOnline
                        ? userLastSeen
                          ? `${formatLastSeenShort(userLastSeen)} ago`
                          : formatLastSeenShort(chat.last_message_at)
                        : formatLastSeenShort(chat.last_message_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span
                      className={`text-sm truncate flex-1 ${
                        unreadCount > 0
                          ? "text-text-primary font-bold"
                          : "text-text-secondary"
                      }`}
                    >
                      {isTyping ? (
                        <span className="text-primary italic animate-pulse">
                          Typing...
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          {chat.last_message?.type === "image" ? (
                            <Image size={18} />
                          ) : chat.last_message?.type === "file" ? (
                            <FileText size={18} />
                          ) : chat.last_message?.type === "audio" ? (
                            <Mic size={18} />
                          ) : (
                            ""
                          )}

                          <p className="truncate">
                            {chat.last_message
                              ? chat.last_message.type === "image"
                                ? chat.last_message.count > 1
                                  ? `${chat.last_message.count} Photos`
                                  : "Photo"
                                : chat.last_message.type === "file"
                                  ? chat.last_message.count > 1
                                    ? `${chat.last_message.count} Files`
                                    : "File"
                                  : chat.last_message.type === "audio"
                                    ? "Voice message"
                                    : chat.last_message.text
                              : "No messages yet"}
                          </p>
                        </div>
                      )}
                    </span>

                    {unreadCount > 0 && (
                      <span className="shrink-0 h-5 px-1.5 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="p-2 bg-muted rounded-full">
              <MessageSquarePlus className="w-18 h-18 text-muted-foreground" />
            </div>

            <div>
              <p className="font-medium text-xl text-text-primary">
                No conversations yet
              </p>
              <p className="text-sm text-text-secondary">
                Start a proposal to see conversations.
              </p>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
