import { UserProfileProvider } from "@/hooks/UserProfileContext";

export default async function UserProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/profile/${id}`,
    { cache: "no-store" }
  );

  const { user } = await res.json();

  return (
    <UserProfileProvider user={user}>
      <main className="flex-1 overflow-y-auto ">{children}</main>
    </UserProfileProvider>
  );
}