import { createSupabaseServer } from "@/lib/supabaseServer";

export const getUserSkillsFromTable = async (userId: string, type?: string) => {
  const supabase = await createSupabaseServer();

  if (!userId) {
    console.log("Unauthorized");
    return {
      success: false,
      skills: [],
      error: "Unauthorized",
    };
  }

  try {
    let query = supabase
      .from("user_skills")
      .select("type, verified, skills(id, title)")
      .eq("user_id", userId);

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error fetching user skills:", error.message);
      return {
        success: false,
        skills: [],
        error: error.message,
      };
    }

    const skills = (data || []).map((row: any) => ({
      skill_id: row.skills?.id,
      name: row.skills?.title,
      type: row.type,
      verified: row.verified ?? false,
    }));

    return {
      success: true,
      skills
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
