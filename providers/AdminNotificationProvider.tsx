import { useContext, useEffect } from "react";
import { SocketContext } from "./SocketContext";
import { getSocket } from "@/lib/socket";

export default function AdminNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
   const { socketReady } = useContext(SocketContext);

  useEffect(() => {
    if (!socketReady) return;

    const socket = getSocket();
    if (!socket) return;

    const handleAdminNotification = (notification: any) => {
    };

    socket.on("notification:admin", handleAdminNotification);

    return () => {
      socket.off("notification:admin", handleAdminNotification);
    };
  }, [socketReady]);

  return <>{children}</>;
}
