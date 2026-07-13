import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export function useCanMessage(userId?: string, otherId?: string) {
  const [canMessage, setCanMessage] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!userId || !otherId) {
      setCanMessage(false);
      setChecking(false);
      return;
    }

    let cancelled = false;

    const checkSharedWorkspace = async () => {
      setChecking(true);

      const { data: myWorkspaces, error } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId);

      if (error || !myWorkspaces?.length) {
        if (!cancelled) {
          setCanMessage(false);
          setChecking(false);
        }
        return;
      }

      const workspaceIds = myWorkspaces.map((w) => w.workspace_id);

      const { data: shared, error: sharedError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", otherId)
        .in("workspace_id", workspaceIds)
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setCanMessage(!!shared && !sharedError);
        setChecking(false);
      }
    };

    checkSharedWorkspace();

    return () => {
      cancelled = true;
    };
  }, [userId, otherId, supabase]);

  return { canMessage, checking };
}
