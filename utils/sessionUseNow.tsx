import { useNow } from "@/hooks/useNow";

const PREVIEW_WINDOW_BEFORE_MIN = 10;
const JOIN_WINDOW_AFTER_MIN = 30;

export function getSessionPhase(
  scheduledAt: string,
  now: number,
): "upcoming" | "preview" | "joinable" | "missed" {
  const start = new Date(scheduledAt).getTime();
  const previewOpensAt = start - PREVIEW_WINDOW_BEFORE_MIN * 60000;
  const joinClosesAt = start + JOIN_WINDOW_AFTER_MIN * 60000;

  if (now < previewOpensAt) return "upcoming";
  if (now < start) return "preview";
  if (now <= joinClosesAt) return "joinable";
  return "missed";
}