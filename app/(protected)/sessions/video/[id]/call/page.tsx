"use client";
import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CallToolbar,
  ToolbarButtonConfig,
} from "@/components/sessions/SessionToolBar";
import Whiteboard from "@/components/sessions/WhiteBoard";
import Notes from "@/components/sessions/Notes";
import Videocam from "@material-symbols/svg-400/outlined/video_camera_front.svg"
import VideocamOff from "@material-symbols/svg-400/outlined/video_camera_front_off.svg"
import Mic from "@material-symbols/svg-400/outlined/mic.svg"
import MicOff from "@material-symbols/svg-400/outlined/mic_off.svg"
import Chat from "@material-symbols/svg-400/outlined/chat.svg"
import Draw from "@material-symbols/svg-400/outlined/draw.svg"
import Note from "@material-symbols/svg-400/outlined/notes.svg"
import PresentToAll from "@material-symbols/svg-400/outlined/present_to_all.svg"
import CallEnd from "@material-symbols/svg-400/outlined/call_end.svg"
import BackHand from "@material-symbols/svg-400/outlined/back_hand.svg"

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const CallPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const jitsiRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);

  const roomName = decodeURIComponent(id).replace(/\s+/g, "-");

  const initJitsi = useCallback(() => {
    if (!roomName || !jitsiRef.current || !window.JitsiMeetExternalAPI) return;

    try {
      const api = new window.JitsiMeetExternalAPI("localhost:8443", {
        roomName,
        parentNode: jitsiRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName: user?.name || "Participant",
          email: user?.email || "",
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          p2p: { enabled: false },
          toolbarButtons: [],
          hideConferenceTimer: true,
          hideConferenceSubject: true,
          hideParticipantsStats: true,
          disableSelfView: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          MOBILE_APP_PROMO: false,
          TOOLBAR_BUTTONS: [],
        },
      });

      apiRef.current = api;

      api.on("audioMuteStatusChanged", ({ muted }: { muted: boolean }) =>
        setMicOn(!muted),
      );
      api.on("videoMuteStatusChanged", ({ muted }: { muted: boolean }) =>
        setCamOn(!muted),
      );
      api.on("screenSharingStatusChanged", ({ on }: { on: boolean }) =>
        setIsSharing(on),
      );
      api.on("readyToClose", () =>
        router.push(`/sessions/video/${id}/preview`),
      );
    } catch (err) {
      console.error("Jitsi init error:", err);
    }
  }, [roomName, user, id, router]);

  useEffect(() => {
    if (isJitsiLoaded) {
      initJitsi();
    }
    return () => {
      apiRef.current?.dispose?.();
      apiRef.current = null;
    };
  }, [isJitsiLoaded, initJitsi]);

  const toolbarButtonsConfig: ToolbarButtonConfig[] = [
    {
      icon: micOn ? Mic : MicOff,
      onClick: () => apiRef.current?.executeCommand("toggleAudio"),
      variant: micOn ? "standard" : "active-primary",
    },
    {
      icon: camOn ? Videocam : VideocamOff,
      onClick: () => apiRef.current?.executeCommand("toggleVideo"),
      variant: camOn ? "standard" : "active-primary",
    },
    {
      icon: PresentToAll,
      onClick: () => apiRef.current?.executeCommand("toggleShareScreen"),
      variant: isSharing ? "active-primary" : "standard",
    },
    {
      icon: Chat,
      onClick: () => apiRef.current?.executeCommand("toggleChat"),
      variant: "standard",
    },
    {
      icon: Draw,
      onClick: () => setShowWhiteBoard((prev) => !prev),
      variant: showWhiteBoard ? "active-primary" : "standard",
    },
    {
      icon: Note,
      onClick: () => setShowNotesPanel((prev) => !prev),
      variant: showNotesPanel ? "active-primary" : "standard",
    },
    {
      icon: BackHand,
      onClick: () => apiRef.current?.executeCommand("toggleRaiseHand"),
      variant: "standard",
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
        <CallToolbar buttons={toolbarButtonsConfig} />

        {showWhiteBoard && (
          <div className="w-full h-full border-l absolute top-0 right-0 left-0 border-border">
            <Whiteboard sessionId={id} />
          </div>
        )}

        {showNotesPanel && (
          <div className="w-full h-full border-l absolute top-0 right-0 left-0 border-border">
            <Notes sessionId={id} />
          </div>
        )}
      </div>
    </>
  );
};

export default CallPage;
