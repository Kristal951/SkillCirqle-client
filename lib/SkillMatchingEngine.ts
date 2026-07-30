import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSkillCandidatesForEngine } from "@/utils/getSkillCandidatesForEngine";
import { scoreMatch } from "@/utils/getSkillScoreMatchesForEngine";
import { getOrSetCache } from "@/utils/cacheHelper";

export async function runSkillSuggestionEngine({
  userSkills,
  userId,
  page = 1,
  limit = 10,
}: {
  userId: string;
  userSkills: {
    skill_id: string;
    type: "teach" | "learn";
  }[];
  page?: number;
  limit?: number;
}) {
  const cacheKey = `skill-suggestions:${userId}:p${page}:l${limit}`;

  return await getOrSetCache(cacheKey, async () => {
    const userTeachSkills = new Set(
      userSkills.filter((s) => s.type === "teach").map((s) => s.skill_id),
    );

    const userLearnSkills = new Set(
      userSkills.filter((s) => s.type === "learn").map((s) => s.skill_id),
    );

    const skillCandidates = await getSkillCandidatesForEngine(
      userId,
      userTeachSkills,
      userLearnSkills,
    );

    if (!skillCandidates?.length) {
      return {
        skillCards: [],
        total: 0,
        page,
        hasMore: false,
      };
    }

    const userMap = new Map<
      string,
      { teach: Set<string>; learn: Set<string> }
    >();

    for (const row of skillCandidates) {
      if (!userMap.has(row.user_id)) {
        userMap.set(row.user_id, {
          teach: new Set(),
          learn: new Set(),
        });
      }

      const user = userMap.get(row.user_id)!;

      if (row.type === "teach") {
        user.teach.add(row.skill_id);
      } else {
        user.learn.add(row.skill_id);
      }
    }

    const candidateUserIds = Array.from(userMap.keys());

    const { data: users } = await supabaseAdmin
      .from("profiles")
      .select("id, avatar_url")
      .in("id", candidateUserIds);

    const userAvatarMap = new Map(
      users?.map((u) => [u.id, u.avatar_url]) || [],
    );

    const allSkillIds = new Set<string>();

    for (const u of userMap.values()) {
      u.teach.forEach((id) => allSkillIds.add(id));
      u.learn.forEach((id) => allSkillIds.add(id));
    }

    const { data: skillRows } = await supabaseAdmin
      .from("skills")
      .select("id, title, slug, image_url, description")
      .in("id", Array.from(allSkillIds));

    const skillTitleMap = new Map(skillRows?.map((s) => [s.id, s.title]) || []);

    const skillLookup = new Map(
      skillRows?.map((skill) => [
        skill.id,
        { title: skill.title, slug: skill.slug, image: skill.image_url, desc: skill.description },
      ]) || [],
    );

    const skillMap = new Map<string, { count: number; avatars: string[] }>();

    for (const [candidateUserId, skills] of userMap.entries()) {
      const scoreData = scoreMatch({
        candidate: skills,
        myLearn: userLearnSkills,
        myTeach: userTeachSkills,
      });

      if (scoreData.score <= 0) continue;

      const avatar =
        userAvatarMap.get(candidateUserId) || "https://via.placeholder.com/150";

      for (const skillId of scoreData.teachesMe) {
        const skillTitle = skillTitleMap.get(skillId);
        if (!skillTitle) continue;

        if (!skillMap.has(skillId)) {
          skillMap.set(skillId, {
            count: 0,
            avatars: [],
          });
        }

        const entry = skillMap.get(skillId)!;

        entry.count += 1;
        entry.avatars.push(avatar);
      }
    }

    const skillCards = Array.from(skillMap.entries()).map(([skillId, data]) => {
      const skill = skillLookup.get(skillId);

      return {
        title: skill?.title ?? "Unknown Skill",
        slug: skill?.slug ?? "",
        image: skill?.image,
        desc: skill?.desc || `People who can teach you ${skill?.title ?? "this skill"}`,
        usersAmount: data.count,
        avatars: [...new Set(data.avatars)].slice(0, 4),
      };
    });

    skillCards.sort((a, b) => b.usersAmount - a.usersAmount);

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      skillCards: skillCards.slice(start, end),
      total: skillCards.length,
      page,
      hasMore: end < skillCards.length,
    };
  });
}
