"use client";
import { Bell, Coins, Flame, Menu, Settings } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import ThemeToggle from "../ToggleThemeButton";
import { useTokenStore } from "@/store/useTokenStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface NavbarProps {
  setIsSideBarOpen: Dispatch<SetStateAction<boolean>>;
}

const Navbar = ({ setIsSideBarOpen }: NavbarProps) => {
  const { tokens } = useTokenStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const [openMenu, setOpenMenu] = useState(false);

  const toggleMenu = () => {
    setOpenMenu((prev) => !prev);
  };

  return (
    <div className="md:left-64 left-0 bg-background/90 fixed right-0 backdrop-blur-md h-16 flex justify-end items-center md:justify-end lg:justify-end border-b border-border/20 px-4">
      <div className="w-full flex items-center md:hidden lg:hidden gap-1">
        <img src="/SkillCirqle.svg" alt="" className="w-6 h-6" />
        <h1 className="text-[16px] text-transparent font-bold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text truncate ">
          SkillCirqle
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* <div className="px-3 py-2 flex gap-2 items-center bg-accent/20 rounded-2xl">
          <Flame className="text-accent w-4 h-4" />
          <p className="text-sm font-medium text-accent">0</p>
        </div> */}
        <div className="px-3 py-2 flex gap-2 items-center bg-accent/20 rounded-2xl">
          <Coins className="text-accent w-4 h-4" />
          <p className="text-sm font-medium text-accent">{tokens ?? 0}</p>
        </div>

        <Link
          href="/notifications"
          className="relative cursor-pointer p-2 hover:bg-text-secondary/20 rounded-full"
        >
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Link>

        <div className="hidden md:flex lg:flex">
          <ThemeToggle />
        </div>

        <button
          onClick={toggleMenu}
          className="relative w-10 h-10 md:hidden shrink-0"
        >
          <Image
            src={user?.avatar_url || "/default-avatar.png"}
            alt={user?.name || "Profile"}
            fill
            sizes="28px"
            className="rounded-full object-cover border border-border/30"
            unoptimized
          />
        </button>
      </div>

      {openMenu && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border rounded-xl shadow-xl z-200 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 origin-top-right">
          <div className="p-1.5 flex flex-col gap-0.5">
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-background rounded-lg transition-colors w-full group"
            >
              <span className="material-symbols-outlined text-lg text-text-secondary group-hover:text-primary transition-colors">
                settings
              </span>
              <span className="font-medium">Settings</span>
            </button>

            <div className="h-px bg-border/50 my-1 mx-1" />

            <button
              // onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors w-full group"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
