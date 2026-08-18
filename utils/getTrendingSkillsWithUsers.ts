import { getTrendingSkills } from "@/lib/getTrendSkills";
import { getUsersBySkill } from "./getSkillUsers";

export async function getTrendingSkillCards(page = 1, limit = 10, userId?: string) {
  const trending = await getTrendingSkills(page, limit, userId);

  const skillCards = await Promise.all(
    trending.skills.map(async (skill) => {
      const users = await getUsersBySkill(skill.id, 1, 5, true);

      const avatars =
        users.users
          ?.map((u: any) => u.avatar_url)
          .filter(Boolean)
          .slice(0, 4) || [];

      return {
        id: skill.id,
        title: skill.title,
        slug: skill.slug,
        desc: skill.desc || `People who can teach ${skill.title}`,
        usersAmount: skill.count,
        image: skill.image,
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