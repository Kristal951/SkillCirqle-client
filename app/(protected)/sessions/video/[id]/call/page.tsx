"use client";
import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useAuthStore } from "@/store/useAuthStore";
import { CallToolbar, ToolbarButtonConfig } from "@/components/sessions/SessionToolBar";

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

      api.on("audioMuteStatusChanged", ({ muted }: { muted: boolean }) => setMicOn(!muted));
      api.on("videoMuteStatusChanged", ({ muted }: { muted: boolean }) => setCamOn(!muted));
      api.on("screenSharingStatusChanged", ({ on }: { on: boolean }) => setIsSharing(on));
      api.on("readyToClose", () => router.push(`/sessions/video/${id}/preview`));
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
      icon: micOn ? "mic" : "mic_off",
      onClick: () => apiRef.current?.executeCommand("toggleAudio"),
      variant: micOn ? "standard" : "active-primary",
    },
    {
      icon: camOn ? "videocam" : "videocam_off",
      onClick: () => apiRef.current?.executeCommand("toggleVideo"),
      variant: camOn ? "standard" : "active-primary",
    },
    {
      icon: "present_to_all",
      onClick: () => apiRef.current?.executeCommand("toggleShareScreen"),
      variant: isSharing ? "active-primary" : "standard",
    },
    {
      icon: "chat",
      onClick: () => apiRef.current?.executeCommand("toggleChat"),
      variant: "standard",
    },
    {
      icon: "back_hand",
      onClick: () => apiRef.current?.executeCommand("toggleRaiseHand"),
      variant: "standard",
    },
    {
      icon: "call_end",
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
      </div>
    </>
  );
};

export default CallPage;