"use client";
import { use, useEffect, useRef, useState } from "react";
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

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const CallPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const hasInitialized = useRef(false);
  const jitsiRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const searchParams = useSearchParams();

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

  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
   const [showToolbar, setShowToolbar] = useState(true);

  const roomId = decodeURIComponent(sessionId).replace(/\s+/g, "-");

  useEffect(() => {
    setMic(micOn);
    setCam(camOn);
  }, [micOn, camOn, setMic, setCam]);

  useEffect(() => {
    if (
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
      api.on("readyToClose", () =>
        router.push(`/sessions/video/${sessionId}/preview`),
      );
      api.on(
        "raiseHandUpdated",
        ({ id, handRaised }: { id: string; handRaised: number | boolean }) =>
          setHandRaised(id, Boolean(handRaised)),
      );
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
        setShowToolbar(false)
      },
      variant: showWhiteBoard ? "active-primary" : "standard",
    },
    {
      icon: Note,
      onClick: () => {
        setShowWhiteBoard(false);
        setShowNotesPanel((p) => !p);
        setShowToolbar(false)
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
      label: "End Session",
      onClick: () => apiRef.current?.executeCommand("hangup"),
      variant: "hangup",
    },
  ];

  return (
    <>
      <Script
        src={`${process.env.NEXT_PUBLIC_JITSI_URL}/external_api.js`}
        strategy="lazyOnload"
        onLoad={() => setIsJitsiLoaded(true)}
      />
      <div className="h-full w-full relative bg-background overflow-hidden">
        <div ref={jitsiRef} className="w-full h-full" />
        <LocalVideoPreview cameraId={selectedCamera} />

        <CallToolbar
          buttons={toolbarButtonsConfig}
          disableScreenTap={showWhiteBoard || showNotesPanel}
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
        />
        {showWhiteBoard && (
          <div className="w-full h-full border-l absolute top-0 right-0 left-0 z-30">
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
          <div className="w-full h-full absolute top-0 right-0 left-0 z-30">
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
      </div>
    </>
  );
};

export default CallPage;
