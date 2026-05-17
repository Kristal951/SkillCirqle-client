"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function MenuPortal({
  anchorRef,
  children,
  open,
}: {
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  open: boolean;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 160,
    });
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed z-99999 w-40 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="p-1.5 flex flex-col gap-0.5">{children}</div>
    </div>,
    document.body,
  );
}
