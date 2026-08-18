import { addUserSkill } from "@/lib/addUserSkillsToTable";
import { resolveSkillId } from "@/lib/resolveSkillId";
import { getServerUser } from "@/lib/server-auth";

export async function POST(request: Request) {
  const user = await getServerUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { teachSkills, learnSkills } = await request.json();

  if (!Array.isArray(teachSkills) || !Array.isArray(learnSkills)) {
    return new Response("teachSkills and learnSkills must be arrays", {
      status: 400,
    });
  }

  try {
    type SkillEntry = { skill: string; type: "teach" | "learn" };

    const allSkills: SkillEntry[] = [
      ...teachSkills.map(
        (s: string): SkillEntry => ({ skill: s, type: "teach" }),
      ),
      ...learnSkills.map(
        (s: string): SkillEntry => ({ skill: s, type: "learn" }),
      ),
    ];

    await Promise.all(
      allSkills.map(async (item) => {
        const skillId = await resolveSkillId(item.skill);
        return addUserSkill(user.id, skillId, item.type);
      }),
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return new Response("Failed onboarding skills", { status: 500 });
  }
}
