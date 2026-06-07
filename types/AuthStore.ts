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
  category: string;
  streaks: number;
  skill_tokens: number;
  total_earned: number;

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

export type ActiveChat = {
  avatar_url: string;
  id: string;
  last_message: string;
  last_message_at: string;
  name: string;
  user_id: string;
  is_online: boolean;
  other_user_id: string
};

export type Session = {
  id: string;
  session_id: string;
  device_name: string;
  browser: string;
  os: string;
  ip_address: string;
  is_current: boolean;
  last_active: string;
  location: {
    country: string;
    city: string;
    region: string;
    timezone: string;
  };
}