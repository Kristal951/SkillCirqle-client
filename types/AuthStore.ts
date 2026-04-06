export interface User {
  uid: string;
  email: string;
  name: string;
  hasOnboarded: boolean;
  onboardingStep: number;
  createdAt: Date;
  avatarUrl: string;
  bio: string;
  location: string;
  role: string;
  skillsToTeach: string[];
  skillsToLearn: string[];
  exchanges: number;
  rating: number;
  wallet: {
    skillTokens: number;
    totalEarned: number;
    lastDailyReward: null;
  };
}

export interface TokenTransaction{
  userId: string;
  amount: number;
  type: "earn" | "spend";
  reason: string;
  createdAt: Date;
}