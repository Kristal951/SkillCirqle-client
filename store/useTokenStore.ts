import { apiFetch } from "@/lib/apiFetch";
import { TokenState } from "@/types/tokenStore";
import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export const useTokenStore = create<TokenState>((set, get) => ({
  tokens: 0,
  loading: false,
  totalTokensEarned: 0,
  error: null,
  channel: null as RealtimeChannel | null,
  channelUserId: null as string | null,

  setTokens: (tokens) => set({ tokens }),
  setTotal: (totalTokensEarned) => set({ totalTokensEarned }),
  subscribeToTokenUpdates: async (userId: string) => {
    const { channel, channelUserId } = get();

    if (channelUserId === userId) return;

    if (channel) {
      const supabase = getSupabaseBrowserClient();
      supabase.removeChannel(channel);
      set({ channel: null, channelUserId: null });
    }
    set({ channelUserId: userId });

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("skill_tokens, total_earned")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      set({
        tokens: data.skill_tokens ?? 0,
        totalTokensEarned: data.total_earned ?? 0,
      });
    } else if (error) {
      console.error("Failed to hydrate token balance:", error);
    }

    const newChannel = supabase
      .channel(`profile-tokens-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log("[tokens realtime] payload received:", payload);
          const next = payload.new as {
            skill_tokens?: number;
            total_earned?: number;
          };

          set((state) => ({
            tokens: next.skill_tokens ?? state.tokens,
            totalTokensEarned: next.total_earned ?? state.totalTokensEarned,
          }));
        },
      )
      .subscribe();

    set({ channel: newChannel });
  },

  unsubscribeFromTokenUpdates: () => {
    const { channel } = get();
    if (!channel) return;

    const supabase = getSupabaseBrowserClient();
    supabase.removeChannel(channel);
    set({ channel: null, channelUserId: null });
  },

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