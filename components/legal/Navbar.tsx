"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links = [
  { label: "Terms", href: "/legal/terms_of_service" },
  { label: "Privacy", href: "/legal/privacy_policy" },
  { label: "Cookies", href: "/legal/cookies_policy" },
  { label: "Guidelines", href: "/legal/community_guidelines" },
];

const LegalNavbar = () => {
  const pathname = usePathname();

  return (
    <div className="w-full md:hidden lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center pb-3 justify-between ">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs whitespace-nowrap px-3 py-1 rounded-md transition-all ${
                  isActive
                    ? "bg-surface text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LegalNavbar;