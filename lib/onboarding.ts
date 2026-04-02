import { useState } from "react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useRouter } from "next/navigation";

export const useOnboardingNavigation = () => {
  const { updateUserOnboardingStepInDB } = useOnboardingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoveToNextOnboardingStep = async (step: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await updateUserOnboardingStepInDB(step);

      router.push(`/onboarding/step-${step}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    handleMoveToNextOnboardingStep,
    loading,
    error,
  };
};