"use client";

import React, { useRef, useState } from "react";
import {
  ShieldAlert,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";

const BackupRecoveryPage = () => {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const formatCode = (value: string) => {
    return value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 10);
  };

  const handleChange = (value: string) => {
    setCode(formatCode(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/user/mfa/verify-recovery-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recoveryCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Invalid backup code");
      }

      setSuccess(true);

      setTimeout(() => {
        router.replace("/dashboard");
      }, 1200);
    } catch (error: any) {
      setErrorMessage(error?.message || "Verification failed");

      setCode("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-7 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {!success ? (
          <>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                <ShieldAlert size={30} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight text-text-primary">
                  Backup Recovery Code
                </h1>

                <p className="text-sm leading-relaxed text-text-secondary max-w-sm">
                  Enter one of your backup recovery codes to regain access to
                  your account.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={code}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="A1B2C3D4E5"
                    autoComplete="one-time-code"
                    className="w-full h-14 rounded-2xl border border-border bg-background/40 px-14 text-lg font-black tracking-[0.3em] uppercase text-text-primary placeholder:text-text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  />

                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                    <KeyRound size={18} />
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  Each recovery code can only be used once.
                </p>
              </div>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  errorMessage ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl px-4 py-3 flex items-start gap-2 text-sm text-red-400 font-medium">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />

                  <span>{errorMessage}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full h-12 rounded-2xl bg-primary text-text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Spinner size={20} />
                ) : (
                  <>
                    Verify Recovery Code
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-border/60 text-center">
              <p className="text-xs leading-relaxed text-text-secondary">
                Recovery codes are generated when you enable two-factor
                authentication.
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <CheckCircle2 size={30} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-text-primary">
                Verification Successful
              </h2>

              <p className="text-sm text-text-secondary">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupRecoveryPage;
