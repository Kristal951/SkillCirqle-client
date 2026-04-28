import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { CreateProposalInput } from "@/types/Proposal";
import { getSocket } from "@/lib/socket";

export async function createProposal(data: CreateProposalInput) {
  const supabase = getSupabaseBrowserClient();

  if (!data.senderId || !data.receiverId) {
    throw new Error("Invalid users.");
  }

  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("sender_id", data.senderId)
    .eq("receiver_id", data.receiverId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    throw new Error("You already have a pending proposal with this user.");
  }

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      sender_id: data.senderId,
      receiver_id: data.receiverId,
      teach_skill: data.teachSkill,
      learn_skill: data.learnSkill || null,
      message: data.message,
      engagement_type: data.engagementType,
      session_format: data.sessionFormat,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const socket = getSocket();

  if (socket) {
    try {
      socket.emit("notification:send", {
        userId: data.receiverId,
        type: "proposal_received",
        title: "New Skill Proposal",
        body: `${data.senderName || "Someone"} sent you a proposal`,
        data: {
          proposalId: proposal.id,
        },
      });
    } catch (error) {
      console.log(error, "notif error");
    }
  }

  return proposal;
}
