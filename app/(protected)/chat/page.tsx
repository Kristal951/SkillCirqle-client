"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useChatStore,
  Message,
  MessageType,
  MessageStatus,
} from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getSocket } from "@/lib/socket";
import MessageBubble from "@/components/chat/MessageBubble";
import Spinner from "@/components/ui/Spinner";

export type UIMessage = {
  id: string;
  message: string;
  type: MessageType;
  createdAt: string;
  edited?: boolean;
  updatedAt?: string;
  deleted?: boolean;
  deletedAt?: string | null;
  reply_to?: string | null;
  reply?: {
    id: string;
    content: string;
    sender_id: string;
    metadata?: {
      sender_name?: string;
      sender_avatar_url?: string;
    };
  } | null;
  caption?: string;
  sender: {
    id: string;
    avatar: string;
    name: string;
  };

  media?: {
    type: "image" | "file" | "video" | "audio";
    url: string;
    name?: string;
  }[];

  status?: MessageStatus;
};

type GroupedMessages = {
  date: string;
  messages: UIMessage[];
};

const Chat = () => {
  const { user } = useAuthStore();

  const {
    activeChat,
    messages: storeMessages,
    fetchMessages,
    joinChat,
    listenForMessages,
    cleanup,
    fetchingMessages,
  } = useChatStore();

  const currentUserId = user?.id;
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const formatDateLabel = (date: Date) => {
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupMessagesByDate = (messages: UIMessage[]) => {
    const groups: Record<string, UIMessage[]> = {};

    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const key = formatDateLabel(date);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(msg);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  useEffect(() => {
    const socket = getSocket();
    if (!activeChat?.id) return;

    socket?.emit("chat_open", {
      conversationId: activeChat.id,
    });

    return () => {
      socket?.emit("chat_close", {
        conversationId: activeChat.id,
      });
    };
  }, [activeChat?.id]);

  useEffect(() => {
    if (!activeChat?.id) return;

    fetchMessages(activeChat.id, user?.id || "");
    joinChat(activeChat.id);
    listenForMessages();

    return () => cleanup();
  }, [activeChat?.id]);

  const rawMessages = storeMessages[activeChat?.id || ""] || [];

  const messages: UIMessage[] = useMemo(() => {
    return rawMessages
      .filter((msg) => msg?.id)
      .map((msg: Message) => ({
        id: msg.id,
        message: msg.content || "",
        type: msg.message_type || "text",
        createdAt: msg.created_at,
        edited: msg.is_edited,
        updatedAt: msg.updated_at,
        status: msg.status,
        deleted: msg.is_deleted,
        deletedAt: msg.deleted_at,
        caption: msg.metadata?.caption || "",

        reply_to: msg.reply_to ?? null,
        reply: msg.reply ?? undefined,
        sender: {
          id: msg.sender_id,
          avatar:
            msg?.sender?.avatar ||
            msg?.metadata?.sender_avatar_url ||
            `https://i.pravatar.cc/150?u=${msg.sender_id}`,
          name:
            msg?.sender?.name || msg.metadata?.sender_name || "Unknown User",
        },

        media:
          msg.message_type === "image"
            ? msg.metadata?.media?.map((img: any) => ({
                type: "image",
                url: img.url,
                name: img.name,
              })) || []
            : msg.message_type === "file"
              ? msg.metadata?.media?.map((file: any) => ({
                  type: file.type,
                  url: file.url,
                  name: file.name,
                }))
              : msg.message_type === "audio"
                ? msg.metadata?.media?.map((file: any) => ({
                    type: file.type,
                    url: file.url,
                    name: file.name,
                  }))
                : [],
      }));
  }, [rawMessages]);
  console.log(messages);

  const groupedMessages = groupMessagesByDate(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastReadRef = useRef<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeChat?.id) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        socket.emit("mark_as_read", {
          conversationId: activeChat.id,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeChat?.id]);

  useEffect(() => {
    if (!activeChat?.id || !messages.length) return;

    const socket = getSocket();
    if (!socket) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    const alreadyMarked = lastReadRef.current === lastMessage.id;
    if (alreadyMarked) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (lastReadRef.current === lastMessage.id) return;

        if (document.visibilityState !== "visible") return;

        socket.emit("mark_as_read", {
          conversationId: activeChat.id,
        });

        lastReadRef.current = lastMessage.id;
      },
      {
        threshold: 1.0,
      },
    );

    const el = bottomRef.current;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [messages, activeChat?.id]);

  if (!activeChat) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <div className="text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[100px]">
            chat_bubble_off
          </span>
          <h2 className="text-2xl mt-2 text-white">No chat selected</h2>
          <p className="text-sm">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  if (fetchingMessages) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner size={30} />
      </div>
    );
  }

  if (rawMessages.length === 0 && !fetchingMessages) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <div className="text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[100px]">
            chat_bubble_off
          </span>
          <h2 className="text-2xl mt-2 text-white">No messages yet</h2>
          <p className="text-sm">Start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <div className="flex flex-col space-y-2 p-4">
          {groupedMessages.map((group) => (
            <div key={group.date} className="flex flex-col">
              <div className="flex items-center justify-center gap-4 my-3 select-none">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-border/60 to-border/60" />
                <div className="relative group">
                  <span className="relative z-10 text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full text-text-secondary shadow-sm whitespace-nowrap">
                    {group.date}
                  </span>
                </div>

                <div className="h-px flex-1 bg-linear-to-l from-transparent via-border/60 to-border/60" />
              </div>

              <div className="flex flex-col space-y-5">
                {group.messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMe={msg.sender.id === currentUserId}
                    messageRefs={messageRefs}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Chat;
