"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthFetch } from "./useAuthFetch";
import { useTokenStore } from "@/store/useTokenStore";

export const useAuthHydrate = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const pathname = usePathname();
  const hydrated = useRef(false);
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { setTokens } = useTokenStore();

  useEffect(() => {
    const isAuthPage = pathname.startsWith("/auth");

    if (hydrated.current || isAuthPage) {
      setLoading(false);
      return;
    }

    hydrated.current = true;

    const hydrate = async () => {
      try {
        const res = await authFetch("/api/auth/profile");
        const data = await res.json();
        setUser(data.user);
        setTokens(data.user.wallet.skillTokens);
      } catch (err: any) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [setUser, setLoading, pathname]);
};
