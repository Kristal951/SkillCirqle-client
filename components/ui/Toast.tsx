"use client";

import React, { useEffect } from "react";
import MaterialIcon from "./MaterialIcon";
import { X } from "lucide-react";

type IconName = 'check_circle' | 'error' | 'info' | 'warning';

type ToastProps = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: (id: string) => void;
  description?: string;
  duration?: number;
};

const isValidIcon = (icon: string): icon is IconName => {
  return ['check_circle', 'error', 'info', 'warning'].includes(icon);
};

const Toast = ({
  id,
  message,
  description,
  type,
  onClose,
  duration = 5000,
}: ToastProps) => {
  
  const borderStyles = {
    success: "border-l-4 border-l-green-500",
    error: "border-l-4 border-l-red-500",
    info: "border-l-4 border-l-blue-500",
    warning: "border-l-4 border-l-amber-500",
  };

  const IconMap = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-amber-500",
  };


  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative w-full max-w-sm overflow-hidden bg-surface shadow-xl rounded-xl border border-border backdrop-blur-md flex items-start gap-4 p-4 ${borderStyles[type]} animate-in slide-in-from-right-5 fade-in duration-300`}
    >
      <div className={`mt-0.5 shrink-0 ${iconColors[type]}`}>
        <MaterialIcon name={IconMap[type]} className="text-2xl" fill />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-base font-bold text-text-primary leading-tight">
          {message}
        </h4>
        {description && (
          <p className="mt-1 text-sm text-text-secondary leading-relaxed wrap-break-word">
            {description}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="shrink-0 rounded-lg p-0.5 hover:bg-text-secondary/30 text-text-secondary transition-colors"
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default Toast;