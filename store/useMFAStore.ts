"use client";

import { create } from "zustand";
import { Factor } from "@supabase/supabase-js";

interface MFAState {
  userId: string | null;
  email: string | null;
  factor: Factor | null;
  challengeId: string | null;
  requiresMFA: boolean;

  setFactor: (factor: Factor | null) => void;
  setUserId: (id: string | null) => void;
  setUserEmail: (email: string | null) => void;
  setChallengeId: (challengeId: string | null) => void;
  setRequiresMFA: (requires: boolean) => void;

  reset: () => void;
}

export const useMFAStore = create<MFAState>((set) => ({
  userId: null,
  email: null,
  factor: null,
  challengeId: null,
  requiresMFA: false,

  setFactor: (factor) =>
    set({
      factor,
    }),

  setUserId: (userId) =>
    set({
      userId,
    }),

  setUserEmail: (email) =>
    set({
      email,
    }),

  setChallengeId: (challengeId) =>
    set({
      challengeId,
    }),

  setRequiresMFA: (requiresMFA) =>
    set({
      requiresMFA,
    }),

  reset: () =>
    set({
      userId: null,
      email: null,
      factor: null,
      challengeId: null,
      requiresMFA: false,
    }),
}));
