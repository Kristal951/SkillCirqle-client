"use client";
import { Bell, Coins, Flame, Menu } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";
import ThemeToggle from "../ToggleThemeButton";
import { useTokenStore } from "@/store/useTokenStore";

interface NavbarProps {
  setIsSideBarOpen: Dispatch<SetStateAction<boolean>>;
}

const Navbar = ({setIsSideBarOpen }: NavbarProps) => {
  const { tokens } = useTokenStore();

  const toggleSidebar = () => {
    setIsSideBarOpen((prev) => !prev);
  };

  return (
    <div className="md:left-64 left-0 bg-background/90 fixed right-0 backdrop-blur-md h-16 flex justify-between items-center md:justify-end lg:justify-end border-b border-border/20 p-4">
      <button onClick={toggleSidebar} className="md:hidden lg:hidden">
        <Menu className="text-3xl" />
      </button>

      <div className="flex items-center gap-4">
        <div className="px-3 py-2 flex gap-2 items-center bg-accent/20 rounded-2xl">
          <Flame className="text-accent w-4 h-4" />
          <p className="text-sm font-medium text-accent">0</p>
        </div>
        <div className="px-3 py-2 flex gap-2 items-center bg-accent/20 rounded-2xl">
          <Coins className="text-accent w-4 h-4" />
          <p className="text-sm font-medium text-accent">{tokens ?? 0}</p>
        </div>

        <div className="relative cursor-pointer p-2 hover:bg-text-secondary/20 rounded-full">
          <Bell />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>

        <div className="hidden md:flex lg:flex">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
