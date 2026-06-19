"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface Member {
  user_id: string;
  profiles: {
    name: string | null;
    avatar_url: string | null;
    rating?: number | null;
    exchanges?: number | null;
  };
}

interface Track {
  id: string;
  teacher_id: string;
  learner_id: string;
  skills: { title: string };
}

interface SidebarProps {
  skillTracks: Track[];
  members: Member[];
  id: string;
  userId: string | undefined;
}

const Sidebar = ({
  skillTracks = [],
  members = [],
  id,
  userId,
}: SidebarProps) => {
  const pathname = usePathname();

  const NAV = [
    { label: "Overview", href: "", icon: "dashboard" },
    { label: "Sessions", href: "/sessions", icon: "calendar_today" },
    { label: "Resources", href: "/resources", icon: "folder_open" },
    { label: "Milestones", href: "/milestones", icon: "select_check_box" },
  ];

  const basePath = `/workspace/${id}`;
  const currentPath = pathname.replace(basePath, "") || "";
  const otherMember = members.find((m) => m.user_id !== userId);

  return (
    <aside className="hidden md:flex flex-col w-72 bg-background border-r border-border fixed h-[calc(100vh-57px)] overflow-hidden select-none">
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const href = `${basePath}${item.href}`;
            const isActive =
              item.href === ""
                ? currentPath === ""
                : currentPath.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-surface/50 text-text-primary font-semibold border-r-2 border-primary"
                    : "text-text-secondary hover:bg-surface/40 hover:text-text-primary"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg transition-transform ${isActive ? "text-text-primary" : "opacity-70"}`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {skillTracks.length > 0 && (
          <div className="mt-6 px-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50 mb-3">
              Skill tracks
            </p>
            <div className="flex flex-col gap-3">
              {skillTracks.map((track, i) => {
                const teacherName =
                  members
                    .find((m) => m.user_id === track.teacher_id)
                    ?.profiles?.name?.split(" ")[0] || "Teacher";
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-2.5 group"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? "bg-emerald-400" : "bg-violet-400"}`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-text-primary font-semibold truncate leading-none">
                        {track.skills?.title}
                      </p>
                      <p className="text-[10px] text-text-secondary/60 mt-0.5">
                        {teacherName} teaching
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {otherMember && (
        <div className="mt-auto border-t border-border/60 bg-background/50 backdrop-blur-md p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50 mb-2.5">
            Your partner
          </p>
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 relative">
              {otherMember.profiles.avatar_url ? (
                <Image
                  src={otherMember.profiles.avatar_url}
                  alt={otherMember.profiles.name || "Partner"}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-emerald-500 uppercase">
                  {otherMember.profiles.name?.charAt(0) || "?"}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text-primary truncate leading-tight">
                {otherMember.profiles.name || "Workspace Member"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <svg
                  className="w-3 h-3 text-accent shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3  .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] text-text-secondary/80 font-medium whitespace-nowrap">
                  {otherMember.profiles.rating
                    ? otherMember.profiles.rating.toFixed(1)
                    : "—"}{" "}
                  · {otherMember.profiles.exchanges ?? 0} exchanges
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
