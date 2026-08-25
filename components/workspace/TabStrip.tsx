"use client";

import { useState } from "react";
import Dashboard from '@material-symbols/svg-400/outlined/dashboard.svg'
import CalendarToday from '@material-symbols/svg-400/outlined/calendar_today.svg'
import FolderOpen from '@material-symbols/svg-400/outlined/folder_open.svg'
import MilitaryTech from "@material-symbols/svg-400/outlined/military_tech.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";


type TabKey = "overview" | "sessions" | "resources" | "milestones";

const NAV = [
    { label: "Overview", href: "", icon: Dashboard },
    { label: "Sessions", href: "/sessions", icon: CalendarToday },
    { label: "Resources", href: "/resources", icon: FolderOpen },
    { label: "Milestones", href: "/milestones", icon: MilitaryTech },
];

interface WorkspaceTabStripProps {
    activeTab: TabKey;
    onTabChange: (tab: TabKey) => void;
}

export const WorkspaceTabStrip = ({ id }: { id: string }) => {
    const pathname = usePathname();
    const basePath = `/workspaces/${id}`;
    const currentPath = pathname.replace(basePath, "") || "";

    return (
        <div className="flex md:hidden gap-6 overflow-x-auto border-b w-full border-border/60 px-1 scrollbar-hide">
            {NAV.map(({ label, icon: Icon, href: itemHref }) => {
                const href = `${basePath}${itemHref}`;
                const isActive =
                    itemHref === ""
                        ? currentPath === ""
                        : currentPath.startsWith(itemHref);

                return (
                    <Link
                        key={label}
                        href={href}
                        className={`flex flex-1 shrink-0 flex-col items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${isActive
                            ? "border-text-primary text-text-primary"
                            : "border-transparent text-text-secondary hover:text-text-primary"
                            }`}
                    >
                        <Icon size={18} />
                        <span className="text-xs font-medium whitespace-nowrap">
                            {label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default WorkspaceTabStrip;