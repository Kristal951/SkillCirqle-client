"use client";

import React, { useState } from "react";
import { Mail, ChevronRight, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/confirm-code?next=/auth/update-password`,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Password reset failure:", error);

      setErrorMessage(
        error?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-xl relative bg-surface border border-border rounded-2xl p-8 shadow-2xl overflow-hidden flex flex-col gap-6">
        <button
          onClick={() => router.push("/auth/signin")}
          className="flex items-center absolute right-6 top-6 gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary/70 hover:text-text-primary transition-all w-max group"
        >
          <X size={18} />
        </button>

        {!isSubmitted ? (
          <>
            <div className="flex flex-col gap-2 mt-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
                Reset Your Password
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary/80 leading-relaxed font-medium">
                Enter your registered SkillCirqle email address so we can send
                you a secure password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-[10px] font-bold text-text-secondary uppercase tracking-widest"
                >
                  Email Address
                </label>

                <div className="relative flex items-center">
                  <Mail
                    size={16}
                    className="absolute left-4 text-text-secondary/50"
                  />

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={isLoading}
                    className="w-full bg-background border border-border/80 focus:border-primary/50 text-text-primary placeholder:text-text-secondary/30 rounded-xl pl-11 pr-4 py-3.5 text-sm transition-all outline-none focus:ring-4 focus:ring-primary/5 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="text-xs text-red-500 font-medium bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="flex bg-primary text-text-primary px-5 py-3.5 items-center justify-center gap-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/10 mt-2 group"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send Link
                    <ChevronRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4 space-y-4 animate-scale-up">
            <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl shadow-inner">
              <CheckCircle2 size={28} className="stroke-[1.75]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-xl text-text-primary tracking-tight">
                Check your inbox
              </h2>

              <p className="text-xs sm:text-sm text-text-secondary/70 max-w-[320px] mx-auto leading-relaxed font-medium">
                We emailed a secure password reset link to{" "}
                <span className="text-text-primary font-bold">{email}</span>.
              </p>
            </div>

            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-text-secondary hover:text-text-primary font-bold hover:underline pt-2"
            >
              Didn&apos;t receive email? Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
