import { User } from "@supabase/supabase-js";

export type ProposalStatus = 
  | "pending" 
  | "accepted" 
  | "declined" 
  | "withdrawn" 
  | "expired" 
  | "negotiating"
  | "completed";

export type EngagementType = "learn" | "swap";
export type SessionType = "quick" | "standard";

export type Proposal = {
  id: string;

  sender_id: string;
  receiver_id: string;
  sender?: User;
  receiver?: User;

  teach_skill: string;
  learn_skill?: string;

  message: string;

  engagement_type: EngagementType;
  session_format: SessionType;

  status: ProposalStatus;

  created_at: string;
};

export type CreateProposalInput = {
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderImage?: string;
  teachSkillId?: string;
  teachSkillName?: string;
  learnSkillId: string;
  learnSkillName?: string;
  session_format: string;
  message: string;
  goal?: string;
  engagementType: "learn" | "swap";
  sessionDurationType: "quick" | "standard";
  expectedSessions: number;
  link?: string;
};

export type ProposalStore = {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  updatingStatus: boolean;

  fetchProposals: (userId: string) => Promise<void>;
  createProposal: (payload: Partial<Proposal>) => Promise<Proposal>;
  updateProposalStatus: (
    proposalId: string,
    status: ProposalStatus,
    senderName: string,
    senderImage: string,
    link: string,
  ) => Promise<null>;
  getProposalById: (id: string) => Proposal | undefined;
  clearProposals: () => void;
};
