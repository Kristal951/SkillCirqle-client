"use client";

import { NavLinks } from "@/utils/Navbar";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useTokenStore } from "@/store/useTokenStore";

interface SidebarProps {
  isSideBarOpen: boolean;
  loggingOut: boolean;
  setIsSideBarOpen: Dispatch<SetStateAction<boolean>>;
  setLoggingOut: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({
  isSideBarOpen,
  setIsSideBarOpen,
  setLoggingOut,
}: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout, setUser } = useAuthStore();
  const { setTokens, setTotal } = useTokenStore();

  const closeSidebar = () => {
    if (isSideBarOpen) setIsSideBarOpen(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = await getSupabaseBrowserClient();
      await supabase.auth.signOut();

      setUser(null);
      setTokens(0);
      setTotal(0);

      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`w-72 h-full bg-background border-r border-border/20 flex flex-col transition-transform duration-300 z-50
          ${isSideBarOpen ? "fixed translate-x-0" : "fixed -translate-x-full md:relative md:translate-x-0"}
        `}
      >
        <div className="px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            SkillCirqle
          </h1>

          <button onClick={closeSidebar} className="md:hidden lg:hidden">
            <X />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NavLinks.map((link, i) => {
            const isActive =
              pathname === link.path ||
              (link.path !== "/" && pathname.startsWith(link.path));

            return (
              <Link
                key={i}
                href={link.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group ${
                  isActive
                    ? "border-r-2 text-white font-semibold"
                    : "text-text-secondary hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {link.icon}
                </span>
                <span className="text-sm">{link.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/20 bg-muted/30">
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/20 shrink-0 overflow-hidden flex items-center justify-center text-primary font-bold border border-primary/10">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>{user?.name?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium truncate leading-none mb-1">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-text-secondary truncate leading-none">
                  {user?.email || "No email"}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout?.()}
              className="p-2 hover:bg-red-500/10 rounded-md transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
