export type ConfirmationActionType = "APPROVED" | "REJECTED";

export type SkillVerificationStatus = 'PENDING' | "APPROVED" | "REJECTED"

interface SkillVerificationUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

interface SkillVerificationReviewer {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
}

interface SkillVerificationSkill {
  id: string;
  name: string;
  category: string;
}

export interface SkillVerification {
  id: string;
  status: SkillVerificationStatus;
  proof_type: string;
  proof_url: string;
  note: string;
  rejection_reason: string;
  skill_id: string;
  name: string;
  created_at: string;
  reviewed_at: string | null;
  updated_at: string;
  user: SkillVerificationUser;
  reviewer: SkillVerificationReviewer | null;
  skill: SkillVerificationSkill
}