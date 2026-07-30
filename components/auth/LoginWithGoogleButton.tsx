"use client";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import React from "react";

const LoginWithGoogleButton = ({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        console.error("Google Login error:", error.message);
        setLoading(false);
      }
    } catch (error: any) {
      console.log("Google Login error", error.message);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 p-3 rounded-md bg-surface border border-white/5 transition text-sm sm:text-base ${
        loading ? "opacity-60 cursor-not-allowed" : "hover:bg-white/5"
      }`}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="google"
        className="w-5 h-5"
      />

      <span className="font-medium">Continue with Google</span>
    </button>
  );
};

export default LoginWithGoogleButton;
