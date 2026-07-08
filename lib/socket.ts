import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let readyResolvers: Array<(socket: Socket) => void> = [];

export const connectSocket = (token: string) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URI;

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URI is not defined");
  }

  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connection Error:", err.message);
    });

    // Fix: resolve anyone who was waiting on the instance to exist.
    readyResolvers.forEach((resolve) => resolve(socket!));
    readyResolvers = [];
  } else {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
};

export const getSocket = () => socket;

export const waitForSocket = (timeoutMs = 12000): Promise<Socket> => {
  if (socket) return Promise.resolve(socket);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      readyResolvers = readyResolvers.filter((r) => r !== onReady);
      reject(new Error("Socket instance was not created in time."));
    }, timeoutMs);

    const onReady = (s: Socket) => {
      clearTimeout(timeout);
      resolve(s);
    };

    readyResolvers.push(onReady);
  });
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};