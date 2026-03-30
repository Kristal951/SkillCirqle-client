import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type UserProfile = {
  uid: string;
  email: string;
  name?: string;
  hasOnboarded?: boolean;
  [key: string]: any;
};

export const useUserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/api/auth/profile");
        if (!res) return setError("FAILED");

        if (!res.ok) {
          if (res.status === 401) {
            setError("UNAUTHORIZED");
          } else {
            setError("FAILED");
          }
          return;
        }

        const data = await res.json();
        console.log(data)
        setUser(data.user);
      } catch (err) {
        console.error("PROFILE_ERROR:", err);
        setError("NETWORK_ERROR");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    hasOnboarded: !!user?.hasOnboarded,
    isReady: !loading,
  };
};
