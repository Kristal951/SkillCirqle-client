"use client";

import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ActiveChat } from "@/types/AuthStore";
import { getSocket } from "@/lib/socket";

// =====================
// Types
// =====================
export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: "text" | "image";
  metadata?: {
    url?: string;
  };
  sender:{
    avatar: string
  }

  status?: "sending" | "sent" | "failed";
  isTemp?: boolean;
};

type ChatStore = {
  messages: Record<string, Message[]>;
  activeChat: ActiveChat | null;
  isListening: boolean;

  setActiveChat: (chat: ActiveChat | null) => void;

  fetchMessages: (conversationId: string) => Promise<void>;

  sendMessage: (data: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: "text" | "image";
    metadata?: any;
    senderAvatar: string
  }) => void;

  listenForMessages: () => void;
  joinChat: (conversationId: string) => void;
  cleanup: () => void;
};

// =====================
// Store
// =====================
export const useChatStore = create<ChatStore>((set, get) => ({
  messages: {},
  activeChat: null,
  isListening: false,

  setActiveChat: (chat) => set({ activeChat: chat }),

  // =====================
  // Fetch messages (safe browser Supabase)
  // =====================
  fetchMessages: async (conversationId) => {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("fetchMessages error:", error);
      return;
    }

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: data?.map((m) => ({ ...m, status: "sent" })) || [],
      },
    }));
  },

  // =====================
  // Send message (optimistic)
  // =====================
  sendMessage: ({
    conversationId,
    senderId,
    content,
    type = "text",
    metadata,
    senderAvatar
  }) => {
    if (!content.trim() && type === "text") return;

    const socket = getSocket(); 

    const tempId = `temp-${Date.now()}`;

    const tempMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
      message_type: type,
      metadata,
      status: "sending",
      isTemp: true,
      sender:{
        avatar: senderAvatar || ''
      }
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
      senderId,
      content,
      message_type: type,
      metadata,
      tempId,
    });
  },

  // =====================
  // Listen for socket messages
  // =====================
  listenForMessages: () => {
    if (get().isListening) return;

    const socket = getSocket();

    if (!socket) return;

    // 🔥 prevent duplicate listeners
    socket.off("new_message");
    socket.off("message_error");

    socket.on("new_message", async (msg: Message & { tempId?: string }) => {
      const conversationId = msg.conversation_id;

      set((state) => {
        const existing = state.messages[conversationId] || [];

        const replaced = existing.map((m) => {
          if (msg.tempId && m.id === msg.tempId) {
            return {
              ...msg,
              status: "sent" as const,
              isTemp: false,
            };
          }
          return m;
        });

        if (replaced.some((m) => m.id === msg.id)) {
          return state;
        }

        return {
          messages: {
            ...state.messages,
            [conversationId]: [...replaced, msg],
          },
        };
      });

      // ⚠️ This is OK but keep in mind it runs often
      const supabase = getSupabaseBrowserClient();

      await supabase
        .from("conversations")
        .update({
          last_message: msg.content,
          last_message_at: msg.created_at,
        })
        .eq("id", conversationId);
    });

    socket.on("message_error", ({ tempId }) => {
      set((state) => {
        const updated = Object.fromEntries(
          Object.entries(state.messages).map(([cid, msgs]) => [
            cid,
            msgs.map((m) =>
              m.id === tempId ? { ...m, status: "failed" as const } : m
            ),
          ])
        );

        return { messages: updated };
      });
    });

    set({ isListening: true });
  },

  // =====================
  // Join room
  // =====================
  joinChat: (conversationId) => {
    const socket = getSocket();
    socket?.emit("join_room", conversationId);
  },

  // =====================
  // Cleanup
  // =====================
  cleanup: () => {
    const socket = getSocket();

    socket?.off("new_message");
    socket?.off("message_error");

    set({ isListening: false });
  },
}));