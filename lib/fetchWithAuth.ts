// lib/fetchWithAuth.ts
import { apiFetch } from "./apiFetch";

export const fetchWithAuth = async (
  url: string,
  router: any,
  options?: RequestInit
) => {
  try {
    const res = await apiFetch(url, options);
    return res;
  } catch (err: any) {
    if (
      err.message.includes("401") ||
      err.message.toLowerCase().includes("unauthorized")
    ) {
      router.replace("/auth/signin");
    }
    throw err;
  }
};