import { useQuery } from "@tanstack/react-query";

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const res = await fetch("/api/user/skills");
      const { skills } = await res.json();
      return skills;
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });
}
