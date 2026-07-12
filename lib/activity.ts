import { getSocket } from "./socket";
import { getSupabaseBrowserClient } from "./supabaseClient";

export async function logActivity(
  workspaceId: string,
  actorId: string | undefined,
  type: string,
  metadata: Record<string, any> = {},
) {
  const socket = getSocket();
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("workspace_activity")
    .insert({
      workspace_id: workspaceId,
      actor_id: actorId,
      type,
      metadata,
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    return;
  }

  socket?.emit("workspace:activity-created", {
    workspaceId,
    activityId: data.id,
  });
}
