import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { CreateProposalInput } from "@/types/Proposal";
import { getSocket } from "@/lib/socket";
import { emitNotification } from "@/lib/notification/notify";

export async function createProposal(data: CreateProposalInput) {
  const supabase = await getSupabaseBrowserClient();

  const durationMap = {
    quick: 20,
    standard: 60,
  };

  if (!data.senderId || !data.receiverId) {
    throw new Error("Invalid users.");
  }

  if (
    data.engagementType === "swap" &&
    (!data.teachSkillId || !data.learnSkillId)
  ) {
    throw new Error("Swap proposals require both skills.");
  }

  if (data.senderId === data.receiverId) {
    throw new Error("You cannot send a proposal to yourself.");
  }

  let query = supabase
    .from("proposals")
    .select("id, status, engagement_type")
    .or(
      `and(sender_id.eq.${data.senderId},receiver_id.eq.${data.receiverId}),` +
        `and(sender_id.eq.${data.receiverId},receiver_id.eq.${data.senderId})`,
    )
    .eq("engagement_type", data.engagementType)
    .in("status", ["pending", "accepted"]);

  if (data.teachSkillId) {
    query = query.eq("teach_skill_id", data.teachSkillId);
  } else {
    query = query.is("teach_skill_id", null);
  }

  if (data.learnSkillId) {
    query = query.eq("learn_skill_id", data.learnSkillId);
  } else {
    query = query.is("learn_skill_id", null);
  }

  const { data: existingProposals, error: existingError } =
    await query.limit(1);

  if (existingError) {
    console.error(existingError);
    throw new Error("Failed to check existing proposals.");
  }

  const existingProposal = existingProposals?.[0];

  if (existingProposal) {
    if (existingProposal.status === "pending") {
      if (existingProposal.engagement_type === "learn") {
        throw new Error("You both already have a pending proposal for this skill.");
      }

      if (existingProposal.engagement_type === "swap") {
        throw new Error(
          "You both already have a pending proposal for these skills.",
        );
      }
    }

    if (existingProposal.status === "accepted") {
      if (existingProposal.engagement_type === "learn") {
        throw new Error(
          "You both already have an accepted proposal for this skill.",
        );
      }

      if (existingProposal.engagement_type === "swap") {
        throw new Error(
          "You both already have an accepted proposal for these skills.",
        );
      }
    }
  }

  const { data: anyVerifiedSkill, error: verifyError } = await supabase
    .from("user_skills")
    .select("id")
    .eq("user_id", data.senderId)
    .eq("type", "teach")
    .eq("verified", true)
    .limit(1)
    .maybeSingle();

  if (verifyError) {
    console.error(verifyError);
    throw new Error("Failed to verify eligibility.");
  }

  if (!anyVerifiedSkill) {
    throw new Error(
      "You need at least one verified skill before sending proposals.",
    );
  }

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      sender_id: data.senderId,
      receiver_id: data.receiverId,
      teach_skill_id: data.teachSkillId || null,
      learn_skill_id: data.learnSkillId || null,
      message: data.message,
      engagement_type: data.engagementType,
      session_format: "one-on-one",
      status: "pending",
      goal: data.goal,
      // expected_number_of_sessions: data.expectedSessions,
      session_duration_minutes: durationMap[data.sessionDurationType] ?? 60,
    })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    if (error.code === "23505") {
      throw new Error("You already have a pending proposal with this user.");
    }
    if (
      error.code === "42501" ||
      error.message?.includes("row-level security")
    ) {
      throw new Error(
        "You need at least one verified skill before sending proposals.",
      );
    }
    throw new Error(error.message);
  }

  if (!proposal) {
    throw new Error("Failed to create proposal.");
  }

  const socket = getSocket();
  if (!socket) return proposal;

  socket.emit("proposal:created", {
    receiverId: data.receiverId,
    proposal,
  });

  return proposal;
}
