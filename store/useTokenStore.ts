import { apiFetch } from "@/lib/apiFetch";
import { TokenState } from "@/types/tokenStore";
import { create } from "zustand";

export const useTokenStore = create<TokenState>((set, get) => ({
  tokens: 0,
  loading: false,
  totalTokensEarned: 0,
  error: null,

  setTokens: (tokens) => set({ tokens }),
  setTotal: (totalTokensEarned) => set({ totalTokensEarned }),

  awardUserOnboardingTokens: async () => {
    const { loading } = get();

    if (loading) return;

    set({ loading: true, error: null });

    try {
      const res = await apiFetch("/api/user/tokens/earn/onboarding", {
        method: "POST",
      });

      const data = await res.json();

      if (data?.success) {
        set({
          tokens: data.tokens ?? 0,
          totalTokensEarned: data.totalEarned ?? 0,
        });
      }

      return data;
    } catch (error) {
      console.error("❌ Failed to award onboarding tokens:", error);

      set({
        error: "Failed to award tokens",
      });

      return null;
    } finally {
      set({ loading: false });
    }
  },
}));