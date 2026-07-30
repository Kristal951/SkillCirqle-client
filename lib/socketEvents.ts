import { useSocketStore } from "@/store/useSocketStore";
import { getSocket } from "./socket";

let initialized = false;
let socketRef: ReturnType<typeof getSocket> | null = null;

export const initSocketEvents = () => {
  const socket = getSocket();
  if (!socket) return;

  if (initialized && socketRef === socket) return;

  socketRef = socket;

  const {
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    addTypingUser,
    removeTypingUser,
  } = useSocketStore.getState();

  console.log("🧠 Socket events initialized");

  socket.off("online_users");
  socket.off("user_online");
  socket.off("user_offline");
  socket.off("typing");
  socket.off("stop_typing");

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });

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

  socket.on("participant:joined-preview", ({ user }) => {
    console.log(`${user.name} joined the waiting room`);
  });

  socket.on("session-ended", ({ sessionId, reason }) => {
    console.log(`Session ${sessionId} ended with reason: ${reason}`);
  });

  socket.on("stop_typing", ({ conversationId, userId }) => {
    if (!conversationId || !userId) return;
    removeTypingUser(conversationId, userId);
  });

  initialized = true;
};
