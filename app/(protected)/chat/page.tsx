"use client";

import { useEffect, useMemo, useRef } from "react";
import { useChatStore, Message } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { initSocketEvents } from "@/lib/socketEvents";

// =====================
// UI Message type
// =====================
type UIMessage = {
  id: string;
  message: string;
  type: "text" | "image";
  createdAt: string;
  sender: {
    id: string;
    avatar: string;
  };
  mediaUrl?: string | null;
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
  } = useChatStore();

  const currentUserId = user?.id;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // =====================
  // Chat lifecycle
  // =====================
  useEffect(() => {
    if (!activeChat?.id) return;

    fetchMessages(activeChat.id);
    joinChat(activeChat.id);
    listenForMessages();

    return () => cleanup();
  }, [activeChat?.id]);

  useEffect(() => {
    initSocketEvents();
  }, []);
  // =====================
  // Raw messages
  // =====================
  const rawMessages = storeMessages[activeChat?.id || ""] || [];

  // =====================
  // Transform DB → UI safely
  // =====================
  const messages: UIMessage[] = useMemo(() => {
    return rawMessages
      .filter((msg) => msg?.id && msg?.content)
      .map((msg: Message) => ({
        id: msg.id,
        message: msg.content || "",
        type: msg.message_type || "text",
        createdAt: msg.created_at || new Date().toISOString(),

        sender: {
          id: msg.sender_id,
          avatar:
            msg?.sender?.avatar ||
            `https://i.pravatar.cc/150?u=${msg.sender_id}`,
        },

        mediaUrl: msg.message_type === "image" ? msg.metadata?.url : null,
      }));
  }, [rawMessages]);

  // =====================
  // Auto scroll
  // =====================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =====================
  // No chat selected
  // =====================
  if (!activeChat) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center flex flex-col items-center text-gray-400">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "100px" }}
          >
            chat_bubble_off
          </span>

          <h2 className="text-2xl mt-2 text-white">No chat selected</h2>
          <p className="text-sm">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  // =====================
  // Empty messages state
  // =====================

  const isEmpty =
  !rawMessages || rawMessages.length === 0;

  if (isEmpty) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center flex flex-col items-center text-gray-400">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "100px" }}
          >
            chat_bubble_off
          </span>

          <h2 className="text-2xl mt-2 text-white">No Message yet.</h2>
          <p className="text-sm">Start the conversation</p>
        </div>
      </div>
    );
  }

  // =====================
  // Chat UI
  // =====================
  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar */}
              {!isMe && (
                <img
                  src={
                    msg.sender?.avatar ||
                    `https://i.pravatar.cc/150?u=${msg.sender.id}`
                  }
                  className="w-8 h-8 rounded-full object-cover"
                  alt="avatar"
                />
              )}

              {/* Message */}
              <div className="flex flex-col max-w-[50%]">
                <div
                  className={`p-4 text-sm shadow wrap-break-word ${
                    isMe
                      ? "bg-primary text-white rounded-t-3xl rounded-bl-3xl"
                      : "bg-surface text-text-primary rounded-t-3xl rounded-br-3xl"
                  }`}
                >
                  {/* TEXT */}
                  {msg.type === "text" && (
                    <p className="whitespace-pre-wrap">
                      {msg.message?.trim() || " "}
                    </p>
                  )}

                  {/* IMAGE */}
                  {msg.type === "image" && msg.mediaUrl && (
                    <div className="space-y-2">
                      <img
                        src={msg.mediaUrl}
                        className="rounded-xl w-full object-cover"
                        alt="media"
                      />
                      {msg.message && (
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span
                  className={`text-[10px] mt-1 text-gray-400 ${
                    isMe ? "text-right" : "text-left"
                  }`}
                >
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Chat;
