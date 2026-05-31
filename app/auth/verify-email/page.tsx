"use client";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";
import { AlertCircle, ArrowRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const CheckMail = ({
  setIsSubmitted,
}: {
  setIsSubmitted: (isSubmitted: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullCode = code.join("");

    if (fullCode.length !== 6) return;

    const supabase = getSupabaseBrowserClient();

    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type: "signup",
      });

      if (error) throw error;

      const user = data.user;

      if (user) {
        await supabase
          .from("profiles")
          .update({
            email_verified: true,
            status: "active",
          })
          .eq("id", user.id);
      }

      toast.success("Email verified!", "Your account has been verified.");
      router.replace("/onboarding");
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid or expired verification code.");

      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMessage("");
    const supabase = getSupabaseBrowserClient();
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      setCode(["", "", "", "", "", ""]);
      setCountdown(60);
      toast.success("New verification code sent");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");

    return `${name.slice(0, 2)}***@${domain}`;
  };

  const onChangeEmail = () => {
    setIsSubmitted(false);
    setCode(["", "", "", "", "", ""]);
    setErrorMessage("");
  };

  return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-105 bg-surface border border-border rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
        <div className="w-13 h-13 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Mail size={24} />
        </div>

        <div className="text-center flex flex-col gap-1.5">
          <h2 className="text-3xl font-black tracking-tight text-text-primary">
            Check your email
          </h2>
          <p className="text-sm text-text-secondary tracking-wide">
            We sent a 6-digit code to{" "}
            <span className="text-sm font-semibold text-text-primary">
              {maskEmail(email)}.
            </span>{" "}
            This code will expire in 10 minutes.
          </p>
        </div>

        <form onSubmit={handleVerify} className="w-full flex flex-col gap-5">
          <div className="flex gap-2 justify-center">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                autoFocus={i === 0}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                className="w-12 h-14 bg-background/40 border border-border/60 rounded-xl text-center text-2xl font-black text-text-primary focus:border-primary focus:scale-105
focus:shadow-lg
focus:shadow-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
            ))}
          </div>

          <div
            className={`overflow-hidden transition-all duration-200 ${errorMessage ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl px-4 py-3 flex items-start gap-2 text-sm text-red-400 font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.some((d) => !d)}
            className="w-full h-12 rounded-2xl bg-primary text-text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Spinner size={20} />
            ) : (
              <>
                Verify email <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-1 text-sm">
          <span className="text-text-secondary">Didn't receive a code?</span>
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="text-text-primary font-semibold hover:underline disabled:opacity-50"
          >
            {countdown > 0
              ? `Resend in ${countdown}s`
              : resending
                ? "Sending..."
                : "Resend code"}
          </button>
        </div>

        <button
          onClick={onChangeEmail}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors underline"
        >
          Change email address
        </button>
      </div>
    </div>
  );
};

export default CheckMail;
