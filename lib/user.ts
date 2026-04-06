import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const saveUserToDB = async (user: any) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
      createdAt: new Date(),
      hasOnboarded: false,
      onboardingStep: 0,
      exchanges: 0,
      rating: 0,
      wallet: {
        skillTokens: 0,
        totalEarned: 0,
        lastDailyReward: null,
      },
    });
  }
};
