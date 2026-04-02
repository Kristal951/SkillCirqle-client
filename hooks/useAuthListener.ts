"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { mapFirebaseUserToAppUser } from "@/lib/mapFirebaseUser";
import { User } from "@/types/AuthStore";

export const useAuthListener = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);

        if (!firebaseUser) {
          setUser(null);
          return;
        }
        console.log(firebaseUser, 'firebase')

        const baseUser = mapFirebaseUserToAppUser(firebaseUser);

        const res = await fetch(`/api/auth/profile`);
        const dbUser = await res.json();

        const fullUser: User = {
          ...baseUser,
          ...dbUser,
        };

        setUser(fullUser);
        console.log(fullUser, 'full')
      } catch (err) {
        console.error("Auth listener error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);
};
