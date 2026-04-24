import { create } from "zustand";

type SocketState = {
  onlineUsers: Set<string>;
  typingUsers: Record<string, string[]>; 

  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  isOnline: (userId: string) => boolean;

  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  isTyping: (conversationId: string, userId: string) => boolean;
};

export const useSocketStore = create<SocketState>((set, get) => ({
  onlineUsers: new Set(),
  typingUsers: {},

  setOnlineUsers: (users) =>
    set({ onlineUsers: new Set(users) }),

  addOnlineUser: (userId) =>
    set((state) => {
      const updated = new Set(state.onlineUsers);
      updated.add(userId);
      return { onlineUsers: updated };
    }),

  removeOnlineUser: (userId) =>
    set((state) => {
      const updated = new Set(state.onlineUsers);
      updated.delete(userId);
      return { onlineUsers: updated };
    }),

  isOnline: (userId) => get().onlineUsers.has(userId),

  addTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];

      if (current.includes(userId)) return state;

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, userId],
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter((id) => id !== userId),
        },
      };
    }),

  isTyping: (conversationId, userId) =>
    get().typingUsers[conversationId]?.includes(userId) || false,
}));