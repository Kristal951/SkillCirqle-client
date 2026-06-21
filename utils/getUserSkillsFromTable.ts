import { createSupabaseServer } from "@/lib/supabaseServer";

export const getUserSkillsFromTable = async (userId: string) => {
  const supabase = await createSupabaseServer();
  if (!userId) {
    console.log("Unauthorized");
    return;
  }

  try {
    const { error, data: mySkills } = await supabase
      .from("user_skills")
      .select("skill_id, type")
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error fetching user skills:", error.message);
      return {
        success: false,
        skills: [],
        error: error.message,
      };
    }

    return {
      success: true,
      skills: mySkills || [],
    };
  } catch (error) {
    console.error("Runtime error fetching user skills:", error);
    return {
      success: false,
      skills: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
