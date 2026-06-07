import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("Request failed");
    throw error;
  }

  return res.json();
};

export const createFetcherWithAuth = (router: AppRouterInstance) => {
  return async (url: string) => {
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 401) {
        router.replace("/auth/signin");
        throw new Error("Unauthorized");
      }

      throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json();
  };
};
