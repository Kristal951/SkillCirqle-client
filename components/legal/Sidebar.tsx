"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Cookie, FileText, Shield } from "lucide-react";

interface LegalLinkItem {
  link: string;
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

export default function LegalSidebar() {
  const pathname = usePathname();

  const legalLinks: LegalLinkItem[] = [
    {
      label: "Terms of Service",
      link: "/legal/terms_of_service",
      icon: FileText,
    },
    {
      label: "Privacy Policy",
      link: "/legal/privacy_policy",
      icon: Shield,
    },
    {
      label: "Cookies Policy",
      link: "/legal/cookies_policy",
      icon: Cookie,
    },
    {
      label: "Community Guidelines",
      link: "/legal/community_guidelines",
      icon: BookOpen,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex fixed top-0 border-r border-border h-screen self-start">
      <div className="bg-background py-50 px-4 h-full">
        <nav className="flex flex-col gap-2">
          {legalLinks.map((link) => {
            const isActive = pathname === link.link;

            return (
              <Link
                key={link.link}
                href={link.link}
                className={`group flex items-center justify-between px-3 h-10 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.icon
                    size={16}
                    className={`transition-colors duration-200
                    ${
                      isActive
                        ? "text-text-primary"
                        : "text-text-secondary group-hover:text-text-primary"
                    }`}
                  />

                  <span>{link.label}</span>
                </div>

                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200
                  ${
                    isActive
                      ? "bg-text-primary opacity-100"
                      : "opacity-0 group-hover:opacity-100 bg-text-secondary"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}