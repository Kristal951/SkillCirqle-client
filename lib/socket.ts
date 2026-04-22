import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  // If socket already exists, don't create a new one.
  // This prevents multiple instances even if the first one hasn't finished connecting yet.
  if (socket) return socket;

  socket = io("http://localhost:5000", {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Optional: Add global listeners for debugging
  socket.on("connect", () => {
    console.log("🚀 Socket connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Connection Error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Important: Clear the reference so it can be re-initialized
  }
};

export const getSocket = () => socket;