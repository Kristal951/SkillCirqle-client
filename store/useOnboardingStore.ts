import { apiFetch } from "@/lib/apiFetch";
import { OnboardingState } from "@/types/OnboardingStore";
import { create } from "zustand";

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: null,
  totalSteps: 2,
  hasOnboarded: false,
  isLoadingStep: false,

  setStep: (step) => set({ step }),
  setIsLoadingStep: (isLoadingStep) => set({ isLoadingStep }),

  getUserCurrentStepFromDB: async () => {
    set({ isLoadingStep: true });
    try {
      const res = await apiFetch("/api/user/onboarding");
      const data = await res.json();

      if (data?.step !== undefined && data?.step !== null) {
        set({ step: data.step });
      }
    } catch (error) {
      console.error("Onboarding fetch error:", error);
    } finally {
      set({ isLoadingStep: false });
    }
  },

  checkIfOnboardingCompleted: async () => {
    try {
      const res = await apiFetch("/api/user/onboarding/hasOnboarded");
      const data = await res.json();

      set({ hasOnboarded: !!data?.hasOnboarded });
    } catch (error) {
      console.error("Onboarding fetch error:", error);
    }
  },

  updateUserOnboardingStepInDB: async (step: number, update?: boolean) => {
    try {
      set({ step });

      if (!update) return;

      const res = await apiFetch("/api/user/onboarding", {
        method: "POST",
        body: JSON.stringify({ step }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to update onboarding step");
      }

      const data = await res.json();

      if (!data?.success) {
        throw new Error(data?.message || "Update failed");
      }

      return data;
    } catch (error) {
      console.error("Onboarding update error:", error);

      // optional rollback (recommended)
      // set({ step: previousStep });

      throw error;
    }
  },

  setTotalSteps: (totalSteps) => set({ totalSteps }),

  reset: () =>
    set({
      step: 1,
      hasOnboarded: false,
    }),

  setHasOnboarded: (value) => set({ hasOnboarded: value }),
}));
