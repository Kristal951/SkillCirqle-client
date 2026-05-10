import { create } from "zustand";

type TypingUser = {
  id: string;
  name: string;
  avatar: string;
};

type SocketState = {
  onlineUsers: Set<string>;
  typingUsers: Record<string, TypingUser[]>;

  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  isOnline: (userId: string) => boolean;

  addTypingUser: (conversationId: string, user: TypingUser) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  isTyping: (conversationId: string, userId: string) => boolean;
};

export const useSocketStore = create<SocketState>((set, get) => ({
  onlineUsers: new Set(),
  typingUsers: {},

  setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),

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

  addTypingUser: (conversationId: string, user: TypingUser) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];

      const exists = current.some((u) => u.id === user.id);
      if (exists) return state;

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, user],
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter((u) => u.id !== userId),
        },
      };
    }),

  isTyping: (conversationId, userId) =>
    get().typingUsers[conversationId]?.some((u) => u.id === userId) || false,
}));
