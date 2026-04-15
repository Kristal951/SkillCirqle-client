"use client";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import ThemeToggle from "@/components/ToggleThemeButton";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <div className="flex relative flex-col h-screen">
      <Navbar
        setIsSideBarOpen={setIsSideBarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isSideBarOpen={isSideBarOpen}
          setLoggingOut={setLoggingOut}
          setIsSideBarOpen={setIsSideBarOpen}
        />

        <main className="flex-1 overflow-y-auto mt-17.5">
          {children}
        </main>

        <div className="md:hidden lg:hidden absolute bottom-2 right-2">
          <ThemeToggle/>
        </div>
      </div>
    </div>
  );
}
