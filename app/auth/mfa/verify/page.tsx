"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useMFAStore } from "@/store/useMFAStore";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { changePassword } from "@/lib/changePassword";
import { toast } from "@/lib/toast";
import { useLogoutModal } from "@/providers/LogoutContext";
import { useAuthStore } from "@/store/useAuthStore";

interface VerifyMFAProps {
  // Modal mode — pass these
  reason?: string;
  next?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const VerifyMFA = ({ reason: reasonProp, next: nextProp, onSuccess, onClose }: VerifyMFAProps) => {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const isModal = !!onSuccess || !!onClose;

  const reason = reasonProp || searchParams.get("reason") || "";
  const next = nextProp || searchParams.get("next") || "/dashboard";

  const { factor, challengeId, setChallengeId, reset } = useMFAStore();
  const [activeFactorId, setActiveFactorId] = useState<string | null>(factor?.id || null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { openLogoutModal } = useLogoutModal();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    openLogoutModal();
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const initializeMFA = async () => {
      try {
        let targetFactorId = activeFactorId;

        if (!targetFactorId) {
          const { data: factorsData, error: factorsError } =
            await supabase.auth.mfa.listFactors();
          if (factorsError) throw factorsError;

          const validFactor = factorsData?.all?.find(
            (f) => f.status === "verified" && f.factor_type === "totp",
          );

          if (!validFactor) {
            isModal ? onClose?.() : router.replace("/auth/signin");
            return;
          }

          targetFactorId = validFactor.id;
          setActiveFactorId(validFactor.id);
        }

        if (challengeId) return;

        const { data: challengeData, error: challengeError } =
          await supabase.auth.mfa.challenge({ factorId: targetFactorId });
        if (challengeError) throw challengeError;

        setChallengeId(challengeData.id);
      } catch (error: any) {
        setErrorMessage(
          error?.message?.includes("has expired")
            ? "Challenge expired, please start the login process again."
            : error?.message || "Unable to initialize MFA challenge.",
        );
      }
    };

    initializeMFA();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId || !activeFactorId) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const { error } = await supabase.auth.mfa.verify({
        factorId: activeFactorId,
        challengeId,
        code: code.join(""),
      });

      if (error) throw error;

      const pendingPassword = sessionStorage.getItem("pendingPasswordChange");
      if (pendingPassword) {
        sessionStorage.removeItem("pendingPasswordChange");
        await changePassword(pendingPassword);
        toast.success("Password Updated", "Your password has been successfully updated");
        reset();
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.() || router.replace(next);
        }, 1200);
        return;
      }

      const disablingFactorId = sessionStorage.getItem("disablingMFA");
      if (disablingFactorId) {
        sessionStorage.removeItem("disablingMFA");
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: disablingFactorId,
        });
        if (unenrollError) throw unenrollError;
        await fetch("/api/user/mfa/recovery-codes", { method: "DELETE" });
        toast.success("MFA Disabled", "Two-factor authentication has been turned off");
        reset();
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.() || handleLogout();
        }, 1200);
        return;
      }

      setSuccess(true);
      reset();
      setTimeout(() => {
        onSuccess?.() || router.replace(next);
      }, 1200);
    } catch (error: any) {
      setErrorMessage(error?.message || "Invalid authentication code.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...code];
    newOtp[index] = value.substring(value.length - 1);
    setCode(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const content = (
    <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-7 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 relative">
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition"
        >
          <X size={18} />
        </button>
      )}

      {!success ? (
        <>
          <div className="flex flex-col w-full items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-1 w-full">
              <h1 className="md:text-2xl lg:text-2xl text-xl font-black tracking-tight text-text-primary">
                Two-Factor Authentication
              </h1>
              <p className="md:text-sm lg:text-sm text-xs text-text-secondary leading-relaxed">
                Enter the 6-digit code from your authenticator app to continue.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-5">
            <div className="w-full flex gap-2 items-center justify-center px-4">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  autoFocus={i === 0}
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

            <div className={`overflow-hidden transition-all duration-200 ${errorMessage ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl px-4 py-3 flex items-start gap-2 text-sm text-red-400 font-medium">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.some((digit) => !digit)}
              className="w-full h-12 rounded-2xl bg-primary text-text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size={20} /> : <>Verify Code <ArrowRight size={14} /></>}
            </button>

            {!isModal && (
              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-0.5 py-2 text-sm">
                <span className="text-text-secondary">Lost access to your authenticator?</span>
                <Link
                  href="/auth/mfa/backup"
                  className="text-text-primary underline md:decoration-0 md:hover:decoration-1 md:hover:underline font-medium"
                >
                  Use backup recovery code
                </Link>
              </div>
            )}
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center text-center gap-4 py-6">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
            <CheckCircle2 size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-text-primary">Verification Successful</h2>
            <p className="text-sm text-text-secondary">Redirecting you now...</p>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background flex items-center justify-center md:p-4 lg:p-4 p-2">
      {content}
    </div>
  );
};

export default VerifyMFA;