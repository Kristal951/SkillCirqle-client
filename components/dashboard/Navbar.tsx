import { Bell, Coins } from "lucide-react";
import React from "react";
import ThemeToggle from "../ToggleThemeButton";
import { useTokenStore } from "@/store/useTokenStore";
import { useAuthStore } from "@/store/useAuthStore";

const Navbar = () => {
  const { tokens } = useTokenStore();

  return (
    <div className="left-64 bg-background/90 fixed right-0 backdrop-blur-md h-16 flex items-center justify-end border-b border-border/20 p-4">
      <div className="flex items-center gap-4">
        <div className="px-3 py-2 flex gap-2 items-center bg-accent/20 rounded-2xl">
          <Coins className="text-accent w-4 h-4" />
          <p className="text-sm font-medium text-accent">
            {tokens ?? 0}
          </p>
        </div>

        <div className="relative cursor-pointer p-2 hover:bg-text-secondary/20 rounded-full">
          <Bell />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>

        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;