"use client";

import { useContext, useEffect } from "react";
import AdminNavbar from "@/components/admin/Navbar";
import AdminSidebar from "@/components/admin/Sidebar";
import { useAdminSidebarStore } from "@/store/useAdminStore";
import { getSocket } from "@/lib/socket";
import { SocketContext } from "@/providers/SocketContext";
import AdminNotificationProvider from "@/providers/AdminNotificationProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setAdminModeReady } = useAdminSidebarStore();
  const { socketReady } = useContext(SocketContext);

  useEffect(() => {
    if (!socketReady) return;
    const socket = getSocket();
    if (!socket) return;

    const joinAdmin = () => {
      socket.emit("admin:join", (res: { success: boolean; message?: string }) => {
        if (res.success) {
          setAdminModeReady(true);
        } else {
          console.error("Failed to enter admin mode:", res.message);
          setAdminModeReady(false);
        }
      });
    };

    if (socket.connected) {
      joinAdmin();
    }
    socket.on("connect", joinAdmin);

    return () => {
      socket.off("connect", joinAdmin);

      if (socket.connected) {
        socket.emit("admin:leave");
      }
      setAdminModeReady(false);
    };
  }, [socketReady]);

  return (
    <AdminNotificationProvider>
      <main className="h-screen overflow-hidden bg-background">
        <AdminSidebar />

        <div
          className={`flex h-full flex-col transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"
            }`}
        >
          <AdminNavbar />

          <main className="flex-1 overflow-y-auto mt-20 bg-background">
            {children}
          </main>
        </div>
      </main>
    </AdminNotificationProvider>
  );
}
