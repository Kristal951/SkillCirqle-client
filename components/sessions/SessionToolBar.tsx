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
  showToolbar?: boolean;
  setShowToolbar?: (value: boolean) => void;
}

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

export const CallToolbar = ({
  buttons,
  disableScreenTap,
  showToolbar: showToolbarProp,
  setShowToolbar: setShowToolbarProp,
}: CallToolbarProps & { disableScreenTap?: boolean }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [internalShowToolbar, setInternalShowToolbar] = useState(true);
  const showToolbar = showToolbarProp ?? internalShowToolbar;
  const setShowToolbar = setShowToolbarProp ?? setInternalShowToolbar;

  const hangupBtn = buttons.find((b) => b.variant === "hangup");
  const regularBtns = buttons.filter((b) => b.variant !== "hangup");

  const mobileVisibleBtns = regularBtns.slice(0, 3);
  const mobileOverflowBtns = regularBtns.slice(3);
  const needsMenu = mobileOverflowBtns.length > 0;

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
        return `${base} w-12 md:w-auto md:px-4 bg-red-500 hover:bg-red-600 gap-2 text-sm font-medium`;
      case "standard":
      default:
        return `${base} w-12 bg-white/10 hover:bg-white/20`;
    }
  };

  const handleScreenClick = () => {
    if (showToolbar) {
      setShowToolbar(false);
      setShowMenu(false);
    } else {
      setShowToolbar(true);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-40 flex items-end justify-center pb-8 pointer-events-none">
        {!disableScreenTap && (
          <div
            onClick={handleScreenClick}
            className={`absolute inset-0 cursor-pointer pointer-events-auto bg-black/50 transition-opacity duration-300 ${
              showToolbar ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative z-50 h-17 border border-border bg-surface/40 rounded-full backdrop-blur-md flex items-center justify-center gap-2 md:gap-4 px-4 md:px-6 shadow-2xl transition-all duration-300 pointer-events-auto
      ${showToolbar ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-20 opacity-0 pointer-events-none"}`}
        >
          {showMenu && needsMenu && (
            <div className="absolute bottom-full mb-4 right-0 md:hidden bg-surface/80 backdrop-blur-md border border-border rounded-2xl p-2 flex flex-col gap-2 shadow-xl">
              {mobileOverflowBtns.map((btn, index) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={`menu-${index}`}
                    onClick={() => {
                      btn.onClick();
                      setShowMenu(false);
                    }}
                    aria-label={btn.label}
                    className={getButtonClass(btn.variant)}
                  >
                    <Icon />
                  </button>
                );
              })}
            </div>
          )}

          {mobileVisibleBtns.map((btn, index) => {
            const Icon = btn.icon;
            return (
              <button
                key={`primary-${index}`}
                onClick={btn.onClick}
                className={getButtonClass(btn.variant)}
                aria-label={btn.label}
              >
                <Icon />
              </button>
            );
          })}

          {mobileOverflowBtns.map((btn, index) => {
            const Icon = btn.icon;
            return (
              <button
                key={`desktop-${index}`}
                onClick={btn.onClick}
                aria-label={btn.label}
                className={`${getButtonClass(btn.variant)} hidden md:flex`}
              >
                <Icon />
              </button>
            );
          })}

          {needsMenu && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`${getButtonClass(showMenu ? "active-primary" : "standard")} md:hidden`}
              aria-label="More Actions"
            >
              <MoreIcon />
            </button>
          )}

          {hangupBtn && (
            <button
              onClick={hangupBtn.onClick}
              className={getButtonClass(hangupBtn.variant)}
              aria-label="Hang Up"
            >
              <hangupBtn.icon />
              {hangupBtn.label && (
                <span className="hidden md:inline">{hangupBtn.label}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
