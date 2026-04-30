"use client";

import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ActiveChat } from "@/types/AuthStore";
import { getSocket } from "@/lib/socket";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { useAuthStore } from "./useAuthStore";

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type MessageType = "text" | "image" | "file" | "mixed" | "audio";

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
  fetchingMessages: boolean;
  conversations: any[];
  setConversations: (data: any[]) => void;

  setActiveChat: (chat: ActiveChat | null) => void;

  fetchMessages: (conversationId: string, userId: string) => Promise<void>;

  sendMessage: (data: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: MessageType;
    metadata?: any;
    senderAvatar: string;
    name: string;
    link: string;
    receiverId: string;
  }) => void;

  listenForMessages: () => void;
  joinChat: (conversationId: string) => void;

  markAsRead: (conversationId: string) => void;

  cleanup: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: {},
  activeChat: null,
  fetchingMessages: false,
  conversations: [],
  setConversations: (data) => set({ conversations: data }),

  setActiveChat: (chat) => {
    set({ activeChat: chat });

    if (!chat?.id) return;

    const state = get();
    const messages = state.messages[chat.id];
    const lastMessage = messages?.[messages.length - 1];

    if (chat?.id) {
      state.markAsRead(chat.id);

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === chat.id ? { ...c, unread_count: 0 } : c,
        ),
      }));
    }
  },
  fetchMessages: async (conversationId, userId) => {
    const supabase = getSupabaseBrowserClient();
    set({ fetchingMessages: true });

    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .select(
          `
        *,
        sender:profiles(*)
      `,
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const messageIds = (messages || []).map((m) => m.id);

      const receiptMap = new Map<string, any>();

      if (messageIds.length > 0) {
        const { data: receipts, error: receiptError } = await supabase
          .from("message_receipts")
          .select("message_id, delivered_at, read_at")
          .in("message_id", messageIds)
          .neq("user_id", userId);

        if (receiptError) {
          console.error("receipt fetch error:", receiptError.message);
        }

        receipts?.forEach((r) => {
          receiptMap.set(r.message_id, r);
        });
      }

      const enriched = (messages || []).map((msg: any) => {
        const receipt = receiptMap.get(msg.id);

        const isRead = !!receipt?.read_at;
        const isDelivered = !!receipt?.delivered_at;

        let status: "sent" | "delivered" | "read" = "sent";

        if (isRead) status = "read";
        else if (isDelivered) status = "delivered";

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
      console.error("fetchMessages error:", error);
    } finally {
      set({ fetchingMessages: false });
    }
  },

  sendMessage: ({
    conversationId,
    senderId,
    content,
    type = "text",
    metadata,
    senderAvatar,
    name,
    link,
    receiverId,
  }) => {
    if (!content.trim()) return;

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

    socket?.emit("notification:send", {
      userId: receiverId,
      type: "new_message",
      title: "New Message",
      body: `${name || "Someone"} sent you a message.`,
      data: {
        conversationId: conversationId,
        senderImage: senderAvatar,
        senderName: name,
        msgPrev: content,
        link: link,
      },
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

    socket.on("conversation:updated", (data) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === data.conversationId ? { ...c, ...data } : c,
        ),
      }));
    });

    socket.on("new_message", (msg) => {
      const conversationId = msg.conversation_id;
      const state = get();
      const isActiveChat = state.activeChat?.id === conversationId;
      const currentUserId = useAuthStore.getState().user?.id;
      const otherUserId = state.activeChat?.other_user_id;

      const normalized = {
        ...msg,
        status: msg.status || "sent",
      };

      // 1. Update the Message List (Bubbles)
      set((state) => {
        const existing = state.messages[conversationId] || [];
        const alreadyExists = existing.some((m) => m.id === msg.id);
        if (alreadyExists) return state;

        let replaced = false;
        const updated = existing.map((m) => {
          if (msg.tempId && m.id === msg.tempId) {
            replaced = true;
            return { ...normalized, isTemp: false };
          }
          return m;
        });

        const finalMessages = replaced ? updated : [...existing, normalized];

        return {
          messages: {
            ...state.messages,
            [conversationId]: finalMessages,
          },
        };
      });

      // 2. REAL-TIME UNREAD COUNT & PREVIEW UPDATE
      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.id === conversationId) {
            const isIncoming = msg.sender_id !== currentUserId;

            return {
              ...conv,
              last_message: msg.content,
              last_message_at: msg.created_at,
              // Only increment if the message is from someone else AND chat isn't active
              unread_count:
                isIncoming && !isActiveChat
                  ? Number(conv.unread_count || 0) + 1
                  : conv.unread_count,
            };
          }
          return conv;
        }),
      }));

      // 3. Status logic
      if (msg.senderId === currentUserId) {
        socket?.emit("message_delivered", {
          messageId: msg.id,
          otherUserId,
          conversationId,
        });
      }

      if (isActiveChat) {
        if (msg.sender_id !== currentUserId) {
          // If active, tell DB to reset count immediately
          getSocket()?.emit("mark_as_read", { conversationId });
        }

        set((state) => {
          const messages = state.messages[conversationId] || [];
          const updated = messages.map((m) => {
            if (m.sender_id !== currentUserId) {
              return { ...m, status: "read" };
            }
            return m;
          });

          return {
            messages: { ...state.messages, [conversationId]: updated },
          };
        });
      }
    });

    socket.on("messages_delivered", ({ conversationId }) => {
      const currentUserId = useAuthStore.getState().user?.id;
      set((state) => {
        const messages = state.messages[conversationId] || [];
        const updated = messages.map((msg) => {
          if (msg.sender_id === currentUserId && msg.status === "sent") {
            return { ...msg, status: "delivered" as MessageStatus };
          }
          return msg;
        });
        return { messages: { ...state.messages, [conversationId]: updated } };
      });
    });

    // Inside listenForMessages
    socket.on(
      "message_status_update",
      ({ messageId, conversationId, status }) => {
        set((state) => {
          const messages = state.messages[conversationId] || [];
          const updated = messages.map((m) => {
            if (m.id !== messageId) return m;
            if (m.status === "read" && status === "delivered") return m;
            return { ...m, status };
          });
          return { messages: { ...state.messages, [conversationId]: updated } };
        });
      },
    );

    socket.on("conversation:updated", (data) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === data.conversationId
            ? {
                ...c,
                last_message: data.last_message,
                last_message_at: data.last_message_at,
                last_message_id: data.last_message_id,
              }
            : c,
        ),
      }));
    });

    socket.on("messages_seen", ({ conversationId }) => {
      const currentUserId = useAuthStore.getState().user?.id;
      set((state) => {
        const messages = state.messages[conversationId] || [];
        const updated = messages.map((msg) => {
          if (msg.sender_id === currentUserId) {
            return { ...msg, status: "read" as MessageStatus };
          }
          return msg;
        });
        return { messages: { ...state.messages, [conversationId]: updated } };
      });
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

  markAsRead: (conversationId) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("mark_as_read", {
      conversationId,
    });

    set((state) => {
      const messages = state.messages[conversationId] || [];

      const updated = messages.map(
        (msg): Message => ({
          ...msg,
          status: msg.status !== "read" ? "read" : msg.status,
        }),
      );

      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
      };
    });
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
    socket?.off("conversation:updated");
    socket?.off("messages_delivered");
  },
}));
