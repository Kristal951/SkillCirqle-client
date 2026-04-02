"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { mapFirebaseUserToAppUser } from "@/lib/mapFirebaseUser";

export const useAuthListener = () => {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const mappedUser = user ? mapFirebaseUserToAppUser(user) : null;
      setUser(mappedUser);
    });

    return () => unsubscribe();
  }, [setUser]);
};
