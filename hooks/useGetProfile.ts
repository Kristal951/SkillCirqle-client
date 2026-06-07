import { apiFetch } from "@/lib/apiFetch";

export const getUserProfile = async () => {
  const res = await apiFetch("/api/auth/profile", {
    method: "GET",
    credentials: "include", 
  });
  const data = await res.json();
  return data;
};
