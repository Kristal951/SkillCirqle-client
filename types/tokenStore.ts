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

  setTokens: (tokens: number) => void;
  setTotal: (totalTokensEarned: number) => void;

  awardUserOnboardingTokens: () => Promise<OnboardingRewardResponse>;
}
