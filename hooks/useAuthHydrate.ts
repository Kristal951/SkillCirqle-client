"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthFetch } from "./useAuthFetch";
import { useTokenStore } from "@/store/useTokenStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export const useAuthHydrate = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const setStep = useOnboardingStore((s) => s.setStep);
  const setHasOnboarded = useOnboardingStore((s) => s.setHasOnboarded);

  const pathname = usePathname();
  const { authFetch } = useAuthFetch();
  const { setTokens } = useTokenStore();

  const hasRun = useRef(false);

  useEffect(() => {
    const isAuthPage = pathname.startsWith("/auth");

    if (hasRun.current || isAuthPage) {
      setLoading(false);
      return;
    }

    hasRun.current = true;

    const hydrate = async () => {
      setLoading(true);

      try {
        const res = await authFetch("/api/auth/profile");
        const data = await res.json();
        setUser(data.user);
        setTokens(data.user?.wallet?.skillTokens ?? 0);
        setStep(data.user.onboardingStep);
        setHasOnboarded(data.user.hasOnboarded);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
        setHydrated(true);
      }
    };

    hydrate();
  }, []);
};
