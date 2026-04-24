import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket) return socket;

  const API_URL = process.env.NEXT_PUBLIC_API_URI;

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URI is not defined");
  }

  socket = io(API_URL, {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Optional: Add global listeners for debugging
  socket.on("connect", () => {
    console.log("🚀 Socket connected:");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Connection Error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; 
  }
};

export const getSocket = () => socket;
