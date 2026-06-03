"use client";

import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ActiveChat } from "@/types/AuthStore";
import { getSocket } from "@/lib/socket";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";
import { decryptMessage } from "@/lib/decryptMessage";

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
  is_deleted: boolean;
  deleted_at?: string | null;

  reply_to?: string | null;

  reply?: {
    id: string;
    content: string;
    sender_id: string;
    metadata?: {
      sender_name?: string;
      sender_avatar_url?: string;
    };
  };

  metadata?: {
    media?: MediaItem[];
    url?: string;
    caption?: string;

    sender_avatar_url?: string;
    sender_name?: string;

    file_name?: string;
    file_size?: number;
    mime_type?: string;
  };

  sender: {
    avatar: string;
    name: string;
  };

  status?: MessageStatus;
  isTemp?: boolean;
  tempId?: string;
  is_edited: boolean;
  updated_at?: string;
};

type ChatStore = {
  messages: Record<string, Message[]>;
  activeChat: ActiveChat | null;
  fetchingMessages: boolean;
  conversations: any[];
  lastSeen: Record<string, number>;
  setConversations: (data: any[]) => void;
  setLastSeen: (userId: string, timestamp: number) => void;

  clearLastSeen: (userId: string) => void;

  setActiveChat: (chat: ActiveChat | null) => void;

  fetchMessages: (conversationId: string, userId: string) => Promise<void>;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>,
  ) => void;
  addOrUpdateMessage: (msg: Message) => void;

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
    senderName: string;
    reply_to: string | null;
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
  lastSeen: {},
  setConversations: (data) => set({ conversations: data }),

  setLastSeen: (userId, timestamp) =>
    set((state) => ({
      lastSeen: {
        ...state.lastSeen,
        [userId]: timestamp,
      },
    })),

  clearLastSeen: (userId) =>
    set((state) => {
      const updated = {
        ...state.lastSeen,
      };

      delete updated[userId];

      return {
        lastSeen: updated,
      };
    }),

  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>,
  ) =>
    set((state) => {
      const msgs = state.messages[conversationId];

      if (!msgs) return state;

      let updated = false;

      const newMsgs = msgs.map((msg) => {
        if (msg.id !== messageId) return msg;

        updated = true;
        return { ...msg, ...updates };
      });

      if (!updated) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: newMsgs,
        },
      };
    }),

  addOrUpdateMessage: (msg: Message) =>
    set((state) => {
      const convId = msg.conversation_id;
      const msgs = state.messages[convId] || [];

      let found = false;

      const updatedMsgs = msgs.map((m) => {
        if (m.id === msg.id || (msg.tempId && m.id === msg.tempId)) {
          found = true;

          return {
            ...m,
            ...msg,
            status: msg.status || "sent",
            reply: msg.reply ?? m.reply,
            reply_to: msg.reply_to ?? m.reply_to,
            metadata: {
              ...m.metadata,
              ...msg.metadata,
            },
          };
        }

        return m;
      });

      if (!found) {
        updatedMsgs.push({
          ...msg,
          status: msg.status ?? "sent",
        });
      }

      updatedMsgs.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      return {
        messages: {
          ...state.messages,
          [convId]: updatedMsgs,
        },
      };
    }),
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
      const res = await fetch(`/api/user/messages/${conversationId}`);

      const messages = await res.json();

      const messageIds = (messages || []).map((m: Message) => m.id);

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
    senderName,
    reply_to,
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
      is_deleted: false,
      status: "sending",
      isTemp: true,
      is_edited: false,
      sender: { avatar: senderAvatar || "", name: senderName || "" },
      reply_to,
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
      reply_to: reply_to || null,
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
    socket.off("message_edited");

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

      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.id === conversationId) {
            const isIncoming = msg.sender_id !== currentUserId;
    
            return {
              ...conv,
              last_message: {
                text: msg.content || msg.message || "",
                type: msg.type || msg.message_type || "text",
                count: msg.content?.count,
              },
              last_message_at: msg.created_at,
              unread_count:
                isIncoming && !isActiveChat
                  ? Number(conv.unread_count || 0) + 1
                  : conv.unread_count,
            };
          }
          return conv;
        }),
      }));

      if (msg.senderId === currentUserId) {
        socket?.emit("message_delivered", {
          messageId: msg.id,
          otherUserId,
          conversationId,
        });
      }

      if (isActiveChat) {
        if (msg.sender_id !== currentUserId) {
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

    socket.on("message_edited", (msg) => {
      useChatStore.getState().updateMessage(msg.conversation_id, msg.id, msg);
    });
    socket.on("receive_message", (msg) => {
      useChatStore.getState().addOrUpdateMessage(msg);
    });
    socket.on("user_offline", ({ userId, lastSeen }) => {
      useChatStore.getState().setLastSeen(userId, Number(lastSeen));

      useSocketStore.getState().onlineUsers?.delete?.(userId);
    });

    socket.on("message_deleted", (msg) => {
      useChatStore.getState().updateMessage(msg.conversation_id, msg.id, msg);
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
    socket?.off("message_edited");
    socket?.off("message_deleted");
  },
}));
