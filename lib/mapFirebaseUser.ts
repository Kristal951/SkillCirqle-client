import { User as FirebaseUser } from "firebase/auth";
import { User } from "@/types/AuthStore";

export const mapFirebaseUserToAppUser = (
  user: FirebaseUser
): User => {
  return {
    uid: user.uid,
    email: user.email || "",
    name: user.displayName || "",
    avatarUrl: user.photoURL || "",

    hasOnboarded: false,
    onboardingStep: 0,

    createdAt: new Date(),

    bio: "",
    location: "",
    role: "",

    skillsToTeach: [],
    skillsToLearn: [],

    wallet: {
      skillTokens: 0,
      totalEarned: 0,
      lastDailyReward: null,
    },
  };
};