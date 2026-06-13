import { addUserSkill } from "@/lib/addUserSkillsToTable";
import { resolveSkillId } from "@/lib/resolveSkillId";
import { getServerUser } from "@/lib/server-auth";

export async function POST(request: Request) {
  const user = await getServerUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { teachSkills, learnSkills } = await request.json();

  try {
    const allSkills = [
      ...teachSkills.map((s: string) => ({ skill: s, type: "teach" })),
      ...learnSkills.map((s: string) => ({ skill: s, type: "learn" })),
    ];

    for (const item of allSkills) {
      const skillId = await resolveSkillId(item.skill);

      await addUserSkill(user.id, skillId, item.type);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err)
    return new Response("Failed onboarding skills", { status: 500 });
  }
}