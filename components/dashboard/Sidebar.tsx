"use client";

import { NavLinks } from "@/utils/Navbar";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useLogoutModal } from "@/providers/LogoutContext";
import { useSidebarStore } from "@/store/useSidebarStore";

interface SidebarProps {
  isSideBarOpen: boolean;
  setIsSideBarOpen: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({ isSideBarOpen, setIsSideBarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const { openLogoutModal } = useLogoutModal();

  const closeSidebar = () => {
    if (isSideBarOpen) setIsSideBarOpen(false);
  };

  return (
    <>
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`h-full bg-background border-r border-border/20 flex flex-col scrollbar-hide transition-all duration-300
          ${isSideBarOpen
            ? "fixed translate-x-0 w-72 z-50"
            : "fixed -translate-x-full md:relative md:translate-x-0"}
          ${!isSideBarOpen && (isCollapsed ? "md:w-20" : "md:w-72")}
        `}
      >
        <div className="px-4 py-6 flex items-center justify-between">
          {(!isCollapsed || isSideBarOpen) && (
            <div className="flex items-center">
              <Image
                src="/SkillCirqle.webp"
                alt="SkillCirqle"
                width={24}
                height={27}
                priority
              />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent ml-2">
                SkillCirqle
              </h1>
            </div>
          )}

          <button
            onClick={isSideBarOpen ? closeSidebar : toggleCollapsed}
            className="p-2 rounded-lg hover:bg-secondary transition"
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

        <nav className="flex-1 px-3 py-2 space-y-3 scrollbar-hide overflow-y-auto">
          {NavLinks.map((link, i) => {
            const isActive =
              pathname === link.path ||
              (link.path !== "/" && pathname.startsWith(link.path));

            const Icon = link.icon;

            return (
              <Link
                key={i}
                href={link.path}
                onClick={closeSidebar}
                className={`flex items-center gap-4 px-3 py-2.5 transition group relative
                  ${link.onlyOnDesktop ? "hidden md:flex" : ""}
                  ${
                    isActive
                      ? "text-text-primary font-semibold border-r-2 border-text-primary"
                      : "text-text-secondary hover:bg-secondary hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-6 h-6 shrink-0" weight={isActive ? "fill" : "regular"} />

                {(!isCollapsed || isSideBarOpen) ? (
                  <span className="text-sm whitespace-nowrap">
                    {link.title}
                  </span>
                ) : (
                  <div className="absolute left-2 top-10 bg-primary text-text-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                    {link.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {(!isCollapsed || isSideBarOpen) && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-text-secondary truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>

          {(!isCollapsed || isSideBarOpen) && (
            <button
              onClick={openLogoutModal}
              className="p-2 hover:bg-red-500/10 rounded-md"
            >
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-red-500" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;