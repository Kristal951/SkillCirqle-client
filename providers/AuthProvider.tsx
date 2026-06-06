"use client";

import { useEffect, useCallback, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserProfile } from "@/hooks/useGetProfile";
import { useTokenStore } from "@/store/useTokenStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();

  const isRecoveryPage = pathname === "/auth/update-password";

  const setUser = useAuthStore((s) => s.setUser);
  const { setTokens, setTotal } = useTokenStore();
  const { setStep } = useOnboardingStore();
  const { fetchUser } = useAuthStore();

  const loadProfile = useCallback(async () => {
    try {
      const { profile, error } = await getUserProfile();

      if (error) throw error;

      if (profile) {
        setUser(profile);
        setTokens(profile?.skill_tokens ?? 0);
        setTotal(profile?.total_earned ?? 0);
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
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "supabase_recovery_in_progress" && e.newValue === "true") {
        supabase.auth.signOut({ scope: "local" });
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const user = session?.user ?? null;

        if (event === "TOKEN_REFRESHED") return;

        if (event === "SIGNED_IN") {
          await fetchUser();
          setLoading(false); 
          return;
        }

        if (event === "SIGNED_OUT") {
          useAuthStore.getState().reset();
          setLoading(false);
          return;
        }

        if (!user) {
          setUser(null);
          setTokens(0);
          setTotal(0);
          setStep(1);
          setLoading(false);
          return;
        }

        await loadProfile();

        if (!isRecoveryPage) {
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [
    supabase,
    loadProfile,
    setUser,
    setTokens,
    setTotal,
    setStep,
    isRecoveryPage,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={40} />
      </div>
    );
  }

  return <>{children}</>;
}
