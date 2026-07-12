import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ProposalStore } from "@/types/Proposal";
import { getUserProposals } from "@/utils/getUserProposals";
import { getSocket, waitForSocket } from "@/lib/socket";
import { emitNotification } from "@/lib/notification/notify";

export const getErrorMessage = (err: unknown): string => {
  console.error(err);
  if (err instanceof Error) return err.message;
  return "Something went wrong";
};

// add near the top of the store file, exported so ProposalsPage/others could reuse it if needed
const formatProposal = (p: any) => ({
  ...p,
  sender: Array.isArray(p.sender) ? p.sender[0] : p.sender,
  receiver: Array.isArray(p.receiver) ? p.receiver[0] : p.receiver,
  workspace: Array.isArray(p.proposal_workspaces)
    ? p.proposal_workspaces[0]
    : p.proposal_workspaces,
});

export const useProposalStore = create<ProposalStore>((set, get) => ({
  proposals: [],
  loading: false,
  error: null,
  updatingStatus: false,

  fetchProposals: async (userId) => {
    set({ loading: true, error: null });

    try {
      const res = await getUserProposals(userId);
      const formatted = (res || []).map((p: any) => ({
        ...p,
        sender: Array.isArray(p.sender) ? p.sender[0] : p.sender,
        receiver: Array.isArray(p.receiver) ? p.receiver[0] : p.receiver,
        workspace: Array.isArray(p.proposal_workspaces)
          ? p.proposal_workspaces[0]
          : p.proposal_workspaces,
      }));

      set({ proposals: formatted || [], loading: false });
    } catch (err) {
      console.error("Fetch proposals error:", getErrorMessage(err));
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  updateProposalStatus: async (
    proposalId,
    status,
    senderName,
    senderImage,
    link,
  ) => {
    const supabase = getSupabaseBrowserClient();
    set({ updatingStatus: true });

    try {
      const { data, error } = await supabase
        .from("proposals")
        .update({ status })
        .eq("id", proposalId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Proposal not found or update was blocked.");

      set((state) => ({
        proposals: state.proposals.map((p) =>
          p.id === proposalId ? { ...p, status } : p,
        ),
      }));

      const socket = getSocket();

      if (socket) {
        socket.emit("proposal:updated", {
          receiverId: data.sender_id,
          proposal: data,
        });
      }

      return data;
    } catch (err) {
      set({ error: getErrorMessage(err) });
      throw err;
    } finally {
      set({ updatingStatus: false });
    }
  },

  getProposalById: (id) => {
    return get().proposals.find((p) => p.id === id);
  },

  listenForProposalUpdates: async () => {
    let socket;
    try {
      socket = await waitForSocket();
      console.log(socket, "socket");
    } catch (err) {
      console.error("listenForProposalUpdates: socket not available", err);
      return () => {};
    }

    const handleCreated = ({ proposal }: { proposal: any }) => {
      console.log("[client] received proposal_created", proposal);
      set((state) => {
        if (state.proposals.some((p) => p.id === proposal.id)) return state;
        return { proposals: [formatProposal(proposal), ...state.proposals] };
      });
    };

    const handleUpdated = ({ proposal }: { proposal: any }) => {
      console.log("[client] received proposal_updated", proposal);
      set((state) => ({
        proposals: state.proposals.map((p) =>
          p.id === proposal.id ? formatProposal(proposal) : p,
        ),
      }));
    };

    socket.off("proposal_created", handleCreated);
    socket.off("proposal_updated", handleUpdated);

    socket.on("proposal_created", handleCreated);
    socket.on("proposal_updated", handleUpdated);

    return () => {
      socket.off("proposal_created", handleCreated);
      socket.off("proposal_updated", handleUpdated);
    };
  },

  clearProposals: () => set({ proposals: [] }),
}));
