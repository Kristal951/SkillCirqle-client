import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ProposalStore } from "@/types/Proposal";
import { getUserProposals } from "@/utils/getUserProposals";

export const getErrorMessage = (err: unknown): string => {
  console.log(err);
  if (err instanceof Error) return err.message;
  return "Something went wrong";
};

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
      }));

      set({ proposals: formatted || [], loading: false });
    } catch (err) {
      console.error("Fetch proposals error:", getErrorMessage(err));
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  createProposal: async (payload) => {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("proposals")
        .insert([payload])
        .select(
          `
          *,
          sender:sender_id (
            id,
            username,
            avatar_url
          ),
          receiver:receiver_id (
            id,
            username,
            avatar_url
          )
        `,
        )
        .single();

      if (error) throw error;

      set((state) => ({
        proposals: [data, ...state.proposals],
      }));

      return data;
    } catch (err) {
      console.error("Create proposal error:", getErrorMessage(err));
      throw err;
    }
  },

  updateProposalStatus: async (proposalId, status) => {
    const supabase = getSupabaseBrowserClient();
    set({ updatingStatus: true });

    try {
      const { data, error } = await supabase
        .from("proposals")
        .update({ status })
        .eq("id", proposalId)
        .select()
        .maybeSingle()
        console.log(data)

      if (error) throw error;

      set((state) => ({
        proposals: state.proposals.map((p) =>
          p.id === proposalId ? { ...p, status } : p,
        ),
      }));

      return data;
    } catch (err) {
      console.error("Update proposal error:", getErrorMessage(err));
      throw err;
    } finally {
      set({ updatingStatus: false });
    }
  },

  getProposalById: (id) => {
    return get().proposals.find((p) => p.id === id);
  },

  clearProposals: () => set({ proposals: [] }),
}));
