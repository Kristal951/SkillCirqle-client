import { useAuthStore } from "@/store/useAuthStore";

export const apiFetch = async (url: string, options?: RequestInit) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const isFormData = options?.body instanceof FormData;

    const res = await fetch(
      url,

      {
        ...options,

        signal: controller.signal,

        headers: {
          ...(isFormData
            ? {}
            : {
                "Content-Type": "application/json",
              }),

          ...options?.headers,
        },

        credentials: "include",
      },
    );

    if (res.status === 401) {
      try {
        await useAuthStore.getState().logout();
      } catch (e) {
        console.error(e);
      }

      const error = new Error("UNAUTHORIZED");

      (error as any).status = 401;

      throw error;
    }

    if (!res.ok) {
      let message = `Error ${res.status}`;

      try {
        const data = await res.json();

        message = data.message ?? message;
      } catch {}

      throw new Error(message);
    }

    return res;
  } finally {
    clearTimeout(timeout);
  }
};
