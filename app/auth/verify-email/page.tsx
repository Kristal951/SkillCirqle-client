"use client";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { toast } from "@/lib/toast";
import { AlertCircle, ArrowRight, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const CheckMail = ({
  setIsSubmitted,
}: {
  setIsSubmitted: (isSubmitted: boolean) => void;
}) => {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

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
      toast.error(
        "Invalid or expired Code",
        "Try again or request a new code.",
      );
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
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
      console.log(err);
      toast.error(err?.message);
    } finally {
      setResending(false);
    }
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");

    return `${name.slice(0, 2)}***@${domain}`;
  };

  const onChangeEmail = () => {
    setCode(["", "", "", "", "", ""]);
    router.push(`/auth/register?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-105 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
        {/* <div className="w-13 h-13 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Mail size={24} />
        </div> */}

        <div className="text-center flex flex-col gap-1.5">
          <h2 className="text-4xl font-bold text-text-primary">
            Verify your email
          </h2>
          <p className="text-base text-text-secondary tracking-wide">
            We sent a 6-digit code to{" "}
            <span className="text-sm font-semibold text-text-primary">
              {maskEmail(email)}.
            </span>{" "}
            This code will expire in 10 minutes.
          </p>
        </div>

        <form onSubmit={handleVerify} className="w-full flex flex-col gap-5 mt-5">
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
                className="w-14 h-14 bg-surface/20 border border-border/60 rounded-xl text-center text-2xl font-black text-text-primary focus:border-primary focus:scale-105
focus:shadow-lg
focus:shadow-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.some((d) => !d)}
            className="w-full h-12 rounded-2xl mt-5 bg-primary text-text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
