"use client";

import { useEffect, useState, useRef } from "react";
import { Check, ShieldCheck, X } from "lucide-react"; // Using Lucide for the checklist icons
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { changePassword } from "@/lib/changePassword";
import { toast } from "@/lib/toast";
import Spinner from "../ui/Spinner";

export default function PasswordModal({
  showPasswordModal,
  setShowPasswordModal,
}: {
  showPasswordModal: boolean;
  setShowPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const initialInputRef = useRef<HTMLInputElement>(null);

  const checklist = {
    length: newPassword.length >= 8,
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    match: newPassword === confirmPassword && newPassword.length > 0,
  };

  const isFormValid =
    Object.values(checklist).every(Boolean) && currentPassword.length > 0;

  useEffect(() => {
    if (showPasswordModal) {
      setTimeout(() => initialInputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPasswordModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [showPasswordModal, setShowPasswordModal]);

  if (!showPasswordModal) return null;

  const handleChangePassword = async () => {
    if (!isFormValid) return;
    if (newPassword !== confirmPassword) {
      toast.info("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data: userData } = await supabase.auth.getUser();

      const email = userData.user?.email;

      if (!email) throw new Error("User not found");

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (loginError) {
        console.log(loginError)
        toast.error("Current password is incorrect");
        return;
      }

      await changePassword(newPassword);

      toast.success(
        "Password Updated",
        "Your password has been successfully updated",
      );

      setShowPasswordModal(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300"
      onClick={() => setShowPasswordModal(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowPasswordModal(false)}
          className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-background/50 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="flex-1 p-8 md:p-12">
          <header className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Update Password
            </h2>
          </header>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleChangePassword();
            }}
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  ref={initialInputRef}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type={showCurrent ? "text" : "password"}
                  required
                  className="w-full bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 transition-all outline-none text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg!">
                    {showCurrent ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNew ? "text" : "password"}
                    required
                    className="w-full bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 transition-all outline-none text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg!">
                      {showNew ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  required
                  className="w-full bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 transition-all outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="bg-background/50 border border-border/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border/20 pb-2">
                <ShieldCheck size={14} className="text-primary" />
                Security Checklist
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <CheckItem label="8+ Characters" met={checklist.length} />
                <CheckItem label="Includes a Number" met={checklist.number} />
                <CheckItem label="Special Character" met={checklist.special} />
                <CheckItem label="Passwords Match" met={checklist.match} />
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-8 py-3.5 rounded-xl text-sm font-bold text-text-secondary hover:bg-background transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Spinner size={20} />}
                {loading ? "Updating Password..." : "Confirm Change"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 transition-all duration-300">
      <div
        className={`flex items-center justify-center w-4 h-4 rounded-full border ${
          met
            ? "bg-green-500/10 border-green-500 text-green-500"
            : "border-border text-text-secondary/30"
        }`}
      >
        {met ? (
          <Check size={10} strokeWidth={4} />
        ) : (
          <X size={10} strokeWidth={4} />
        )}
      </div>
      <span
        className={`text-[11px] font-medium transition-colors ${met ? "text-text-primary" : "text-text-secondary/60"}`}
      >
        {label}
      </span>
    </div>
  );
}
