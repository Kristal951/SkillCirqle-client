"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import ToastContainer from "./ui/ToastContainer";
import { Analytics } from "@vercel/analytics/next";
import AuthProvider from "@/providers/AuthProvider";
import { LogoutModalProvider } from "@/providers/LogoutContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthErrorToast from "@/providers/AuthErrorToast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastContainer />
      <AuthProvider>
        <AuthErrorToast />
        <Analytics />
        <LogoutModalProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </LogoutModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
