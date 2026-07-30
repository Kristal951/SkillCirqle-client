"use client";
import { useEffect, useCallback, useState, useRef, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserProfile } from "@/hooks/useGetProfile";
import { useTokenStore } from "@/store/useTokenStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRecoveryPage = pathname === "/auth/update-password";
  const isRecoveryPageRef = useRef(isRecoveryPage);

  useEffect(() => {
    isRecoveryPageRef.current = isRecoveryPage;
  }, [isRecoveryPage]);

  const [loading, setLoading] = useState(true);
  const setUser = useAuthStore((s) => s.setUser);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const { setTokens, setTotal } = useTokenStore();
  const { setStep } = useOnboardingStore();

  const resetStore = useCallback(() => {
    setUser(null);
    setTokens(0);
    setTotal(0);
    setStep(1);
  }, [setUser, setTokens, setTotal, setStep]);

  const loadProfile = useCallback(async () => {
    try {
      const { profile, error } = await getUserProfile();
      if (error) throw error;
      if (!profile) {
        resetStore();
        return;
      }
      setUser(profile);
      setTokens(profile.skill_tokens ?? 0);
      setTotal(profile.total_earned ?? 0);
      setStep(profile.onboarding_step ?? 1);
    } catch (e) {
      console.error("Profile error", e);
      resetStore();
    }
  }, [resetStore, setUser, setTokens, setTotal, setStep]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const isOAuthLogin = searchParams.get("login") === "oauth";

          if (isOAuthLogin) {
            await fetchUser();

            const url = new URL(window.location.href);
            url.searchParams.delete("login");
            router.replace(url.pathname + url.search);
          } else {
            await loadProfile();
          }
        } else {
          resetStore();
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      try {
        switch (event) {
          case "SIGNED_IN": {
            const userId = session?.user?.id;
            const currentUser = useAuthStore.getState().user;
            const isSameUser = currentUser?.id === userId;
            if (!isSameUser) setLoading(true);
            await fetchUser();
            break;
          }
          case "SIGNED_OUT":
            useAuthStore.getState().reset();
            break;
          case "TOKEN_REFRESHED":
            return;
          default:
            if (session?.user) {
              await loadProfile();
            } else {
              resetStore();
            }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUser, loadProfile, resetStore, searchParams, router]);

  if (loading && !isRecoveryPageRef.current) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size={40} />
        </div>
      }
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </Suspense>
  );
}