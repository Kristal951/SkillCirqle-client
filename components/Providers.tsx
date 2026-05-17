"use client";

import { ThemeProvider } from "next-themes";
import ToastContainer from "./ui/ToastContainer";
import { Analytics } from "@vercel/analytics/next";
import AuthProvider from "@/providers/AuthProvider";
import SocketProvider from "@/providers/SocketProvider";
import NotificationProvider from "@/providers/NotificationProvider";
import { LogoutModalProvider } from "@/providers/LogoutContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastContainer />
      <AuthProvider>
        <Analytics />
        <SocketProvider>
          <NotificationProvider>
            <LogoutModalProvider>{children}</LogoutModalProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
