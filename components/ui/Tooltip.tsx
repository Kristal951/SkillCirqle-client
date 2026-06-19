
"use client";
import { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-text-primary text-background text-[11px] font-medium whitespace-nowrap shadow-lg z-100 pointer-events-none">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-text-primary rotate-45 -mt-0.5" />
        </div>
      )}
    </div>
  );
}