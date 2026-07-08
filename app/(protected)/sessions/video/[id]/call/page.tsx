"use client";
import { use, useContext, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CallToolbar,
  ToolbarButtonConfig,
} from "@/components/sessions/SessionToolBar";
import Whiteboard from "@/components/sessions/WhiteBoard";
import Notes from "@/components/sessions/Notes";
import Videocam from "@material-symbols/svg-400/outlined/video_camera_front.svg";
import VideocamOff from "@material-symbols/svg-400/outlined/video_camera_front_off.svg";
import Mic from "@material-symbols/svg-400/outlined/mic.svg";
import MicOff from "@material-symbols/svg-400/outlined/mic_off.svg";
import Chat from "@material-symbols/svg-400/outlined/chat.svg";
import Draw from "@material-symbols/svg-400/outlined/draw.svg";
import Note from "@material-symbols/svg-400/outlined/notes.svg";
import PresentToAll from "@material-symbols/svg-400/outlined/present_to_all.svg";
import CallEnd from "@material-symbols/svg-400/outlined/call_end.svg";
import BackHand from "@material-symbols/svg-400/outlined/back_hand.svg";
import { useSessionStore } from "@/store/useSessionStore";
import LocalVideoPreview from "@/components/sessions/LocalVideoPreview";
import { toast } from "@/lib/toast";
import { useSessionData } from "@/hooks/useSessionDataHook";
import { getSocket, waitForSocket } from "@/lib/socket";
import EndSessionModal from "@/components/sessions/EndSessionModal";
import { ToolbarShadowLoader } from "@/components/sessions/ToolbarShadowLoader";
import { SocketContext } from "@/providers/SocketContext";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

type SocketResponse = {
  success: boolean;
  message?:
    | string
    | {
        title: string;
        desc: string;
      };
};

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

const CallPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const hasInitialized = useRef(false);
  const jitsiRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const { socketReady } = useContext(SocketContext);

  const micOn = searchParams.get("mic") === "true";
  const camOn = searchParams.get("cam") === "true";
  const selectedCamera = searchParams.get("cameraId");
  const selectedMicrophone = searchParams.get("microphoneId");
  const selectedSpeaker = searchParams.get("speakerId");

  const {
    setMicEnabled: setMic,
    setCameraEnabled: setCam,
    setScreenSharing,
    setHandRaised,
    setLocalParticipantId,
    setRemoteParticipant,
  } = useSessionStore();
  const { micEnabled, cameraEnabled, screenSharing } = useSessionStore(
    (state) => state.localMedia,
  );
  const localParticipantId = useSessionStore(
    (state) => state.localParticipantId,
  );
  const raisedHands = useSessionStore((state) => state.raisedHands);
  const isLocalHandRaised = localParticipantId
    ? raisedHands.includes(localParticipantId)
    : false;
  const user = useAuthStore((state) => state.user);

  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const roomId = decodeURIComponent(sessionId).replace(/\s+/g, "-");
  const { sessionData } = useSessionData(sessionId, user?.id);
  const isHost = sessionData?.host?.id === user?.id;
  const endingRef = useRef(false);

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

  useEffect(() => {
    setMic(micOn);
    setCam(camOn);
  }, [micOn, camOn, setMic, setCam]);

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
            router.replace(`/sessions/video/${sessionId}/preview`);
            return;
          }

          socket.emit(
            "session:join",
            { sessionId },
            (joinResponse: { success: boolean; message?: string }) => {
              if (!joinResponse?.success) {
                toast.error(joinResponse?.message ?? "Unable to join session");
                router.replace(`/sessions/video/${sessionId}/preview`);
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
        router.replace(`/sessions/video/${sessionId}/preview`);
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

      router.replace(`/sessions/video/${sessionId}/ended?reason=${reason}`);
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
      !roomId ||
      !window.JitsiMeetExternalAPI ||
      hasInitialized.current
    )
      return;

    hasInitialized.current = true;

    try {
      const api = new window.JitsiMeetExternalAPI(
        process.env.NEXT_PUBLIC_JITSI_DOMAIN,
        {
          roomName: roomId,
          parentNode: jitsiRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: useAuthStore.getState().user?.name || "Participant",
            email: useAuthStore.getState().user?.email || "",
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: !micOn,
            startWithVideoMuted: !camOn,
            disableDeepLinking: true,
            p2p: { enabled: false },
            toolbarButtons: [],
            hideConferenceTimer: true,
            hideConferenceSubject: true,
            hideParticipantsStats: true,
            disableSelfView: false,
            filmstrip: { disabled: true },
            notifications: [],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false,
            TOOLBAR_BUTTONS: ["desktop"],
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
        },
      );

      apiRef.current = api;
      const iframe = jitsiRef.current?.querySelector("iframe");
      if (iframe) {
        iframe.setAttribute(
          "allow",
          "camera; microphone; display-capture; autoplay; clipboard-write;",
        );
      }

      if (selectedCamera) api.setVideoInputDevice(selectedCamera);
      if (selectedMicrophone) api.setAudioInputDevice(selectedMicrophone);
      if (selectedSpeaker) api.setAudioOutputDevice(selectedSpeaker);

      api.on("audioMuteStatusChanged", ({ muted }: { muted: boolean }) =>
        setMic(!muted),
      );
      api.on("videoMuteStatusChanged", ({ muted }: { muted: boolean }) =>
        setCam(!muted),
      );

      api.on(
        "screenSharingStatusChanged",
        ({ on, error }: { on: boolean; error?: string }) => {
          if (error) {
            console.error("Jitsi screen share error:", error);
            setScreenSharing(false);
            toast.error(
              "Screen share error",
              "Failed to share screen. Please check permissions.",
            );
          } else {
            setScreenSharing(on);
          }
        },
      );

      api.on("videoConferenceJoined", ({ id }: { id: string }) =>
        setLocalParticipantId(id),
      );
      api.on("readyToClose", () => {
        if (endingRef.current) return;
        router.push(`/sessions/video/${sessionId}/preview`);
      });
      api.on(
        "raiseHandUpdated",
        ({ id, handRaised }: { id: string; handRaised: number | boolean }) =>
          setHandRaised(id, Boolean(handRaised)),
      );
      api.on(
        "participantJoined",
        ({ id, displayName }: { id: string; displayName: string }) => {
          setRemoteParticipant({
            id,
            name: displayName,
            role: "participant",
            micEnabled: true,
            cameraEnabled: true,
            screenSharing: false,
            handRaised: false,
            speaking: false,
            joinedAt: new Date(),
          });
          api.executeCommand("pinParticipant", id);
          toast.success(`${displayName || "Participant"} joined`, "");
        },
      );

      api.on("participantLeft", ({ id }: { id: string }) => {
        const leavingName = useSessionStore.getState().remoteParticipant?.name;
        setRemoteParticipant(null);
        toast.info(`${leavingName || "Participant"} left`, "");
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
    isJitsiLoaded,
    roomId,
    micOn,
    camOn,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    sessionId,
    router,
    setMic,
    setCam,
    setScreenSharing,
    setHandRaised,
    setLocalParticipantId,
    authorized
  ]);

  const toolbarButtonsConfig: ToolbarButtonConfig[] = [
    {
      icon: micEnabled ? Mic : MicOff,
      onClick: () => apiRef.current?.executeCommand("toggleAudio"),
      variant: micEnabled ? "standard" : "active-primary",
    },
    {
      icon: cameraEnabled ? Videocam : VideocamOff,
      onClick: () => apiRef.current?.executeCommand("toggleVideo"),
      variant: cameraEnabled ? "standard" : "active-primary",
    },
    {
      icon: PresentToAll,
      // onClick: () => {
      //   try {
      //     apiRef.current?.executeCommand("toggleShareScreen");
      //   } catch (err) {
      //     toast.error(
      //       "Screen share failed",
      //       "Please ensure your browser has permission.",
      //     );
      //   }
      // },
      onClick: () => apiRef.current?.executeCommand("toggleShareScreen"),

      variant: screenSharing ? "active-primary" : "standard",
    },
    // {
    //   icon: Chat,
    //   onClick: () => apiRef.current?.executeCommand("toggleChat"),
    //   variant: "standard",
    // },
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
          router.push(`/workspace/${sessionId}/`);
        }
      },
      variant: "hangup",
    },
  ];

  return (
    <>
      <Script
        src={`${process.env.NEXT_PUBLIC_JITSI_URL}/external_api.js`}
        strategy="afterInteractive"
         onLoad={() => {
    console.log("✅ Jitsi external_api.js onLoad fired");
    setIsJitsiLoaded(true);
  }}
      />
      <div className="h-full w-full relative bg-background overflow-hidden">
        <div ref={jitsiRef} className="w-full h-full" />

        {!authorized ? (
          <ToolbarShadowLoader showTimer={!!sessionData?.ends_at} />
        ) : (
          <>
            <LocalVideoPreview cameraId={selectedCamera} />

            <CallToolbar
              buttons={toolbarButtonsConfig}
              disableScreenTap={showWhiteBoard || showNotesPanel}
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
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

export default CallPage;
