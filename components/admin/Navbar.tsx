"use client";

import { Menu, Search, Bell, Command } from "lucide-react";
import { useAdminSidebarStore } from "@/store/useAdminStore";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { formatRole } from "@/store/formatRole";

export default function AdminNavbar() {
  const { setShowMobileSidebar } = useAdminSidebarStore();
  const { user } = useAuthStore();

  return (
    <header className="fixed right-0 left-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/60 md:px-6 px-3 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="md:hidden rounded-xl hover:bg-background-hover transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} className="text-text-secondary" />
        </button>
      </div>

      <div className="hidden lg:flex flex-1 max-w-sm mx-6">
        <div className="relative w-full group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-surface/50 text-sm outline-none transition-all focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
            <Command size={12} />{" "}
            <span className="text-[10px] font-bold">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative md:p-2.5 rounded-xl hover:bg-background-hover text-text-secondary transition-all hover:text-text-primary">
          <Bell size={23} />
          {/* <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" /> */}
        </button>

        <div className="flex items-center gap-3 md:pl-6 pl-4 border-l border-border">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-text-primary leading-none">
              {user?.name}
            </p>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
              {formatRole(user?.role)}
            </p>
          </div>
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user?.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-sm text-primary">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
