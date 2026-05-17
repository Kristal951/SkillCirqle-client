"use client";

import { useEffect, useState, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { getMfaStatus } from "@/lib/getUserMfaStatus";
import { CheckCircle2, Copy, Download, Lock } from "lucide-react";
import Spinner from "../ui/Spinner";
import TwoFactorSetup from "./MfaSetup";
import TwoFactorVerify from "./TwoFactorVerify";
import { useAuthStore } from "@/store/useAuthStore";
import RecoveryCodesView from "./RecoveryCodesView";

export type Step =
  | "loading"
  | "setup"
  | "verify"
  | "enabled"
  | "show_recovery_codes";

export default function TwoFAModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const supabase = getSupabaseBrowserClient();
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>("setup");
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      resetState();
      return;
    }

    if (initializedRef.current) return;

    initializedRef.current = true;

    initializeMFA();
  }, [open]);

  const initializeMFA = async () => {
    resetState();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const existing = data.all.find((f) => f.factor_type === "totp");

      if (existing?.status === "verified") {
        setFactorId(existing.id);
        setStep("enabled");
        return;
      }

      if (existing) {
        await supabase.auth.mfa.unenroll({
          factorId: existing.id,
        });
      }

      setStep("setup");

      const { data: enrollData, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: `SkillCirqle Authenticator (${user?.email})`,
        });

      if (enrollError) throw enrollError;

      setQr(enrollData.totp.qr_code);
      setSecret(enrollData.totp.secret);
      setFactorId(enrollData.id);

      setStep("setup");
    } catch (err) {
      console.error("MFA Init Error:", err);
    } finally {
      setLoading(false);
    }
  };
  const resetState = () => {
    setStep("setup");
    setQr(null);
    setSecret(null);
    setFactorId(null);
    setOtp(["", "", "", "", "", ""]);
  };

  const cleanupFactor = async () => {
    if (!factorId || step === "enabled") return;

    try {
      await supabase.auth.mfa.unenroll({
        factorId,
      });
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async () => {
    if (loading || !factorId) return;

    const code = otp.join("");

    if (code.length !== 6) {
      alert("Enter the 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      const res = await fetch("/api/user/mfa/recovery-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      setRecoveryCodes(data.codes);

      setStep("show_recovery_codes");
    } catch (err) {
      console.error(err);
      alert("Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    if (!factorId) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      await fetch("/api/user/mfa/recovery-codes", {
        method: "DELETE",
      });

      setRecoveryCodes([]);
      setFactorId(null);
      setStep("setup");
    } catch (err) {
      console.error("Failed to disable MFA", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCodes = () => {
    if (!recoveryCodes.length) return;
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 py-10 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div
        className="w-full max-w-xl bg-surface max-h-[95vh] rounded-3xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${step === "enabled" || step === "show_recovery_codes" ? "pt-4" : "px-6 pt-10 pb-6"} text-center`}
        >
          <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-3">
            {step === "verify" || step === "setup"
              ? "Enable Two-factor Authentication"
              : null}
          </h2>

          {step === "verify" && (
            <p className="text-text-secondary leading-relaxed">
              Enter the 6-digit dynamic security token generated inside your
              authenticator application.
            </p>
          )}
          {step === "setup" && (
            <p className="text-text-secondary leading-relaxed">
              Open your authenticator app (like Google Authenticator or
              1Password) and scan the code below.
            </p>
          )}
        </div>

        {step === "setup" && (
          <TwoFactorSetup
            loading={loading}
            qr={qr}
            secret={secret}
            factorId={factorId}
            setStep={setStep}
          />
        )}

        {step === "verify" && (
          <TwoFactorVerify
            otp={otp}
            inputRefs={inputRefs}
            loading={loading}
            verifyCode={verifyCode}
            handleOtpChange={handleOtpChange}
            handlePaste={handlePaste}
            handleKeyDown={handleKeyDown}
          />
        )}

        {/* {step === "success" && (
          <div className="px-10 pb-12 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-4xl">
                check_circle
              </span>
            </div>
            <button
              onClick={() => {
                resetState();
                setOpen(false);
              }}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        )} */}

        <div className="w-full h-full">
          {step === "enabled" && (
            <div className="px-6 py-8 md:px-10 md:pb-12 flex flex-col items-center gap-8">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center ring-8 ring-green-500/5 shadow-inner">
                <Lock size={26} className="stroke-[2.5]" />
              </div>

              <div className="w-full flex flex-col items-center justify-center gap-2.5 max-w-sm">
                <h2 className="text-xl md:text-2xl font-bold text-center text-text-primary tracking-tight">
                  Two-Factor Authentication Enabled
                </h2>

                <p className="text-xs md:text-sm text-text-secondary/80 text-center leading-relaxed">
                  Two-factor authentication is now protecting your account. You
                  will be prompted for a verification code when logging in on a
                  new device.
                </p>
              </div>

              <button
                type="button"
                onClick={disableMFA}
                disabled={loading}
                className="w-full max-w-sm  disabled:opacity-50 disabled:cursor-not-allowed py-3 text-xs bg-red-500/5 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white rounded-xl font-bold tracking-wide transition-all duration-200 active:scale-[0.98]"
              >
                {loading && <Spinner size={20} />}
                Disable Two-Factor Authentication
              </button>
            </div>
          )}

          {step === "show_recovery_codes" && (
            <RecoveryCodesView
              step={step}
              recoveryCodes={recoveryCodes}
              setStep={setStep}
              handleCopyCodes={handleCopyCodes}
            />
          )}
        </div>

        {step !== "loading" && (
          <button
            onClick={async () => {
              if (step === "setup" || step === "verify") {
                await cleanupFactor();
              }

              resetState();
              setOpen(false);
            }}
            className="absolute top-3 right-2 p-2 text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high/50 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>
    </div>
  );
}
