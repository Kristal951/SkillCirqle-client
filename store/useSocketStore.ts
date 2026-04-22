import { create } from "zustand";

type SocketState = {
  // 🟢 ONLINE USERS (Set for performance)
  onlineUsers: Set<string>;

  // 🟡 TYPING (conversation scoped)
  typingUsers: Record<string, Set<string>>;

  // ===== ONLINE =====
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  isOnline: (userId: string) => boolean;

  // ===== TYPING =====
  setTypingUsers: (conversationId: string, users: string[]) => void;
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  isTyping: (conversationId: string, userId: string) => boolean;
};

export const useSocketStore = create<SocketState>((set, get) => ({
  onlineUsers: new Set(),
  typingUsers: {},

  // =====================
  // 🟢 ONLINE
  // =====================
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

  // =====================
  // 🟡 TYPING
  // =====================
  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: new Set(users),
      },
    })),

  addTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || new Set();
      const updated = new Set(current);
      updated.add(userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: updated,
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId];
      if (!current) return state;

      const updated = new Set(current);
      updated.delete(userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: updated,
        },
      };
    }),

  isTyping: (conversationId, userId) =>
    get().typingUsers[conversationId]?.has(userId) || false,
}));