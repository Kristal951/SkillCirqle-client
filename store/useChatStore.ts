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
  sender: {
    avatar: string;
  };
  status?: "sending" | "sent" | "failed";
  isTemp?: boolean;
};

type ChatStore = {
  messages: Record<string, Message[]>;
  activeChat: ActiveChat | null;

  setActiveChat: (chat: ActiveChat | null) => void;

  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (data: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: "text" | "image";
    metadata?: any;
    senderAvatar: string;
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

  setActiveChat: (chat) => set({ activeChat: chat }),

  // =====================
  // FETCH MESSAGES (FIXED)
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
        [conversationId]: data || [],
      },
    }));
  },

  // =====================
  // SEND MESSAGE (OPTIMISTIC + SAFE)
  // =====================
  sendMessage: ({
    conversationId,
    senderId,
    content,
    type = "text",
    metadata,
    senderAvatar,
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
      sender: {
        avatar: senderAvatar || "",
      },
    };

    // optimistic update
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
  // LISTEN FOR MESSAGES (FIXED DUPLICATES)
  // =====================
  listenForMessages: () => {
    const socket = getSocket();
    if (!socket) return;

    // 🚨 HARD RESET (prevents duplicates)
    socket.off("new_message");
    socket.off("message_error");

    // =====================
    // NEW MESSAGE
    // =====================
    socket.on("new_message", (msg: any) => {
      const conversationId = msg.conversation_id;

      set((state) => {
        const existing = state.messages[conversationId] || [];

        // 🔥 STRICT DEDUPE (fixes receiver duplicates)
        const alreadyExists = existing.some(
          (m) => m.id === msg.id || (msg.tempId && m.id === msg.tempId)
        );

        if (alreadyExists) return state;

        // replace temp message if exists
        const updated = existing.map((m) =>
          msg.tempId && m.id === msg.tempId
            ? { ...msg, status: "sent", isTemp: false }
            : m
        );

        return {
          messages: {
            ...state.messages,
            [conversationId]: [...updated, msg],
          },
        };
      });
    });

    // =====================
    // ERROR HANDLING
    // =====================
    socket.on("message_error", ({ tempId }) => {
      set((state) => {
        const updated: Record<string, Message[]> = {};

        for (const cid in state.messages) {
          updated[cid] = state.messages[cid].map((m) =>
            m.id === tempId ? { ...m, status: "failed" } : m
          );
        }

        return { messages: updated };
      });
    });
  },

  // =====================
  // JOIN CHAT ROOM
  // =====================
  joinChat: (conversationId) => {
    const socket = getSocket();
    socket?.emit("join_room", conversationId);
  },

  // =====================
  // CLEANUP
  // =====================
  cleanup: () => {
    const socket = getSocket();

    socket?.off("new_message");
    socket?.off("message_error");
  },
}));