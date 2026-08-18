"use client";
import { useEffect, useCallback, useState, useRef, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserProfile } from "@/hooks/useGetProfile";
import { useTokenStore } from "@/store/useTokenStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function isInvalidRefreshTokenError(error: unknown): boolean {
  const err = error as { code?: string; status?: number } | null;
  if (!err) return false;
  return (
    err.code === "refresh_token_not_found" ||
    err.code === "refresh_token_already_used" ||
    err.status === 400
  );
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRecoveryPage = pathname === "/auth/update-password";
  const isRecoveryPageRef = useRef(isRecoveryPage);
  const isPublicAuthPage = pathname?.startsWith("/auth") ?? false;
  const isPublicAuthPageRef = useRef(isPublicAuthPage);

  useEffect(() => {
    isRecoveryPageRef.current = isRecoveryPage;
    isPublicAuthPageRef.current = isPublicAuthPage;
  }, [isRecoveryPage, isPublicAuthPage]);

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

  const forceReauth = useCallback(
    async (reason: string) => {
      resetStore();
      await supabase.auth.signOut();
      if (isRecoveryPageRef.current) return;
      const url = new URL("/auth/signin", window.location.origin);
      url.searchParams.set("error", reason);
      router.replace(url.pathname + url.search);
    },
    [resetStore, supabase, router],
  );

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
      // setStep(profile.onboarding_step ?? 1);
    } catch (e) {
      console.error("Profile error", e);
      resetStore();
    }
  }, [resetStore, setUser, setTokens, setTotal, setStep]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (isPublicAuthPageRef.current) {
          resetStore();
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (isInvalidRefreshTokenError(error)) {
          await forceReauth("session_expired");
          return;
        }

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
            if (!session) {
              await forceReauth("session_expired");
            }
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
  }, [
    supabase,
    fetchUser,
    loadProfile,
    resetStore,
    searchParams,
    router,
    forceReauth,
  ]);

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