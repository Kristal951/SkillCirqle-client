const REASON_LABELS: Record<string, string> = {
  onboarding_reward: "Completed Onboarding",
  daily_reward: "Daily login reward",
  proposal_accepted_learn: "Spent on a learning proposal",
  proposal_accepted_teach: "Earned from accepting a learn proposal",
};

export function formatTransactionReason(reason: string): string {
  if (REASON_LABELS[reason]) return REASON_LABELS[reason];

  const spaced = reason.replaceAll("_", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}