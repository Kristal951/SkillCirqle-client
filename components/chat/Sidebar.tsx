"use client";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useChatStore } from "@/store/useChatStore";
import React, { useEffect, useState } from "react";
import Spinner from "../ui/Spinner";
import { formatDistanceToNowStrict } from "date-fns";
import { useSocketStore } from "@/store/useSocketStore";

const Sidebar = () => {
  const { activeChat, setActiveChat } = useChatStore();

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);
  console.log(typingUsers, 'typing');

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);

      const supabase = await getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("dm_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setChats(data || []);
      setLoading(false);
    };

    fetchChats();
  }, []);

  const formatTimeAgoShort = (dateString: string) => {
    return formatDistanceToNowStrict(new Date(dateString), {
      addSuffix: true,
    })
      .replace("minutes", "m")
      .replace("minute", "m")
      .replace("hours", "h")
      .replace("hour", "h")
      .replace("seconds", "s")
      .replace("second", "s");
  };
  return (
    <aside className="h-screen w-80 md:w-84 border-r border-border bg-background fixed overflow-y-auto px-4 py-6 flex flex-col gap-6 z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Chats</h2>
      </div>

      <nav className="flex flex-col gap-2">
        {loading && (
          <div className="h-full w-full flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {!loading &&
          chats.map((chat) => {
            const isActive = activeChat?.id === chat.id;

            const otherUserId = chat.user_id;

            const isOnline = onlineUsers.has(otherUserId);

            const isTyping = typingUsers?.[chat.id]?.has(otherUserId) || false;

            return (
              <button
                key={chat.id}
                aria-selected={isActive}
                className={`w-full p-3 flex gap-3 rounded-xl transition-all duration-200 text-left group ${
                  isActive
                    ? "bg-surface shadow-sm"
                    : "hover:bg-surface/50 active:scale-[0.98]"
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                    <img
                      src={chat.avatar_url || "https://via.placeholder.com/150"}
                      alt={chat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                  {isOnline && (
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500 absolute bottom-0 right-0 border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-base truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {formatTimeAgoShort(chat.last_message_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                      className={`text-sm truncate flex-1 ${
                        chat.unreadCount > 0
                          ? "text-foreground font-medium"
                          : "text-text-secondary"
                      }`}
                    >
                      {isTyping ? "Typing..." : chat.last_message}
                    </p>

                    {chat.unreadCount > 0 && (
                      <span className="shrink-0 min-w-5 h-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
