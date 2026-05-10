import { formatDistanceToNowStrict } from "date-fns";

export const formatLastSeenShort = (timestamp?: string | number) => {
  if (!timestamp) return "";

  const date = new Date(Number(timestamp));

  if (isNaN(date.getTime())) return "";

  return formatDistanceToNowStrict(date, {
    addSuffix: false,
  })
    .replace("minutes", "m")
    .replace("minute", "m")
    .replace("hours", "h")
    .replace("hour", "h")
    .replace("seconds", "s")
    .replace("second", "s")
    .replace("days", "d")
    .replace("day", "d");
};
