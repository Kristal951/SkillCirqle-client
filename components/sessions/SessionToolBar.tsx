"use client";
import { IconType } from "@/utils/SvgType";
import { useState } from "react";

export interface ToolbarButtonConfig {
  icon: IconType;
  onClick: () => void;
  variant?: "standard" | "active-primary" | "toggle-danger" | "hangup";
  label?: string;
}

interface CallToolbarProps {
  buttons: ToolbarButtonConfig[];
}

export const CallToolbar = ({ buttons }: CallToolbarProps) => {
  const [showToolbar, setShowToolbar] = useState(true);

  const getButtonClass = (
    variant: ToolbarButtonConfig["variant"] = "standard",
  ) => {
    const base =
      "h-12 rounded-full flex items-center justify-center transition text-white text-xl";
    switch (variant) {
      case "active-primary":
        return `${base} w-12 bg-primary`;
      case "toggle-danger":
        return `${base} w-12 bg-red-500 hover:bg-red-600`;
      case "hangup":
        return `${base} px-4 py-3 bg-red-500 hover:bg-red-600 gap-2 text-sm font-medium`;
      case "standard":
      default:
        return `${base} w-12 bg-white/10 hover:bg-white/20`;
    }
  };

  return (
    <>
      <div
        className="absolute bottom-0 left-0 right-0 h-20 z-40 cursor-pointer pointer-events-auto"
        onMouseEnter={() => setShowToolbar(true)}
        onClick={() => setShowToolbar(true)}
      />

      <div
        onClick={() => setShowToolbar(false)}
        className={`absolute inset-0 bg-black/50 flex items-end justify-center pb-8 transition-all duration-300 z-50
          ${showToolbar ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="h-17 border border-border bg-surface/40 rounded-full  backdrop-blur-md flex items-center justify-center gap-4 px-6 shadow-2xl transition-transform duration-300"
          style={{
            transform: showToolbar ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {buttons.map((btn, index) => {
            const Icon = btn.icon;

            return (
              <button
                key={index}
                onClick={btn.onClick}
                className={getButtonClass(btn.variant)}
              >
                <Icon />
                {btn.label && <span>{btn.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
