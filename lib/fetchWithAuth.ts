import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { apiFetch } from "./apiFetch";

export const fetchWithAuth = async (
  url: string,
  router: AppRouterInstance,
  options?: RequestInit,
) => {
  const res = await apiFetch(url, options);

  if (!res.ok) {
    if (res.status === 401) {
      router.replace("/auth/signin");
      throw new Error("Unauthorized");
    }

    throw new Error(`Request failed with status ${res.status}`);
  }
  return res;
};
