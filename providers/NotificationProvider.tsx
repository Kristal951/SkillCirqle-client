import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { fetchNotifications, listenToNotifications, cleanup } =
    useNotificationsStore();

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications(user.id);

    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => {
      console.log("🔌 socket connected in notifications provider");

      listenToNotifications();
    };

    if (socket.connected) {
      listenToNotifications();
    } else {
      socket.on("connect", handleConnect);
    }

    return () => {
      socket?.off("connect", handleConnect);
      cleanup();
    };
  }, [user?.id]);

  return <>{children}</>;
}
