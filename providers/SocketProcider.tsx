"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { connectSocket, getSocket } from "@/lib/socket";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const user = useAuthStore((s) => s.user);
  
  // Use a ref to track if we are currently in the middle of an async connection attempt
  const isConnecting = useRef(false);
  const connectedUserId = useRef<string | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      // 1. Exit if no user or we are already connecting/connected to this user
      if (!user?.id || isConnecting.current || connectedUserId.current === user.id) return;

      isConnecting.current = true;

      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;

        if (token) {
          connectSocket(token);
          connectedUserId.current = user.id;
        }
      } catch (error) {
        console.error("Socket initialization failed:", error);
      } finally {
        isConnecting.current = false;
      }
    };

    initSocket();
  }, [user?.id, supabase]); // Only depend on the ID, not the whole object

  // Handle Logout
  useEffect(() => {
    if (!user) {
      const socket = getSocket();
      if (socket) {
        console.log("Cleaning up socket on logout");
        socket.disconnect();
        // socket.off() is usually better than removeAllListeners if you have global listeners
        socket.removeAllListeners(); 
        connectedUserId.current = null;
      }
    }
  }, [user]);

  return <>{children}</>;
}