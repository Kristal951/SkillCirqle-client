"use client";

import { ThemeProvider } from "next-themes";
import { useAuthListener } from "@/hooks/useAuthListener";
import { useSessionSync } from "@/hooks/useSessionSync";
import { useAuthHydrate } from "@/hooks/useAuthHydrate";
import ToastContainer from "./ui/ToastContainer";

export default function Providers({ children }: { children: React.ReactNode }) {
  useAuthHydrate();
  useAuthListener();
  useSessionSync();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastContainer />
      {children}
    </ThemeProvider>
  );
}
