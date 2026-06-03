export const addUserSkillsToRequiredTables = async (
  teachSkills: string[],
  learnSkills: string[],
) => {
  const res = await fetch("/api/user/skills/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teachSkills,
      learnSkills,
    }),
  });

  if (!res.ok) {
    return {
      success: false,
      message: "Failed to add skills to required tables",
    };
  }

  return {
    success: true,
    message: "Skills added to required tables successfully",
  };
};
