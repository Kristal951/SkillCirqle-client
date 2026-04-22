"use client";

import { useEffect, useCallback, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserProfile } from "@/hooks/useGetProfile";
import { useTokenStore } from "@/store/useTokenStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const setUser = useAuthStore((s) => s.setUser);
  const { setTokens, setTotal } = useTokenStore();
  const { setStep } = useOnboardingStore();

  const loadProfile = useCallback(async () => {
    try {
      const { profile, error } = await getUserProfile();

      if (error) throw error;

      if (profile) {
        setUser(profile);
        setTokens(profile?.wallet?.skillTokens ?? 0);
        setTotal(profile?.wallet?.totalEarned ?? 0);
        setStep(profile?.onboarding_step ?? 1);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setUser(null);
    }
  }, [setUser, setTokens, setTotal, setStep]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;

        if (event === "TOKEN_REFRESHED") return;

        // logout
        if (!user) {
          setUser(null);
          setTokens(0);
          setTotal(0);
          setStep(1);
          setLoading(false);
          return;
        }

        await loadProfile();
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, loadProfile, setUser, setTokens, setTotal, setStep]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={40} />
      </div>
    );
  }

  return <>{children}</>;
}