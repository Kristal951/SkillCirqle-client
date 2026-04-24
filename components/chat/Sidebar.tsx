"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useEffect, useState } from "react";
import Spinner from "../ui/Spinner";
import { formatDistanceToNowStrict } from "date-fns";
import { useSocketStore } from "@/store/useSocketStore";
import { MessageSquarePlus } from "lucide-react";

const Sidebar = () => {
  const { activeChat, setActiveChat } = useChatStore();
  const { user } = useAuthStore();

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);

  const supabase = getSupabaseBrowserClient();

  const fetchChats = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("dm_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .eq("me_id", user?.id);

    if (!error) setChats(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchChats();

    // realtime: conversation updates
    const convoChannel = supabase
      .channel("sidebar_conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dm_conversations" },
        () => fetchChats()
      )
      .subscribe();

    // realtime: new messages (important fix)
    const messageChannel = supabase
      .channel("sidebar_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchChats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convoChannel);
      supabase.removeChannel(messageChannel);
    };
  }, []);

  const formatTimeAgoShort = (dateString?: string) => {
    if (!dateString) return "";
    return formatDistanceToNowStrict(new Date(dateString), {
      addSuffix: false,
    })
      .replace("minutes", "m")
      .replace("minute", "m")
      .replace("hours", "h")
      .replace("hour", "h")
      .replace("seconds", "s")
      .replace("second", "s")
      .replace("days", "d")
      .replace("day", "d");
  };

  return (
    <aside className="h-screen w-full md:w-84 md:border-r border-border bg-background fixed overflow-y-auto px-4 py-6 flex flex-col gap-6 z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Chats</h2>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat) => {
            const isActive = activeChat?.id === chat.id;

            const otherUserId =
              chat.participants?.find((id: string) => id !== user?.id) ||
              chat.other_user_id;

            const isOnline = onlineUsers?.has?.(otherUserId);

            const isTyping =
              typingUsers?.[chat.id]?.includes?.(otherUserId);

            const unreadCount = chat.unreadCount || 0;

            return (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-3 flex gap-3 rounded-xl transition-all text-left ${
                  isActive ? "bg-muted shadow-sm" : "hover:bg-muted/50"
                }`}
              >
                {/* Avatar */}
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold truncate">{chat.name}</h3>

                    <span className="text-[10px] text-muted-foreground">
                      {formatTimeAgoShort(chat.last_message_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                      className={`text-sm truncate flex-1 ${
                        unreadCount > 0
                          ? "text-foreground font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isTyping ? (
                        <span className="text-primary italic animate-pulse">
                          Typing...
                        </span>
                      ) : (
                        chat.last_message || "No messages yet"
                      )}
                    </p>

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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <MessageSquarePlus className="w-8 h-8 text-muted-foreground" />
            </div>

            <div>
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm text-muted-foreground">
                Start a chat to see it here!
              </p>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;