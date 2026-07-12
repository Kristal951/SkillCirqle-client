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
      expected_number_of_sessions: data.expectedSessions,
      session_duration_minutes: durationMap[data.sessionDurationType] ?? 60,
    })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    if (error.code === "23505") {
      throw new Error("You already have a pending proposal with this user.");
    }
    throw new Error(error.message);
  }

  if (!proposal) {
    throw new Error("Failed to create proposal.");
  }

  const socket = getSocket();
  if(!socket) return
  if (socket) {
    socket.emit("proposal:created", {
      receiverId: data.receiverId,
      proposal,
    });
  }

  // void sendProposalNotification(proposal.id, data);

  return proposal;
}

function sendProposalNotification(
  proposalId: string,
  data: CreateProposalInput,
) {
  const socket = getSocket();
  if (!socket) return;

  try {
    emitNotification({
      userId: data.receiverId,
      type: "proposal_received",
      title: "New Skill Proposal",
      body: `${data.senderName || "Someone"} sent you a proposal.`,
      data: {
        proposalId,
        senderImage: data.senderImage,
        senderName: data.senderName,
        proposalMsg: data.message,
        link: data.link,
      },
    });
  } catch (err) {
    console.error("Notification emit failed:", err);
  }
}
