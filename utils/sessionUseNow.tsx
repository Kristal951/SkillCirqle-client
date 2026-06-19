import { useNow } from "@/hooks/useNow";

const JOIN_WINDOW_BEFORE_MIN = 10;
const JOIN_WINDOW_AFTER_MIN = 30;

export function getSessionPhase(
  scheduledAt: string,
  now: number,
): "upcoming" | "joinable" | "missed" {
  const start = new Date(scheduledAt).getTime();
  const joinOpensAt = start - JOIN_WINDOW_BEFORE_MIN * 60000;
  const joinClosesAt = start + JOIN_WINDOW_AFTER_MIN * 60000;

  if (now < joinOpensAt) return "upcoming";
  if (now <= joinClosesAt) return "joinable";
  return "missed";
}
