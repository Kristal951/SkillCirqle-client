import { toast } from "@/lib/toast";
import { MessageActionsState } from "@/types/MessageStore";
import { create } from "zustand";
import { getSocket } from "@/lib/socket";

export const useMessageActionsStore = create<MessageActionsState>(
  (set, get) => ({
    activeMessageId: null,
    replyingTo: null,
    editingMessage: null,
    setEditingMessage: (msg) => set({ editingMessage: msg }),

    setActiveMessage: (id) => set({ activeMessageId: id }),

    toggleMessageMenu: (id) =>
      set((state) => ({
        activeMessageId: state.activeMessageId === id ? null : id,
      })),

    setReply: (msg) => set({ replyingTo: msg }),

    clearAll: () =>
      set({
        activeMessageId: null,
        replyingTo: null,
        editingMessage: null,
      }),

    copyMessage: async (msg) => {
      let text = "";

      if (msg.type === "text" && msg.message) {
        text = msg.message;
      } else if (msg.media?.length) {
        text = msg.media.map((m) => m.url).join("\n");
      }

      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        toast.info("Copied to clipboard");
      } catch (err) {
        console.error(err);
        toast.error("Failed to copy");
      }
    },

    deleteMessage: async (msgId, conversationId) => {
      const socket = getSocket();
      try {
        socket?.emit("delete_message", {
          messageId: msgId,
          conversationId: conversationId,
        });
          toast.info("Message deleted");
      } catch (error) {
        console.log(error);
      }
    },
  }),
);
