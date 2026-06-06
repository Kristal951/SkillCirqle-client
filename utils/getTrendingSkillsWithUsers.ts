import { getTrendingSkills } from "@/lib/getTrendSkills";
import { getUsersBySkill } from "./getSkillUsers";
import { getSkillImage } from "@/lib/getSkillImage";

export async function getTrendingSkillCards(page = 1, limit = 10) {
  const trending = await getTrendingSkills(page, limit);

  const skillCards = await Promise.all(
    trending.skills.map(async (skill) => {
      const users = await getUsersBySkill(skill.id, 1, 5);

      const avatars =
        users.users
          ?.map((u: any) => u.avatar_url)
          .filter(Boolean)
          .slice(0, 4) || [];

      return {
        id: skill.id,
        title: skill.title,
        slug: skill.slug,
        desc: `People who can teach ${skill.title}`,
        usersAmount: skill.count,
        image: getSkillImage(skill.title),
        avatars,
      };
    }),
  );

  return {
    skillCards: skillCards,
    total: skillCards.length,
    page,
    limit,
    hasMore: trending.hasMore,
  };
}

// object { skillCards: (2) […], total: 2, page: 1, hasMore: false }
// ​
// hasMore: false
// ​
// page: 1
// ​
// skillCards: Array [ {…}, {…} ]
// ​
// total: 2
// ​
// <prototype>: Object { … }
