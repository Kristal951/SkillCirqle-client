import { getSocket } from "@/lib/socket";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { SocketContext } from "@/providers/SocketContext";
import { useAuthStore } from "@/store/useAuthStore";
import { SkillVerification } from "@/types/Admin";
import { useCallback, useContext, useEffect, useState } from "react";

type UpdateVerificationStatusParams = {
  verificationId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
};

export function useSkillVerifications({ status }: { status?: string }) {
  const [skillVerifications, setSkillVerifications] = useState<
    SkillVerification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socketReady } = useContext(SocketContext);
  const { user } = useAuthStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socketReady || !socket) return;

    const handleVerificationUpdated = (verification: SkillVerification) => {
      setSkillVerifications((prev) => {
        const exists = prev.some((v) => v.id === verification.id);

        if (exists) {
          if (status && verification.status !== status) {
            return prev.filter((v) => v.id !== verification.id);
          }
          return prev.map((v) => (v.id === verification.id ? verification : v));
        }

        if (status && verification.status !== status) {
          return prev;
        }

        return [verification, ...prev];
      });
    };

    socket.on("admin:verification-updated", handleVerificationUpdated);

    return () => {
      socket.off("admin:verification-updated", handleVerificationUpdated);
    };
  }, [socketReady, status]);

  const fetchSkillVerifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    let query = supabase
      .from("admin_skill_verifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch skill verifications:", error.message);
      setError(error.message);
      setSkillVerifications([]);
    } else {
      setSkillVerifications(data || []);
    }

    setLoading(false);
  }, [status]);

  const updateVerificationStatus = useCallback(
    async ({
      verificationId,
      status,
      rejectionReason,
    }: UpdateVerificationStatusParams) => {
      setError(null);

      try {
        if (!socketReady) {
          throw new Error("Socket is not connected.");
        }

        const socket = getSocket();

        if (!socket) {
          throw new Error("Unable to connect to the server.");
        }

        if (!user) {
          throw new Error("You must be logged in.");
        }

        const updates = {
          verificationId,
          status,
          rejection_reason: status === "REJECTED" ? rejectionReason : null,
        };

        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "admin:review-skill-verification",
            updates,
            (response: { success: boolean; message?: string }) => {
              if (!response.success) {
                reject(
                  new Error(
                    response.message ?? "Failed to update verification.",
                  ),
                );
                return;
              }

              resolve();
            },
          );
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update verification.";

        console.error(err);
        setError(message);
        throw err;
      }
    },
    [socketReady, user],
  );

  useEffect(() => {
    fetchSkillVerifications();
  }, [fetchSkillVerifications]);

  return {
    skillVerifications,
    loading,
    error,
    refetch: fetchSkillVerifications,
    updateVerificationStatus,
  };
}
