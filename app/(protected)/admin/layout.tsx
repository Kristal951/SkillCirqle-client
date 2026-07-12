"use client";

import { useContext, useEffect } from "react";
import AdminNavbar from "@/components/admin/Navbar";
import AdminSidebar from "@/components/admin/Sidebar";
import { useAdminSidebarStore } from "@/store/useAdminStore";
import { getSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";
import { SocketContext } from "@/providers/SocketContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useAdminSidebarStore();
  const { socketReady } = useContext(SocketContext);

  useEffect(() => {
    if (!socketReady) return;
    const socket = getSocket();
    if (!socket) return;

    const joinAdmin = () => {
      socket?.emit("admin:join");
    };

    if (socket?.connected) {
      joinAdmin();
    } else {
      socket?.once("connect", joinAdmin);
    }

    return () => {
      socket?.off("connect", joinAdmin);

      if (socket?.connected) {
        socket?.emit("admin:leave");
      }
    };
  }, [socketReady]);

  return (
    <main className="h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <div
        className={`flex h-full flex-col transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto mt-20 bg-background">
          {children}
        </main>
      </div>
    </main>
  );
}
