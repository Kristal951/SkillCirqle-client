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

  const { addNotification,  } = useNotificationsStore.getState();

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

  socket.on("typing", ({ conversationId, userId }) => {
    if (!conversationId || !userId) return;
    addTypingUser(conversationId, userId);
  });

  socket.on("stop_typing", ({ conversationId, userId }) => {
    if (!conversationId || !userId) return;
    removeTypingUser(conversationId, userId);
  });

  socket.on("proposal:updated", (proposal) => {
    // you can update proposal store here if needed
    console.log("Proposal updated:", proposal);
  });

  socket.on("proposal:created", (proposal) => {
    console.log("Proposal created:", proposal);
  });

  initialized = true;
};