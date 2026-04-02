export const apiFetch = async (url: string, options?: RequestInit) => {
  const isFormData = options?.body instanceof FormData;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
    credentials: "include",
  });

  if (res.status === 401) {
    const error = new Error("UNAUTHORIZED");
    (error as any).status = 401;
    throw error;
  }

  if (!res.ok) {
    let errorMessage = `Error: ${res.status}`;

    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {}

    throw new Error(errorMessage);
  }

  return res;
};