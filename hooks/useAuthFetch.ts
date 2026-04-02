// hooks/useAuthFetch.ts
"use client";

import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const useAuthFetch = () => {
  const router = useRouter();

  const authFetch = async (url: string, options?: RequestInit) => {
    return fetchWithAuth(url, router, options);
  };

  return { authFetch };
};