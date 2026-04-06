"use client";

import { NavLinks } from "@/utils/Navbar";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <div className="w-64 h-full md:flex hidden flex-col bg-background/90">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">SkillCirqle</h1>
      </div>

      <div className="w-full h-full flex flex-col border-r border-border/20 mt-0.75">
        <div className="flex-1 flex flex-col px-2 py-4 gap-2 overflow-y-auto">
          {NavLinks.map((link, i) => {
            const isActive = pathname.startsWith(link.path);

            return (
              <Link
                key={i}
                href={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-l-md border-r-2 transition-all duration-200 ${
                  isActive
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-transparent text-text-secondary hover:bg-primary/5"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {link.icon}
                </span>

                <span className="text-sm">{link.title}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-semibold">
            {user?.avatarUrl ? (
              <img
                src={user?.avatarUrl}
                alt="Profile Image"
                className="w-full h-full"
              />
            ) : (
              <div>
                {user?.avatarUrl || user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-semibold truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {user?.email || "No email"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
