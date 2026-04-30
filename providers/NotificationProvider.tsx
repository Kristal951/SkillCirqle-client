"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useSocketContext } from "./SocketContext";
import { Rss } from "lucide-react";

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { listenToNotifications, cleanup, fetchNotifications } =
    useNotificationsStore();

  const { socketReady } = useSocketContext();

  const handleFetchNotifications = async () => {
    if (!user?.id) return;
    await fetchNotifications(user.id);
  };

  useEffect(() => {
    if (!user?.id || !socketReady) return;

    const socket = getSocket();
    if (!socket) return;

    cleanup();

    handleFetchNotifications();

    const setupListeners = () => {
      console.log("🔌 socket connected in notifications provider");
      listenToNotifications();
    };

    if (socket.connected) {
      setupListeners();
    } else {
      socket.once("connect", setupListeners);
    }

    return () => {
      cleanup();
      socket.off("connect", setupListeners);
    };
  }, [user?.id, socketReady]);

  return <>{children}</>;
}
