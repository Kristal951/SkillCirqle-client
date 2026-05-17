"use client";

import React, { MutableRefObject } from "react";
import Spinner from "@/components/ui/Spinner";

interface TwoFactorVerifyProps {
  otp: string[];
  inputRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  loading: boolean;
  verifyCode: () => void;
  handlePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  handleOtpChange: (value: string, index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
}

export default function TwoFactorVerify({
  otp,
  inputRefs,
  loading,
  verifyCode,
  handlePaste,
  handleOtpChange,
  handleKeyDown,
}: TwoFactorVerifyProps) {
  
  const isOtpComplete = otp.join("").length === 6;

  return (
    <div className="w-full flex flex-col items-center">

      <div className="w-full flex items-center justify-center flex-col text-center px-6 mb-8">
        <div className="flex justify-center gap-2 md:gap-3 mt-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              className="w-12 h-14 bg-background/40 border border-border/60 rounded-xl text-center text-2xl font-black text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              maxLength={1}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              onPaste={handlePaste}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>
      </div>

      <div className="w-full px-6 md:px-10 pb-6 md:pb-12 mt-4">
        <button
          type="button"
          onClick={verifyCode}
          disabled={loading || !isOtpComplete}
          className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-md active:scale-[0.98]
            ${loading || !isOtpComplete
              ? "bg-gray-500/10 text-gray-400/40 cursor-not-allowed shadow-none"
              : "bg-primary text-white hover:brightness-110 shadow-primary/10"
            }`}
        >
          {loading && <Spinner size={14} />}
          {loading ? "Verifying Token..." : "Verify & Enable 2FA"}
        </button>
      </div>

    </div>
  );
}