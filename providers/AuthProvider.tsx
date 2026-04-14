"use client";

import { useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserProfile } from "@/hooks/useGetProfile"; 
import { useTokenStore } from "@/store/useTokenStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const { setTokens, setTotal } = useTokenStore();
  const { setStep } = useOnboardingStore();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadProfile = useCallback(async () => {
    try {
      const { profile } = await getUserProfile();
      // If we have a session but no profile, it might be a stale session
      if (profile) {
        setUser(profile);
        setTokens(profile?.wallet?.skillTokens || 0);
        setTotal(profile?.wallet?.totalEarned || 0);
        setStep(profile?.onboarding_step);
      } else {
        // Handle case where session exists but DB profile doesn't
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setUser(null);
    }
  }, [setUser, setTokens, setTotal, setStep]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await loadProfile();
      } else {
        setUser(null);
        setTokens(0);
        setTotal(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile, setUser, setTokens, setTotal]);

  return <>{children}</>;
}