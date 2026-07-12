"use client";

import { NavLinks } from "@/utils/Navbar";
import Link from "next/link";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVerticalIcon,
  MoveVerticalIcon,
  Settings,
  ArrowRightLeft,
  ArrowRightLeftIcon,
} from "lucide-react";
import Image from "next/image";
import { useLogoutModal } from "@/providers/LogoutContext";
import { useSidebarStore } from "@/store/useSidebarStore";
import { formatRole } from "@/store/formatRole";
import { SocketContext } from "@/providers/SocketContext";
import { getSocket } from "@/lib/socket";

interface SidebarProps {
  isSideBarOpen: boolean;
  setIsSideBarOpen: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({ isSideBarOpen, setIsSideBarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const { openLogoutModal } = useLogoutModal();
  const [showMenu, setShowMenu] = useState(false);
  const { socketReady } = useContext(SocketContext);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const closeSidebar = () => {
    if (isSideBarOpen) setIsSideBarOpen(false);
  };

  const isAdmin = ["super_admin", "admin"].includes(user?.role || "");

  const handleSwitchMode = () => {
    if (!socketReady) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("admin:join", (res: any) => {
      if (!res.success) return;

      router.replace("/admin/dashboard");
    });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

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
          ${
            isSideBarOpen
              ? "fixed translate-x-0 w-72 z-50"
              : "fixed -translate-x-full md:relative md:translate-x-0"
          }
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
                <Icon
                  className="w-6 h-6 shrink-0"
                  weight={isActive ? "fill" : "regular"}
                />

                {!isCollapsed || isSideBarOpen ? (
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

        <div className="p-4 relative border-t border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() || "U"}</span>
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
              onClick={() => {
                if (isAdmin) {
                  setShowMenu((prev) => !prev);
                } else {
                  openLogoutModal();
                }
              }}
              className={`p-2 ${isAdmin ? "hover:bg-text-secondary/10" : "hover:bg-red-500/10"} rounded-md`}
            >
              {isAdmin ? (
                <MoreVerticalIcon className="w-5 h-5 text-text-secondary" />
              ) : (
                <LogOut className="w-5 h-5 text-text-secondary hover:text-red-500" />
              )}
            </button>
          )}
        </div>

        {showMenu && (
          <div
            ref={menuRef}
            className="
absolute
bottom-14
right-4
mb-2
w-64
overflow-hidden
rounded-xl
border
border-border
bg-surface
shadow-2xl
animate-in
fade-in
zoom-in-95
duration-150
"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary/10">
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-base font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-text-primary">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-text-secondary">
                  {formatRole(user?.role)}
                </p>
              </div>
            </div>

            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-background"
              onClick={() => {
                setShowMenu(false);
                handleSwitchMode();
              }}
            >
              <ArrowRightLeftIcon size={16} />
              Switch to Admin Mode
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                openLogoutModal();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
