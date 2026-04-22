"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useParams } from "next/navigation";

export default function VideoCall() {
  const params = useParams();
  const { user } = useAuthStore();

  const id = typeof params?.id === "string" ? params.id : null;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        Invalid room ID
      </div>
    );
  }

  const roomName = `session-${id}`;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        userInfo={{
          displayName: user?.name || "Guest",
          email: user?.email || "",
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
      />
    </div>
  );
}