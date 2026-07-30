"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Star,
  Bell,
  ShieldAlert,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  MoveVerticalIcon,
  MoreVerticalIcon,
  ArrowRightLeft,
  ArrowRightLeftIcon,
  BadgeCheck,
} from "lucide-react";
import { useAdminSidebarStore } from "@/store/useAdminStore";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { useContext, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { SocketContext } from "@/providers/SocketContext";
import { formatRole } from "@/store/formatRole";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Sessions", href: "/admin/sessions", icon: Calendar },
      { label: "Ratings", href: "/admin/ratings", icon: Star },
      {
        label: "Skill Verifications",
        href: "/admin/skill-verifications",
        icon: BadgeCheck,
      },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      {
        label: "Trust & Safety",
        href: "/admin/trust-safety",
        icon: ShieldAlert,
      },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Configuration",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

interface AdminSidebarProps {
  adminName?: string;
  adminEmail?: string;
  onLogout?: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const {
    isCollapsed,
    toggle,
    setShowMobileSidebar,
    showMobileSidebar,
    toggleMobileSidebar,
  } = useAdminSidebarStore();
  const { user } = useAuthStore();
  const { socketReady } = useContext(SocketContext);

  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin/dashboard";
    }

    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchMode = () => {
    if (!socketReady) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("admin:leave", (res: any) => {
      if (!res.success) return;

      router.replace("/dashboard");
    });
  };

  return (
    <>
      {showMobileSidebar && (
        <div
          onClick={() => setShowMobileSidebar(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full border-r border-border/50 bg-background
          transition-all duration-300 ease-in-out

          ${showMobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}

          ${isCollapsed ? "md:w-20" : "md:w-64"}

          w-4/5 md:flex md:flex-col
        `}
      >
        <div className="flex items-center justify-between h-20 px-6 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <Image
              src="/SkillCirqle.webp"
              alt="Logo"
              width={28}
              height={28}
              priority
            />

            <h1
              className={`text-lg font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent ${isCollapsed ? "md:hidden" : ""} truncate`}
            >
              SkillCirqle
            </h1>
          </div>

          <button
            onClick={toggle}
            className="hidden md:block p-2 rounded-xl hover:bg-background-hover text-text-secondary transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>

          <button
            onClick={toggleMobileSidebar}
            className=" md:hidden p-2 absolute right-2 rounded-xl hover:bg-background-hover text-text-secondary transition-colors"
          >
            <X />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p
                className={`${isCollapsed ? "md:hidden" : ""} px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-text-secondary/50`}
              >
                {section.title}
              </p>

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setShowMobileSidebar(false)}
                        className={`
                          group relative flex items-center gap-4 ${isCollapsed ? 'px-3' : 'px-4'} py-3 text-sm font-medium transition-all
                          ${
                            active
                              ? "bg-primary/10 text-text-primary border-l-2 border-text-primary"
                              : "text-text-secondary hover:bg-background-hover hover:text-text-primary"
                          }
                          ${isCollapsed ? "md:justify-center" : ""}
                        `}
                      >
                        {/* {active && (
                          <span className="absolute left-0 w-1 h-6 bg-text-primary rounded-r-full" />
                        )} */}
                        <Icon
                          // size={isColl}
                          className={`
                            ${active
                              ? "text-text-primary"
                              : "text-text-secondary group-hover:text-text-primary"}
                          `}
                        />
                        <span className={`${isCollapsed ? "md:hidden" : ""}`}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50 bg-background/50">
          <div
            className={`flex items-center gap-3 ${
              isCollapsed ? "md:justify-center" : ""
            }`}
          >
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

            <div className={`min-w-0 flex-1 ${isCollapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-sm font-bold text-text-primary">
                {user?.name}
              </p>
              <p className="truncate text-[11px] text-text-secondary">
                {user?.email}
              </p>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className={`rounded-lg p-2 text-text-secondary transition hover:bg-background-hover ${
                  isCollapsed ? "md:hidden" : ""
                }`}
              >
                <MoreVerticalIcon size={18} />
              </button>

              {showMenu && (
                <div className="absolute bottom-12 right-0 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
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
                    Switch to User Mode
                  </button>

                  <Link
                    href="/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-background"
                  >
                    <Settings size={16} />
                    Account Settings
                  </Link>

                  <div className="border-t border-border" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout?.();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
