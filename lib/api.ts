import { toast } from "./toast";

let isRedirecting = false;

export const apiFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || `Error: ${res.status}`;

    toast.error("Request Failed", errorMessage);
    throw new Error(errorMessage);
  }

  return res;
};

function handleUnauthorized() {
  if (typeof window !== "undefined" && !isRedirecting) {
    isRedirecting = true;
    if (window.location.pathname === "/auth/signin") return;
    if (window.location.pathname === "/") return;

    toast.error("Session expired", "Please log in again.");

    setTimeout(() => {
      window.location.href = "/auth/signin";

      isRedirecting = false;
    }, 1500);
  }
}
