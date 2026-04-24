"use client";

import { useEffect, useMemo, useRef } from "react";
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

  sender: {
    id: string;
    avatar: string;
  };

  media?: {
    type: "image" | "file" | "video";
    url: string;
    name?: string;
  }[];

  status?: MessageStatus;
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
    fetchReadPointers,
    fetchingMessages,
  } = useChatStore();

  const currentUserId = user?.id;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeChat?.id) return;

    fetchReadPointers(activeChat.id);
    fetchMessages(activeChat.id);
    joinChat(activeChat.id);
    listenForMessages();

    return () => cleanup();
  }, [activeChat?.id]);

  const rawMessages = storeMessages[activeChat?.id || ""] || [];

  const messages: UIMessage[] = useMemo(() => {
    return rawMessages
      .filter((msg) => msg?.id && msg?.content)
      .map((msg: Message) => ({
        id: msg.id,
        message: msg.content,
        type: msg.message_type || "text",
        createdAt: msg.created_at,
        status: msg.status || "sent",

        sender: {
          id: msg.sender_id,
          avatar:
            msg?.sender?.avatar ||
            msg?.metadata?.sender_avatar_url ||
            `https://i.pravatar.cc/150?u=${msg.sender_id}`,
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
                  type: "file",
                  url: file.url,
                  name: file.name,
                }))
              : [],
      }));
  }, [rawMessages]);

  console.log(rawMessages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeChat?.id || !currentUserId) return;

    const socket = getSocket();
    if (!socket) return;

    const messages = storeMessages[activeChat.id] || [];
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.sender_id !== currentUserId) {
      socket.emit("mark_as_read", {
        conversationId: activeChat.id,
        messageId: lastMessage.id,
      });
    }
  }, [messages.length, activeChat?.id]);

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
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;
          return <MessageBubble key={msg.id} msg={msg} isMe={isMe} />;
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Chat;
