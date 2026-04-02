"use client";

import React, { useEffect } from "react";
import MaterialIcon from "./MaterialIcon";
import { X } from "lucide-react";

type ToastProps = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: (id: string) => void;
  description?: string;
  duration?: number;
};

const Toast = ({
  id,
  message,
  description,
  type,
  onClose,
  duration = 3000,
}: ToastProps) => {
  const styles = {
    success: "glow-success border text-green-600 shadow-md",
    error: "glow-error border text-red-600 shadow-md",
    info: "glow-info border text-blue-600 shadow-md",
    warning: "glow-warning border text-amber-600 shadow-md",
  };

  const iconContainerStyles = {
    success: "bg-green-500/10 text-green-600",
    error: "bg-red-500/20 text-red-600",
    info: "bg-blue-500/10 text-blue-600",
    warning: "bg-amber-500/10 text-amber-600",
  };

  const IconMap = {
    success: <MaterialIcon name="check_circle" className="text-green-400" fill />,
    error: <MaterialIcon name="error" className="text-red-400" fill />,
    info: <MaterialIcon name="info" className="text-blue-400" fill />,
    warning: <MaterialIcon name="info" className="text-amber-400" fill />,
  };

  const Icon = IconMap[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`bg-background p-3 rounded-md flex flex-col justify-between gap-3 ${styles[type]}`}
    >
      <div className="flex items-start sm:items-center gap-3 w-full">
        <div
          className={`p-2 rounded-full flex items-center justify-center shrink-0 ${iconContainerStyles[type]}`}
        >
          {Icon}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold text-white break-words">
            {message}
          </p>

          {description && (
            <p className="text-xs sm:text-sm text-text-surface break-words">
              {description}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => onClose(id)}
        aria-label="Close notification"
        className="self-end sm:self-auto text-gray-400 hover:text-gray-200 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;