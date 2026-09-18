import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getOrSetCache } from "@/utils/cacheHelper";
import { UserProfileProvider } from "@/hooks/UserProfileContext";

export default async function UserProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  let user = null;

  try {
    user = await getOrSetCache(
      `profile:${id}`,
      async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      600,
    );
  } catch (err) {
    console.error(`Profile fetch error for id ${id}:`, err);
    notFound();
  }

  if (!user) {
    notFound();
  }

  return (
    <UserProfileProvider user={user}>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </UserProfileProvider>
  );
}