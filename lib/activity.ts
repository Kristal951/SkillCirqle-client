import { getSupabaseBrowserClient } from "./supabaseClient";

export async function logActivity(
  workspaceId: string,
  actorId: string | undefined,
  type: string,
  metadata: Record<string, any> = {}
) {
  const supabase = getSupabaseBrowserClient();
  await supabase.from("workspace_activity").insert({
    workspace_id: workspaceId,
    actor_id: actorId,
    type,
    metadata,
  });
}