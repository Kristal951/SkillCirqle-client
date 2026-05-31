"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  XCircle,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasMinLength = password.length >= 6;
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>_]/.test(password);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const canSubmit =
    hasMinLength &&
    hasNumberOrSymbol &&
    passwordsMatch &&
    !loading &&
    validSession;

  useEffect(() => {
  if (initialized.current) return;
  initialized.current = true;

  const checkSession = async () => {
    try {
      const error = searchParams.get("error");
      if (error) {
        setValidSession(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      setValidSession(!!session);
    } catch {
      setValidSession(false);
    } finally {
      setCheckingSession(false);
    }
  };

  checkSession();
}, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!canSubmit) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2500);
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Unable to update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size={24} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              Verifying security token
            </p>
            <p className="text-xs text-text-secondary">
              authenticating your session
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center p-4 antialiased">
        <div className="w-full max-w-md bg-surface/40 rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <XCircle size={24} className="stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">
              Link Expired or Invalid
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
              For security, recovery links are single-use and expire quickly.
              Please request a new one.
            </p>
          </div>

          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="w-full h-11 rounded-xl bg-primary/80 hover:bg-primary text-text-primary text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center p-4 antialiased">
        <div className="w-full max-w-md bg-surface/50 rounded-2xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} className="stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">
              Password Reset Successfully
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your password updated successfully. redirecting you back to sigin
              page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-background flex flex-col relative items-center justify-center p-4 sm:p-6 antialiased">
      <div className="absolute right-4 top-6 mb-6 flex justify-start">
        <button
          onClick={() => router.push("/auth/signin")}
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-2 transition-colors group py-1.5 px-3 rounded-lg hover:bg-zinc-900/50"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to login
        </button>
      </div>

      <div className="w-full max-w-md bg-surface/50 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col gap-3.5">
          <div className="space-y-1 flex items-center justify-center flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">
              Create New Password
            </h1>
            <p className="text-xs text-center sm:text-sm text-text-secondary leading-relaxed">
              Ensure security baseline parameters are met to commit password
              changes safely.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              New Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 pr-12 text-zinc-200 text-sm placeholder:text-zinc-600 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
                {password.length === 0 ? (
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                ) : hasMinLength ? (
                  <Check size={12} className="text-emerald-400 stroke-3" />
                ) : (
                  <X size={12} className="text-zinc-600 stroke-3" />
                )}
                <span
                  className={
                    password.length === 0
                      ? "text-zinc-500"
                      : hasMinLength
                        ? "text-emerald-500/90"
                        : "text-zinc-500"
                  }
                >
                  6+ characters
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
                {password.length === 0 ? (
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                ) : hasNumberOrSymbol ? (
                  <Check size={12} className="text-emerald-400 stroke-3" />
                ) : (
                  <X size={12} className="text-zinc-600 stroke-3" />
                )}
                <span
                  className={
                    password.length === 0
                      ? "text-zinc-500"
                      : hasNumberOrSymbol
                        ? "text-emerald-500/90"
                        : "text-zinc-500"
                  }
                >
                  1 number or symbol
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Confirm password
            </label>
            <div className="relative group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-background px-4 pr-12 text-zinc-200 text-sm placeholder:text-zinc-600 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {confirmPassword && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide pt-0.5">
                {passwordsMatch ? (
                  <Check size={12} className="text-emerald-400 stroke-3" />
                ) : (
                  <X size={12} className="text-red-400 stroke-3" />
                )}
                <span
                  className={
                    passwordsMatch ? "text-emerald-500/90" : "text-red-400/90"
                  }
                >
                  {passwordsMatch
                    ? "Password matches"
                    : "Passwords do not match"}
                </span>
              </div>
            )}
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${errorMessage ? "max-h-24 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
          >
            <div className="text-xs font-medium text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 flex items-start gap-2.5 shadow-sm">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-11 rounded-xl bg-primary text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100 group mt-1 shadow-lg shadow-black/30"
          >
            {loading ? (
              <Spinner size={20} />
            ) : (
              <>
                Update Password
                <ChevronRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 stroke-[2.5]"
                />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
