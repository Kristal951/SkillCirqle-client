export type OnboardingRewardResponse = {
  success?: boolean;
  tokens?: number;
  message?: string;
  error?: string;
};

export interface TokenState {
  tokens: number;
  loading: boolean;
  totalTokensEarned: number;

  setTokens: (tokens: number) => void;
  setTotal: (totalTokensEarned: number) => void;

  awardUserOnboardingTokens: () => Promise<OnboardingRewardResponse>;
}
