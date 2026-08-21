import { RealtimeChannel } from "@supabase/supabase-js";

export type OnboardingRewardResponse = {
  success?: boolean;
  tokens?: number;
  message?: string;
  error?: string;
  code?: string;
};

export interface TokenState {
  tokens: number;
  loading: boolean;
  totalTokensEarned: number;
  error: string | null;
  channel: RealtimeChannel | null;
  channelUserId: string | null;

  subscribeToTokenUpdates: (userId: string) => void;
  unsubscribeFromTokenUpdates: () => void;
  setTokens: (tokens: number) => void;
  setTotal: (totalTokensEarned: number) => void;

  awardUserOnboardingTokens: () => Promise<OnboardingRewardResponse>;
}
