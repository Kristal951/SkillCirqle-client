"use client";

import React from "react";
import { LogOut, ArrowLeft } from "lucide-react";
import { useLogoutModal } from "@/providers/LogoutContext";

export default function SignOutConfirmation() {
  const { openLogoutModal } = useLogoutModal();

  return (
    <div className="w-full p-6 flex-1 flex-col gap-8 bg-surface/20 backdrop-blur-md border border-border/10 rounded-2xl">
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
        <div className="flex gap-2 items-center">
          <div className="w-12 h-12 hidden md:flex lg:flex bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl items-center justify-center shrink-0 shadow-inner">
            <LogOut size={20} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl md:text-2xl font-black tracking-tight text-text-primary">
            Sign Out
          </h1>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs md:text-sm text-text-secondary/80 leading-relaxed">
            End your current session on this device. You will need to
            re-authenticate or log in again to access your account profile.
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row-reverse gap-3 pt-6 border-t border-border/15">
        <button
          type="button"
          onClick={() => openLogoutModal()}
          className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-[0.98]
          text-red-500 bg-red-500/5 border border-red-500/10 hover:border-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/5 `}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
