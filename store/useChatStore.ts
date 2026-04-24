"use client";

import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ActiveChat } from "@/types/AuthStore";
import { getSocket } from "@/lib/socket";

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type MessageType = "text" | "image" | "file" | "mixed";

type MediaItem = {
  type: "image" | "file";
  url: string;
  name?: string;
  size?: number;
  mime?: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: MessageType;

  metadata?: {
    media?: MediaItem[];
    url?: string;

    sender_avatar_url?: string;
    sender_name?: string;

    file_name?: string;
    file_size?: number;
    mime_type?: string;
  };

  sender: {
    avatar: string;
  };

  status?: MessageStatus;
  isTemp?: boolean;
  tempId?: string;
};

type ChatStore = {
  messages: Record<string, Message[]>;
  activeChat: ActiveChat | null;
  readPointers: Record<string, Record<string, string>>;
  unreadCounts: Record<string, number>;
  fetchingMessages: boolean;

  setActiveChat: (chat: ActiveChat | null) => void;

  fetchMessages: (conversationId: string) => Promise<void>;
  fetchReadPointers: (conversationId: string) => Promise<void>;

  sendMessage: (data: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: MessageType;
    metadata?: any;
    senderAvatar: string;
    name: string;
  }) => void;

  listenForMessages: () => void;
  joinChat: (conversationId: string) => void;

  markAsRead: (conversationId: string, messageId: string) => void;

  cleanup: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: {},
  activeChat: null,
  readPointers: {},
  unreadCounts: {},
  fetchingMessages: false,

  setActiveChat: (chat) => {
    set({ activeChat: chat });

    if (!chat?.id) return;

    const state = get();
    const messages = state.messages[chat.id];
    const lastMessage = messages?.[messages.length - 1];

    if (lastMessage) {
      state.markAsRead(chat.id, lastMessage.id);
    }

    set((s) => ({
      unreadCounts: {
        ...s.unreadCounts,
        [chat.id]: 0,
      },
    }));
  },

  fetchMessages: async (conversationId) => {
    const supabase = getSupabaseBrowserClient();
    set({ fetchingMessages: true });

    try {
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      const { data: receipts } = await supabase
        .from("message_receipts")
        .select("*")
        .eq("conversation_id", conversationId);

      const receiptMap = new Map();

      receipts?.forEach((r) => {
        const existing = receiptMap.get(r.message_id) || {
          delivered: false,
          read: false,
        };

        receiptMap.set(r.message_id, {
          delivered: !!r.delivered_at || existing.delivered,
          read: !!r.read_at || existing.read,
        });
      });

      const enriched = (messages || []).map((msg) => {
        const r = receiptMap.get(msg.id);

        let status: "sent" | "delivered" | "read" = "sent";

        if (r?.read) status = "read";
        else if (r?.delivered) status = "delivered";

        return {
          ...msg,
          status,
        };
      });

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: enriched,
        },
      }));
    } catch (error) {
      console.error(error);
    } finally {
      set({ fetchingMessages: false });
    }
  },

  fetchReadPointers: async (conversationId) => {
    const supabase = getSupabaseBrowserClient();

    const { data } = await supabase
      .from("conversations_read")
      .select("*")
      .eq("conversation_id", conversationId);

    if (!data) return;

    set((state) => {
      const updated = { ...(state.readPointers[conversationId] || {}) };

      data.forEach((row) => {
        updated[row.user_id] = row.last_read_message_id;
      });

      return {
        readPointers: {
          ...state.readPointers,
          [conversationId]: updated,
        },
      };
    });
  },

  sendMessage: ({
    conversationId,
    senderId,
    content,
    type = "text",
    metadata,
    senderAvatar,
  }) => {
    if (!content.trim()) return;
    console.log(`send called`);

    const socket = getSocket();
    const tempId = `temp-${Date.now()}`;

    const tempMessage: Message = {
      id: tempId,
      tempId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
      message_type: type,
      metadata,
      status: "sending",
      isTemp: true,
      sender: { avatar: senderAvatar || "" },
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          tempMessage,
        ],
      },
    }));

    socket?.emit("send_message", {
      conversationId,
      content,
      message_type: type,
      metadata,
      tempId,
    });
  },

  listenForMessages: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("new_message");
    socket.off("message_ack");
    socket.off("message_status");
    socket.off("message_error");
    socket.off("messages_seen");

    socket.on("message_ack", ({ tempId, realId }) => {
      set((state) => {
        const updated: Record<string, Message[]> = {};

        for (const cid in state.messages) {
          updated[cid] = state.messages[cid].map((m) =>
            m.id === tempId
              ? { ...m, id: realId, status: "sent", isTemp: false }
              : m,
          );
        }

        return { messages: updated };
      });
    });

    socket.on("new_message", (msg: any) => {
      const conversationId = msg.conversation_id;

      const normalized = {
        ...msg,
        status: msg.status || "sent",
      };

      set((state) => {
        const existing = state.messages[conversationId] || [];

        const alreadyExists = existing.some((m) => m.id === msg.id);
        if (alreadyExists) return state;

        let replaced = false;

        const updated = existing.map((m) => {
          if (msg.tempId && m.id === msg.tempId) {
            replaced = true;
            return {
              ...normalized,
              isTemp: false,
            };
          }
          return m;
        });

        const finalMessages = replaced ? updated : [...existing, msg];

        return {
          messages: {
            ...state.messages,
            [conversationId]: finalMessages,
          },

          unreadCounts: {
            ...state.unreadCounts,
            [conversationId]:
              state.activeChat?.id === conversationId
                ? 0
                : (state.unreadCounts[conversationId] || 0) + 1,
          },
        };
      });

      socket.emit("message_delivered", {
        messageId: msg.id,
        conversationId,
      });
    });

    socket.on("message_status", ({ messageId, status }) => {
      set((state) => {
        const updated: Record<string, Message[]> = {};

        for (const cid in state.messages) {
          updated[cid] = state.messages[cid].map((m) =>
            m.id === messageId ? { ...m, status } : m,
          );
        }

        return { messages: updated };
      });
    });

    socket.on("messages_seen", ({ conversationId, userId, messageId }) => {
      set((state) => ({
        readPointers: {
          ...state.readPointers,
          [conversationId]: {
            ...(state.readPointers[conversationId] || {}),
            [userId]: messageId,
          },
        },
      }));
    });

    socket.on("message_error", ({ tempId }) => {
      set((state) => {
        const updated: Record<string, Message[]> = {};

        for (const cid in state.messages) {
          updated[cid] = state.messages[cid].map((m) =>
            m.id === tempId ? { ...m, status: "failed" } : m,
          );
        }

        return { messages: updated };
      });
    });
  },

  markAsRead: (conversationId, messageId) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("mark_as_read", {
      conversationId,
      messageId,
    });

    set((state) => ({
      readPointers: {
        ...state.readPointers,
        [conversationId]: {
          ...(state.readPointers[conversationId] || {}),
          me: messageId,
        },
      },
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: 0,
      },
    }));
  },

  joinChat: (conversationId) => {
    const socket = getSocket();
    socket?.emit("join_room", conversationId);
  },

  cleanup: () => {
    const socket = getSocket();

    socket?.off("new_message");
    socket?.off("message_ack");
    socket?.off("message_status");
    socket?.off("message_error");
    socket?.off("messages_seen");
  },
}));
