import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Session } from "@/types/AuthStore";

export const SESSION_KEY = ["user-sessions"];

export function useSessions() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: async () => {
      const res = await fetch("/api/user/session");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      return (data.sessions ?? []) as Session[];
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/session/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(SESSION_KEY, (old: Session[] = []) =>
        old.filter((s) => s.id !== id),
      );
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/session/revoke-all", {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.setQueryData(SESSION_KEY, (old: Session[] = []) =>
        old.filter((s) => s.is_current),
      );
    },
  });
}

export function useClearSessionCache() {
  const queryClient = useQueryClient();
  return () => queryClient.removeQueries({ queryKey: SESSION_KEY });
}
