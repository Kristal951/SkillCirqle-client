import { apiFetch } from "@/lib/apiFetch";
import { TokenState } from "@/types/tokenStore";
import { create } from "zustand";

export const useTokenStore = create<TokenState>((set) => ({
  tokens: 0,
  loading: false,
  totalTokensEarned: 0,

  setTokens: (tokens) => set({ tokens }),
  setTotal: (totalTokensEarned) => set({ totalTokensEarned }),

  awardUserOnboardingTokens: async () => {
    set({ loading: true });

    try {
      const res = await apiFetch("/api/user/tokens/earn/onboarding", {
        method: "POST",
      });

      const data = await res.json();

      if (data?.tokens && data?.total !== undefined) {
        set({ tokens: data.tokens });
        set({ totalTokensEarned: data.total });
      }

      if (data?.message === "Already rewarded") {
        console.log("⚠️ Already rewarded");
      }

      return data;
    } catch (error) {
      console.error("❌ Failed to award onboarding tokens:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
