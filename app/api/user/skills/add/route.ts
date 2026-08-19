import {
  addUserSkill,
  removeUserSkill,
  getUserSkillIds,
} from "@/lib/addUserSkillsToTable";
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
    const newTeachIds = await Promise.all(teachSkills.map(resolveSkillId));
    const newLearnIds = await Promise.all(learnSkills.map(resolveSkillId));

    const [currentTeachIds, currentLearnIds] = await Promise.all([
      getUserSkillIds(user.id, "teach"),
      getUserSkillIds(user.id, "learn"),
    ]);

    const diff = (currentIds: string[], newIds: string[]) => ({
      toAdd: newIds.filter((id) => !currentIds.includes(id)),
      toRemove: currentIds.filter((id) => !newIds.includes(id)),
    });

    const teachDiff = diff(currentTeachIds, newTeachIds);
    const learnDiff = diff(currentLearnIds, newLearnIds);

    await Promise.all([
      ...teachDiff.toAdd.map((id) => addUserSkill(user.id, id, "teach")),
      ...teachDiff.toRemove.map((id) => removeUserSkill(user.id, id, "teach")),
      ...learnDiff.toAdd.map((id) => addUserSkill(user.id, id, "learn")),
      ...learnDiff.toRemove.map((id) => removeUserSkill(user.id, id, "learn")),
    ]);

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return new Response("Failed to sync skills", { status: 500 });
  }
}
