import SkillSlugPage from "./page";

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/skills/${slug}/teachers?page=1&limit=20`,
    { cache: "no-store" }
  );

  const data = await res.json();

  return <SkillSlugPage data={data} />;
}