import { UserProfileProvider } from "@/hooks/UserProfileContext";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getOrSetCache } from "@/utils/cacheHelper";

export default async function NewProposalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return (
      <UserProfileProvider user={null}>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </UserProfileProvider>
    );
  }

  const supabase = await createSupabaseServer();
  let profile = null;

  try {
    profile = await getOrSetCache(
      `profile:${id}:with-skills`,
      async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            name,
            avatar_url,
            user_skills (
              skill_id,
              type,
              skills (
                id,
                title
              )
            )
          `,
          )
          .eq("id", id)
          .eq("user_skills.type", "teach")
          .eq("user_skills.verified", true)
          .maybeSingle();

        if (error) {
          console.error(error);
          throw error;
        }
        return data;
      },
      600,
    );
  } catch (error) {
    console.error("Failed to load profile for proposal layout:", error);
  }

  return (
    <UserProfileProvider user={profile}>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </UserProfileProvider>
  );
}
