"use client";

import { NavLinks } from "@/utils/Navbar";
import Link from "next/link";
import React, { Dispatch, SetStateAction, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useTokenStore } from "@/store/useTokenStore";
import Image from "next/image";
import { useLogoutModal } from "@/providers/LogoutContext";

interface SidebarProps {
  isSideBarOpen: boolean;
  setIsSideBarOpen: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({ isSideBarOpen, setIsSideBarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const closeSidebar = () => {
    if (isSideBarOpen) setIsSideBarOpen(false);
  };

  const { openLogoutModal } = useLogoutModal();

  return (
    <>
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-8 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`h-full bg-background border-r border-border/20 flex flex-col transition-all duration-300 z-80
          ${isSideBarOpen ? "fixed translate-x-0 w-72" : "fixed -translate-x-full md:relative md:translate-x-0"}
          ${!isSideBarOpen && (isCollapsed ? "md:w-20" : "md:w-72")}
        `}
      >
        <div className="px-4 py-6 flex items-center justify-between overflow-hidden">
          {(!isCollapsed || isSideBarOpen) && (
            <div className="w-full flex items-center">
              <Image
                src="/SkillCirqle.webp"
                alt="SkillCirqle"
                width={24}
                height={27}
                priority
              />
              <h1 className="text-xl text-transparent font-bold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text truncate ml-2">
                SkillCirqle
              </h1>
            </div>
          )}

          <button
            onClick={
              isSideBarOpen ? closeSidebar : () => setIsCollapsed(!isCollapsed)
            }
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isSideBarOpen ? (
              <X size={20} />
            ) : isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto overflow-x-hidden">
          {NavLinks.map((link, i) => {
            const isProfile = link.path === "/profile";
            const isActive =
              pathname === link.path ||
              (link.path !== "/" && pathname.startsWith(link.path));

            return (
              <Link
                key={i}
                href={link.path}
                onClick={closeSidebar}
                className={`flex items-center gap-4 px-3  ${link.onlyOnDesktop ? "hidden md:flex lg:flex" : ""} py-2.5 transition-all duration-200 group relative ${
                  isActive
                    ? "text-text-primary border-r-2 font-semibold"
                    : "text-text-secondary hover:bg-secondary hover:text-foreground"
                }`}
              >
                {isProfile ? (
                  <>
                    <div className="relative w-7 h-7 md:hidden shrink-0">
                      <Image
                        src={user?.avatar_url || "/default-avatar.png"}
                        alt={user?.name || "Profile"}
                        fill
                        sizes="28px"
                        className="rounded-full object-cover border border-border/30"
                        unoptimized
                      />
                    </div>

                    <span className="material-symbols-outlined hidden md:block text-2xl shrink-0">
                      person
                    </span>
                  </>
                ) : (
                  <span
                    className="material-symbols-outlined text-2xl shrink-0"
                    style={{
                      fontVariationSettings: isActive
                        ? "'FILL' 1, 'wght' 400"
                        : "'FILL' 0, 'wght' 400",
                    }}
                  >
                    {link.icon}
                  </span>
                )}

                {!isCollapsed || isSideBarOpen ? (
                  <span className="text-sm transition-opacity duration-300 whitespace-nowrap">
                    {link.title}
                  </span>
                ) : (
                  <div className="absolute left-0 -bottom-6 bg-primary text-text-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-100">
                    {link.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className={`p-4 border-t border-border/20 bg-muted/30 transition-all ${isCollapsed && !isSideBarOpen ? "items-center" : ""}`}
        >
          <div className="flex items-center justify-between w-full gap-3 overflow-hidden">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/20 shrink-0 overflow-hidden flex items-center justify-center text-primary font-bold border border-primary/10">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="P"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>{user?.name?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>

              {(!isCollapsed || isSideBarOpen) && (
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium truncate leading-none mb-1 text-foreground">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate leading-none">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>

            {(!isCollapsed || isSideBarOpen) && (
              <button
                onClick={() => openLogoutModal()}
                className="p-2 hover:bg-red-500/10 rounded-md transition-colors group shrink-0"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
