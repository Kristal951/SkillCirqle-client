"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation"; // Add this
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/lib/api";

export const useAuthHydrate = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const pathname = usePathname(); // Get current route
  const hydrated = useRef(false);

  useEffect(() => {
    const isAuthPage = pathname.startsWith("/auth");

    if (hydrated.current || isAuthPage) {
      setLoading(false);
      return;
    }

    hydrated.current = true;

    const hydrate = async () => {
      try {
        const res = await apiFetch("/api/auth/profile");
        const data = await res.json();
        setUser(data.user);
      } catch (err: any) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [setUser, setLoading, pathname]);
};