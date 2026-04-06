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

        const baseUser = mapFirebaseUserToAppUser(firebaseUser);

        const res = await fetch(`/api/auth/profile`);
        const user = await res.json();
        const dbUser = user.user;

        const fullUser: User = {
          uid: baseUser.uid || "",
          email: baseUser.email || "",
          name: baseUser.name || "",
          hasOnboarded: dbUser?.hasOnboarded || false,
          onboardingStep: dbUser?.onboardingStep,
          createdAt: dbUser?.createdAt,
          avatarUrl: dbUser?.avatarUrl,
          bio: dbUser?.bio,
          location: dbUser?.location,
          role: dbUser?.role,
          skillsToTeach: dbUser?.skillsToTeach,
          skillsToLearn: dbUser?.skillsToLearn,
          wallet: {
            skillTokens: dbUser?.wallet?.skillTokens,
            totalEarned: dbUser?.wallet?.totalEarned,
            lastDailyReward: null,
          },
          exchanges: 0,
          rating: 0
        };

        setUser(fullUser);
        console.log(fullUser, "full");
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
