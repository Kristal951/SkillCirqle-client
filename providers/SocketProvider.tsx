"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { connectSocket, getSocket } from "@/lib/socket";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { initSocketEvents } from "@/lib/socketEvents";
import { SocketContext } from "./SocketContext";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getSupabaseBrowserClient();
  const user = useAuthStore((s) => s.user);

  const isConnecting = useRef(false);
  const connectedUserId = useRef<string | null>(null);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      if (
        !user?.id ||
        isConnecting.current ||
        connectedUserId.current === user.id
      ) {
        return;
      }

      isConnecting.current = true;

      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;

        if (!token) return;

        const socket = connectSocket(token);

        if (!socket) return;

        if (!socket.connected) {
          socket.once("connect", () => {
            initSocketEvents();
            setSocketReady(true);
          });
        } else {
          initSocketEvents();
          setSocketReady(true);
        }
        connectedUserId.current = user.id;
      } catch (error) {
        console.error("❌ Socket initialization failed:", error);
      } finally {
        isConnecting.current = false;
      }
    };

    initSocket();
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      const socket = getSocket();
      if (socket) {
        console.log("🔌 Cleaning up socket on logout");
        socket.removeAllListeners();
        socket.disconnect();
        connectedUserId.current = null;
      }
      setSocketReady(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socketReady }}>
      {children}
    </SocketContext.Provider>
  );
}
