import { Session } from "@/types/AuthStore";

export function groupSessionsByDevice(sessions: Session[]) {
  return sessions.reduce((groups, session) => {
    const key = session.device_name || 'Unknown Device';
    if (!groups[key]) groups[key] = [];
    groups[key].push(session);
    return groups;
  }, {} as Record<string, Session[]>);
}