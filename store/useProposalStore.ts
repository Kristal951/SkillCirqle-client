import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ProposalStore } from "@/types/Proposal";
import { getUserProposals, getUserProposalStatusCounts } from "@/utils/getUserProposals";
import { getSocket, waitForSocket } from "@/lib/socket";
import { emitNotification } from "@/lib/notification/notify";

export const getErrorMessage = (err: unknown): string => {
  console.error(err);
  if (err instanceof Error) return err.message;
  return "Something went wrong";
};

const PAGE_SIZE = 10;

const EMPTY_COUNTS = {
  pending: 0,
  accepted: 0,
  declined: 0,
  withdrawn: 0,
  expired: 0,
  negotiating: 0,
  completed: 0,
};

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
  loadingMore: false,
  error: null,
  updatingStatus: false,
  page: 0,
  pageSize: PAGE_SIZE,
  hasMore: true,
  counts: { ...EMPTY_COUNTS },
  countsLoading: false,

  fetchProposals: async (userId) => {
    set({ loading: true, error: null, page: 0 });

    try {
      const res = await getUserProposals(userId, 0, PAGE_SIZE);
      const formatted = (res || []).map(formatProposal);

      set({
        proposals: formatted,
        loading: false,
        hasMore: formatted.length === PAGE_SIZE,
      });
    } catch (err) {
      console.error("Fetch proposals error:", getErrorMessage(err));
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  fetchMoreProposals: async (userId) => {
    const { loading, loadingMore, hasMore, page, pageSize } = get();
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    set({ loadingMore: true, error: null });

    try {
      const res = await getUserProposals(userId, nextPage, pageSize);
      const formatted = (res || []).map(formatProposal);

      set((state) => {
        const existingIds = new Set(state.proposals.map((p) => p.id));
        const deduped = formatted.filter((p: any) => !existingIds.has(p.id));

        return {
          proposals: [...state.proposals, ...deduped],
          page: nextPage,
          loadingMore: false,
          hasMore: formatted.length === pageSize,
        };
      });
    } catch (err) {
      console.error("Fetch more proposals error:", getErrorMessage(err));
      set({ error: getErrorMessage(err), loadingMore: false });
    }
  },

  fetchProposalCounts: async (userId) => {
    set({ countsLoading: true });

    try {
      const rows = await getUserProposalStatusCounts(userId);
      console.log(rows, 'rows')
      const tally = { ...EMPTY_COUNTS };

      for (const row of rows) {
        if (row.status in tally) {
          (tally as any)[row.status] += 1;
        }
      }

      set({ counts: tally, countsLoading: false });
    } catch (err) {
      console.error("Fetch proposal counts error:", getErrorMessage(err));
      set({ countsLoading: false });
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

      set((state) => {
        const prev = state.proposals.find((p) => p.id === proposalId);
        const nextCounts = { ...state.counts };
        if (prev && prev.status in nextCounts) {
          (nextCounts as any)[prev.status] -= 1;
        }
        if (status in nextCounts) {
          (nextCounts as any)[status] += 1;
        }

        return {
          proposals: state.proposals.map((p) =>
            p.id === proposalId ? { ...p, status } : p,
          ),
          counts: nextCounts,
        };
      });

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
    } catch (err) {
      console.error("listenForProposalUpdates: socket not available", err);
      return () => {};
    }

    const handleCreated = ({ proposal }: { proposal: any }) => {
      set((state) => {
        if (state.proposals.some((p) => p.id === proposal.id)) return state;
        const nextCounts = { ...state.counts };
        if (proposal.status in nextCounts) {
          (nextCounts as any)[proposal.status] += 1;
        }
        return {
          proposals: [formatProposal(proposal), ...state.proposals],
          counts: nextCounts,
        };
      });
    };

    const handleUpdated = ({ proposal }: { proposal: any }) => {
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

  clearProposals: () =>
    set({ proposals: [], page: 0, hasMore: true, counts: { ...EMPTY_COUNTS } }),
}));