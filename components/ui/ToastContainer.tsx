"use client";

import React from "react";
import Toast from "./Toast";
import { useToastStore } from "@/store/useToast";

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
          description={toast.description}
        />
      ))}
    </div>
  );
};

export default ToastContainer;