"use client";
import { use, useContext, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CallToolbar,
  ToolbarButtonConfig,
} from "@/components/sessions/SessionToolBar";
import Mic from "@material-symbols/svg-400/outlined/mic.svg";
import MicOff from "@material-symbols/svg-400/outlined/mic_off.svg";
import CallEnd from "@material-symbols/svg-400/outlined/call_end.svg";
import { toast } from "@/lib/toast";
import { useSessionData } from "@/hooks/useSessionDataHook";
import { getSocket } from "@/lib/socket";
import EndSessionModal from "@/components/sessions/EndSessionModal";
import { ToolbarShadowLoader } from "@/components/sessions/ToolbarShadowLoader";
import { SocketContext } from "@/providers/SocketContext";
import { useSessionStore } from "@/store/useSessionStore";
import Draw from "@material-symbols/svg-400/outlined/draw.svg";
import Note from "@material-symbols/svg-400/outlined/notes.svg";
import BackHand from "@material-symbols/svg-400/outlined/back_hand.svg";
import Whiteboard from "@/components/sessions/WhiteBoard";
import Notes from "@/components/sessions/Notes";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

type SocketResponse = {
  success: boolean;
  message?: string | { title: string; desc: string };
};

export interface SessionParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: "host" | "participant";
  micEnabled?: boolean;
  cameraEnabled?: boolean;
  screenSharing?: boolean;
  handRaised?: boolean;
  speaking?: boolean;
  joinedAt?: Date;
  connectionQuality?: number;
}

const showSocketError = (message?: SocketResponse["message"]) => {
  if (!message) {
    toast.error("Something went wrong");
    return;
  }
  if (typeof message === "string") {
    toast.error(message);
    return;
  }
  toast.error(message.title, message.desc);
};

const AudioCallPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const jitsiRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const { socketReady } = useContext(SocketContext);
  const endingRef = useRef(false);
  const hasInitialized = useRef(false);
  const user = useAuthStore((s)=> s.user)

  const micOn = searchParams.get("mic") === "true";
  const selectedMicrophone = searchParams.get("microphoneId");
  const selectedSpeaker = searchParams.get("speakerId");

  const { sessionData } = useSessionData(sessionId, user?.id);
  const isHost = sessionData?.host?.id === user?.id;

  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [micEnabled, setMicEnabled] = useState(micOn);
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [dominantSpeakerId, setDominantSpeakerId] = useState<string | null>(
    null,
  );

  const setHandRaised = useSessionStore((s) => s.setHandRaised);
  const setLocalParticipant = useSessionStore((s) => s.setLocalParticipant);
  const setRemoteParticipant = useSessionStore((s) => s.setRemoteParticipant);
  const localParticipant = useSessionStore((s) => s.localParticipant);
  const remoteParticipant = useSessionStore((s) => s.remoteParticipant);
  const localParticipantId = useSessionStore(
    (state) => state.localParticipantId,
  );
  const raisedHands = useSessionStore((state) => state.raisedHands);
  const isLocalHandRaised = localParticipantId
    ? raisedHands.includes(localParticipantId)
    : false;

  const endSession = (reason: string, details?: string) => {
    const socket = getSocket();
    socket?.emit(
      "session:end",
      { sessionId, reason, details },
      (response: any) => {
        if (!response?.success) {
          toast.error("Unable to end session", response?.message);
        }
      },
    );
  };

  const participantJoined = ({
    id,
    displayName,
  }: {
    id: string;
    displayName: string;
  }) => {
    setRemoteParticipant({
      id,
      name: displayName,
      role: "participant",
      micEnabled: true,
      handRaised: false,
      speaking: false,
      joinedAt: new Date(),
    });

    toast.success(`${displayName || "Participant"} joined`, "");
  };

  useEffect(() => {
    if (!socketReady) return;

    const socket = getSocket();
    if (!socket) return;

    let settled = false;

    const runVerifyAndJoin = () => {
      socket.emit(
        "session:verify-lobby-access",
        { sessionId },
        (verifyResponse: { success: boolean; message?: any }) => {
          settled = true;

          if (!verifyResponse.success) {
            showSocketError(verifyResponse.message);
            router.replace(`/sessions/audio/${sessionId}/preview`);
            return;
          }

          socket.emit(
            "session:join",
            { sessionId },
            (joinResponse: { success: boolean; message?: string }) => {
              if (!joinResponse?.success) {
                toast.error(joinResponse?.message ?? "Unable to join session");
                router.replace(`/sessions/audio/${sessionId}/preview`);
                return;
              }
              setAuthorized(true);
            },
          );
        },
      );
    };

    runVerifyAndJoin();

    const timeout = setTimeout(() => {
      if (!settled) {
        toast.error(
          "Connection timed out",
          "Please try rejoining the session.",
        );
        router.replace(`/sessions/audio/${sessionId}/preview`);
      }
    }, 12000);

    return () => clearTimeout(timeout);
  }, [socketReady, sessionId, router]);

  useEffect(() => {
    if (!socketReady) return;

    const socket = getSocket();
    if (!socket || !sessionId) return;

    const finishSession = (
      reason: "completed" | "host-ended",
      incomingSessionId: string,
    ) => {
      if (incomingSessionId !== sessionId) return;
      endingRef.current = true;
      apiRef.current?.executeCommand("hangup");
      router.replace(`/sessions/audio/${sessionId}/ended?reason=${reason}`);
    };

    const handleSessionEnded = ({
      sessionId: endedId,
    }: {
      sessionId: string;
    }) => {
      finishSession("host-ended", endedId);
    };

    const handleSessionCompleted = ({
      sessionId: completedId,
    }: {
      sessionId: string;
    }) => {
      finishSession("completed", completedId);
    };

    socket.on("session-ended", handleSessionEnded);
    socket.on("session-completed", handleSessionCompleted);

    return () => {
      socket.off("session-ended", handleSessionEnded);
      socket.off("session-completed", handleSessionCompleted);
    };
  }, [socketReady, sessionId, router]);

  useEffect(() => {
    if (
      !authorized ||
      !isJitsiLoaded ||
      !window.JitsiMeetExternalAPI ||
      hasInitialized.current
    )
      return;

    hasInitialized.current = true;

    try {
      const roomId = decodeURIComponent(sessionId).replace(/\s+/g, "-");

      const api = new window.JitsiMeetExternalAPI(
        process.env.NEXT_PUBLIC_JITSI_DOMAIN,
        {
          roomName: roomId,
          parentNode: jitsiRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: user?.name || "Participant",
            email: user?.email || "",
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: !micOn,
            startWithVideoMuted: true,
            startAudioOnly: true,
            disableDeepLinking: true,
            p2p: { enabled: false },
            toolbarButtons: [],
            hideConferenceTimer: true,
            hideConferenceSubject: true,
            notifications: [],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
        },
      );

      apiRef.current = api;

      if (selectedMicrophone) api.setAudioInputDevice(selectedMicrophone);
      if (selectedSpeaker) api.setAudioOutputDevice(selectedSpeaker);

      api.on("audioMuteStatusChanged", ({ muted }: { muted: boolean }) =>
        setMicEnabled(!muted),
      );

      api.on(
        "videoConferenceJoined",
        ({ id, displayName }: { id: string; displayName: string }) => {
          setLocalParticipant({
            id,
            name: displayName,
            role: "participant",
            avatar: user?.avatar_url || '',
            micEnabled: true,
            handRaised: false,
            speaking: false,
            joinedAt: new Date(),
          });
        },
      );

      api.on("participantJoined", participantJoined);

      api.on(
        "raiseHandUpdated",
        ({ id, handRaised }: { id: string; handRaised: number | boolean }) =>
          setHandRaised(id, Boolean(handRaised)),
      );

      api.on("participantLeft", ({ id }: { id: string }) => {
        const leavingName = useSessionStore.getState().remoteParticipant?.name;
        setRemoteParticipant(null);
        toast.info(`${leavingName || "Participant"} left`, "");
      });

      api.on("dominantSpeakerChanged", ({ id }: { id: string }) => {
        setDominantSpeakerId(id);
      });

      api.on("readyToClose", () => {
        if (endingRef.current) return;
        router.push(`/sessions/audio/${sessionId}/preview`);
      });
    } catch (err) {
      console.error("Jitsi init error:", err);
      hasInitialized.current = false;
    }

    return () => {
      apiRef.current?.dispose?.();
      apiRef.current = null;
      hasInitialized.current = false;
    };
  }, [
    authorized,
    isJitsiLoaded,
    sessionId,
    micOn,
    selectedMicrophone,
    selectedSpeaker,
    router,
    user,
  ]);

  const toolbarButtonsConfig: ToolbarButtonConfig[] = [
    {
      icon: micEnabled ? Mic : MicOff,
      onClick: () => apiRef.current?.executeCommand("toggleAudio"),
      variant: micEnabled ? "standard" : "active-primary",
    },
    {
      icon: Draw,
      onClick: () => {
        setShowNotesPanel(false);
        setShowWhiteBoard((p) => !p);
        setShowToolbar(false);
      },
      variant: showWhiteBoard ? "active-primary" : "standard",
    },
    {
      icon: Note,
      onClick: () => {
        setShowWhiteBoard(false);
        setShowNotesPanel((p) => !p);
        setShowToolbar(false);
      },
      variant: showNotesPanel ? "active-primary" : "standard",
    },
    {
      icon: BackHand,
      onClick: () => apiRef.current?.executeCommand("toggleRaiseHand"),
      variant: isLocalHandRaised ? "active-primary" : "standard",
    },
    {
      icon: CallEnd,
      label: isHost ? "End Session" : "Leave Session",
      onClick: () => {
        if (isHost) {
          setShowEndSessionModal(true);
        } else {
          endingRef.current = true;
          apiRef.current?.executeCommand("hangup");
          apiRef.current?.dispose();
          apiRef.current = null;

          router.push(`/workspace/${sessionId}/`);
        }
      },
      variant: "hangup",
    },
  ];

  const participants = [localParticipant, remoteParticipant].filter(
    (p): p is SessionParticipant => p !== null,
  );

  console.log(participants, localParticipant, remoteParticipant)

  return (
    <>
      <Script
        src={`${process.env.NEXT_PUBLIC_JITSI_URL}/external_api.js`}
        strategy="afterInteractive"
        onLoad={() => setIsJitsiLoaded(true)}
      />

      <div ref={jitsiRef} className="w-0 h-0 overflow-hidden" />

      <div className="h-full w-full relative bg-background flex flex-col items-center justify-center">
        {!authorized ? (
          <ToolbarShadowLoader showTimer={!!sessionData?.ends_at} />
        ) : (
          <>
            <div className="flex items-center justify-center gap-12 md:gap-20">
              {participants.length === 0 && (
                <p className="text-text-secondary text-sm">
                  Waiting for participant…
                </p>
              )}

              {participants.map((participant) => {
                const isSpeaking = dominantSpeakerId === participant.id;
                const avatarSrc = participant.avatar;

                return (
                  <div
                    key={participant.id}
                    className="flex flex-col items-center gap-3"
                  >
                    <div
                      className={`relative rounded-full transition-all duration-300 ${
                        isSpeaking
                          ? "ring-4 ring-primary ring-offset-4 ring-offset-background"
                          : ""
                      }`}
                    >
                      <img
                        src={avatarSrc}
                        alt={participant.name}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl"
                      />
                    </div>
                    <p className="text-text-primary font-medium text-sm md:text-base">
                      {participant.name}
                    </p>
                  </div>
                );
              })}
            </div>

            <CallToolbar
              buttons={toolbarButtonsConfig}
              endsAt={sessionData?.ends_at}
            />

            {showWhiteBoard && (
              <div className="w-full h-full border-l absolute top-0 right-0 left-0 z-100">
                <button
                  onClick={() => setShowWhiteBoard(false)}
                  aria-label="Close whiteboard"
                  className="absolute bottom-10 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
                >
                  ✕
                </button>
                <Whiteboard sessionId={sessionId} />
              </div>
            )}

            {showNotesPanel && (
              <div className="w-full h-full absolute top-0 right-0 left-0 z-100">
                <button
                  onClick={() => setShowNotesPanel(false)}
                  aria-label="Close notes"
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
                >
                  ✕
                </button>
                <Notes sessionId={sessionId} />
              </div>
            )}
          </>
        )}
      </div>

      <EndSessionModal
        isOpen={showEndSessionModal}
        onClose={() => setShowEndSessionModal(false)}
        onConfirm={(reason, details) => {
          setShowEndSessionModal(false);
          endSession(reason, details);
        }}
      />
    </>
  );
};

export default AudioCallPage;
