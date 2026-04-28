"use client";

import { ThemeProvider } from "next-themes";
import ToastContainer from "./ui/ToastContainer";
import { Analytics } from "@vercel/analytics/next";
import AuthProvider from "@/providers/AuthProvider";
import SocketProvider from "@/providers/SocketProvider";
import NotificationProvider from "@/providers/NotificationProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastContainer />
      <AuthProvider>
        <Analytics />
        <SocketProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
