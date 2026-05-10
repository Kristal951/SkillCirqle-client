import { useSocketStore } from "@/store/useSocketStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { getSocket } from "./socket";

let initialized = false;

export const initSocketEvents = () => {
  if (initialized) return;

  const socket = getSocket();
  if (!socket) return;

  const {
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    addTypingUser,
    removeTypingUser,
  } = useSocketStore.getState();

  console.log("🧠 Socket events initialized");

  /**
   * ONLINE USERS
   */
  socket.on("online_users", (users: string[]) => {
    setOnlineUsers(users);
  });

  socket.on("user_online", ({ userId }) => {
    addOnlineUser(userId);
  });

  socket.on("user_offline", ({ userId }) => {
    removeOnlineUser(userId);
  });

  socket.on("typing", ({ conversationId, user }) => {
    if (!conversationId || !user) return;
    addTypingUser(conversationId, user);
  });

  socket.on("stop_typing", ({ conversationId, userId }) => {
    if (!conversationId || !userId) return;
    removeTypingUser(conversationId, userId);
  });

  initialized = true;
};