"use client";

import React, { SetStateAction, useState } from "react";
import { Copy, Check, QrCode } from "lucide-react";
import { Step } from "./TwoFAModal";

interface TwoFactorSetupProps {
  loading: boolean;
  qr: string | null;
  secret: string | null;
  factorId: string | null;
  setStep: React.Dispatch<SetStateAction<Step>>
}

export default function TwoFactorSetup({
  loading,
  qr,
  secret,
  factorId,
  setStep
}: TwoFactorSetupProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-6 py-4 md:px-10 md:pb-12 flex flex-col items-center">
      <div className="w-full mb-8 flex flex-col items-center text-center">

        <div className="relative group w-44 h-44 bg-white p-3 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center ring-4 ring-surface-container/30">
          {loading && !qr ? (
            <div className="animate-pulse bg-gray-200/80 w-full h-full rounded-xl flex items-center justify-center">
              <QrCode className="w-12 h-12 text-gray-400/50 animate-pulse" />
            </div>
          ) : qr ? (
            <img
              src={qr}
              className="w-full h-full object-contain"
              alt="MFA QR Code"
            />
          ) : null}

          <div className="absolute inset-2 border border-black/5 pointer-events-none rounded-lg" />
        </div>
      </div>

      <div className="w-full bg-background/50 border border-border/40 rounded-xl p-4 mb-8 flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
          Manual Setup Key
        </span>

        <div className="w-full border border-border/10 px-3 py-2 rounded-xl flex items-center justify-between gap-3">
          <code className={`text-accent font-mono text-sm tracking-widest font-bold overflow-x-auto whitespace-nowrap scrollbar-hide select-all ${!secret && 'animate-pulse'}`}>
            {secret || "GENERATING..."}
          </code>

          <button
            type="button"
            disabled={!secret}
            onClick={handleCopy}
            className={`p-2 shrink-0 rounded-lg transition-all active:scale-90
              ${
                copied
                  ? "bg-green-500/10 text-green-500"
                  : "text-text-secondary hover:text-text-primary hover:bg-background"
              } disabled:opacity-0`}
            title="Copy secret key"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col">
        <button
          type="button"
          disabled={!qr || !factorId}
          onClick={() => setStep("verify")}
          className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-md active:scale-[0.98]
            ${
              !qr || !factorId
                ? "bg-gray-500/10 text-gray-400/40 cursor-not-allowed shadow-none"
                : "bg-primary text-white hover:brightness-110 shadow-primary/10"
            }`}
        >
          Verify Code
        </button>
      </div>
    </div>
  );
}
