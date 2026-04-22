import { useSocketStore } from "@/store/useSocketStore";
import { getSocket } from "./socket";

let initialized = false;

export const initSocketEvents = () => {
  const socket = getSocket();
  if (!socket || initialized) return;

  initialized = true;

  const {
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    setTypingUsers,
  } = useSocketStore.getState();

  console.log("🧠 Socket events initialized");

  // =====================
  // 🟢 ONLINE USERS (INITIAL SYNC)
  // =====================
  socket.on("online_users", (users: string[]) => {
    console.log(users, 'socke')
    setOnlineUsers(users);
  });

  // =====================
  // 🟢 ONLINE / OFFLINE EVENTS
  // =====================
  socket.on("user_online", ({ userId }) => {
    addOnlineUser(userId);
  });

  socket.on("user_offline", ({ userId }) => {
    removeOnlineUser(userId);
  });

  // =====================
  // 🟡 TYPING (conversation scoped)
  // =====================
  socket.on("typing", ({ conversationId, users }) => {
    setTypingUsers(conversationId, users);
  });

  // =====================
  // 🔌 CLEANUP ON DISCONNECT
  // =====================
  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");

    initialized = false;

    socket.off("online_users");
    socket.off("user_online");
    socket.off("user_offline");
    socket.off("typing");
  });
};