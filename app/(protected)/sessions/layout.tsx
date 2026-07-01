"use client"

import { useSidebarStore } from "@/store/useSidebarStore";
import { useEffect } from "react";

export default function sessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const {setCollapsed} = useSidebarStore()

    useEffect(()=> {
      setCollapsed(true)
    }, [])
  return (
    <div className="h-full w-full overflow-hidden bg-background">
      {children}
    </div>
  );
}
