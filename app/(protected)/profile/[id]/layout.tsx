import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { UserProfileProvider } from "@/hooks/UserProfileContext";

export default async function UserProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/profile/${id}`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  );

  if (!res.ok) {
    console.error(
      `Failed to fetch profile ${id}: ${res.status} ${res.statusText}`,
    );
    notFound();
  }

  const data = await res.json();
  const { user } = data;

  if (!user) {
    notFound();
  }

  return (
    <UserProfileProvider user={user}>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </UserProfileProvider>
  );
}