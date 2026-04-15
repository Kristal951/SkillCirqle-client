export interface User {
  id: string;
  email: string;
  name: string;

  has_onboarded: boolean;
  onboarding_step: number;

  created_at: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;

  role: string;

  skills_to_teach: string[];
  skills_to_learn: string[];

  exchanges: number;
  rating: number;

  wallet: {
    skillTokens: number;
    totalEarned: number;
    lastDailyReward: string | null;
  };

  user_metadata?: {
    username: string;
    full_name: string;
  };
}

export interface TokenTransaction {
  userId: string;
  amount: number;
  type: "earn" | "spend";
  reason: string;
  createdAt: Date;
}

export type ChatUser = {
  name: string;
  image: string;
  lastSeen: string;
  lastMsg?: string;
  isActive?: boolean;
  isOnline?: boolean;
  id: string | undefined;
};

export type ChatContextType = {
  activeChat: ChatUser | null;
  setActiveChat: (chat: ChatUser | null) => void;
};
