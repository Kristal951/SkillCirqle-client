import { useSocketStore } from "@/store/useSocketStore";
import { getSocket } from "./socket";

let initialized = false;

export const initSocketEvents = () => {
  const socket = getSocket();
  if (!socket) return;

  const {
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    addTypingUser,
    removeTypingUser,
  } = useSocketStore.getState();

  // 🚨 ALWAYS CLEAR OLD LISTENERS FIRST (IMPORTANT FIX)
  socket.off("online_users");
  socket.off("user_online");
  socket.off("user_offline");
  socket.off("typing");
  socket.off("disconnect");

  console.log("🧠 Socket events initialized");

  socket.on("online_users", (users: string[]) => {
    setOnlineUsers(users);
  });

  socket.on("user_online", ({ userId }) => {
    addOnlineUser(userId);
  });

  socket.on("user_offline", ({ userId }) => {
    removeOnlineUser(userId);
  });

  socket.on("typing", ({conversationId, userId}) => {
    console.log(conversationId, userId)
    addTypingUser(conversationId, userId);
  });

  socket.on("stop_typing", ({ conversationId, userId }) => {
    removeTypingUser(conversationId, userId);
  });

  initialized = true;
};
