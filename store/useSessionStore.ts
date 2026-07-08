import { create } from "zustand";

export interface SessionParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: "host" | "participant";
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  speaking: boolean;
  joinedAt: Date;
  connectionQuality?: number;
}

export interface SessionInfo {
  id: string;
  type: "audio" | "video";
  title?: string;
  hostId: string;
  startedAt?: Date;
  endingAt?: Date;
  duration?: number;
  participantCount: number;
  proposalCount: number;
  skillTrackId: string;
  workspaceId: string;
}

export interface SessionState {
  joinToken: string | null;
  setJoinToken: (token: string | null) => void;
  session?: SessionInfo;
  localParticipant: SessionParticipant | null;
  remoteParticipant: SessionParticipant | null;
  activeSpeaker?: string;
  localParticipantId?: string;
  isConnected: boolean;
  chatUnread: number;
  raisedHands: string[];
  localMedia: {
    micEnabled: boolean;
    cameraEnabled: boolean;
    screenSharing: boolean;
    handRaised: boolean;
  };
}

interface SessionActions {
  setSession: (session: SessionInfo) => void;
  setLocalParticipantId: (id: string) => void; 
  setLocalParticipant: (participant: SessionParticipant | null) => void;
  setRemoteParticipant: (participant: SessionParticipant | null) => void;
  updateLocalParticipant: (data: Partial<SessionParticipant>) => void;
  updateRemoteParticipant: (data: Partial<SessionParticipant>) => void;
  setActiveSpeaker: (id: string) => void;
  setConnected: (state: boolean) => void;
  setMicEnabled: (enabled: boolean) => void;
  setCameraEnabled: (enabled: boolean) => void;
  setScreenSharing: (sharing: boolean) => void;
  setHandRaised: (participantId: string, isRaised: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  joinToken: null,
  session: undefined,
  localParticipant: null,
  remoteParticipant: null,
  activeSpeaker: undefined,
  localParticipantId: undefined,
  isConnected: false,
  chatUnread: 0,
  raisedHands: [],

  localMedia: {
    micEnabled: true,
    cameraEnabled: true,
    screenSharing: false,
    handRaised: false,
  },

  setJoinToken: (token) => set({ joinToken: token}),
  setSession: (session) => set({ session }),

  setLocalParticipantId: (id) => set({ localParticipantId: id }),

  setLocalParticipant: (participant) => set({ localParticipant: participant }),

  setRemoteParticipant: (participant) =>
    set({ remoteParticipant: participant }),

  setActiveSpeaker: (id) => set({ activeSpeaker: id }),

  updateLocalParticipant: (data) =>
    set((state) => ({
      localParticipant: state.localParticipant
        ? { ...state.localParticipant, ...data }
        : null,
    })),

  updateRemoteParticipant: (data) =>
    set((state) => ({
      remoteParticipant: state.remoteParticipant
        ? { ...state.remoteParticipant, ...data }
        : null,
    })),

  setConnected: (state) => set({ isConnected: state }),

  setMicEnabled: (enabled) =>
    set((state) => ({
      localMedia: { ...state.localMedia, micEnabled: enabled },
    })),

  setCameraEnabled: (enabled) =>
    set((state) => ({
      localMedia: { ...state.localMedia, cameraEnabled: enabled },
    })),

  setScreenSharing: (enabled) =>
    set((state) => ({
      localMedia: { ...state.localMedia, screenSharing: enabled },
    })),

  setHandRaised: (participantId, isRaised) =>
    set((state) => {
      const hands = new Set(state.raisedHands);
      if (isRaised) {
        hands.add(participantId);
      } else {
        hands.delete(participantId);
      }
      return { raisedHands: Array.from(hands) };
    }),

  clearSession: () =>
    set({
      session: undefined,
      localParticipant: null,
      remoteParticipant: null,
      activeSpeaker: undefined,
      localParticipantId: undefined,
      isConnected: false,
      chatUnread: 0,
    }),
}));
