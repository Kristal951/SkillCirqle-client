"use client";
import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/lib/toast";
import BackHand from "@material-symbols/svg-400/outlined/back_hand-fill.svg";

interface LocalVideoPreviewProps {
  cameraId?: string | null;
}

const LocalVideoPreview = ({ cameraId }: LocalVideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState(false);

  const cameraEnabled = useSessionStore((s) => s.localMedia.cameraEnabled);
  const localParticipantId = useSessionStore((s) => s.localParticipantId);
  const raisedHands = useSessionStore((s) => s.raisedHands);
  const handRaised = localParticipantId ? raisedHands.includes(localParticipantId) : false;
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (!cameraEnabled) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      return;
    }

    let isMounted = true;

    async function startPreview() {
      try {
        let stream: MediaStream;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: cameraId ? { deviceId: { exact: cameraId } } : true,
            audio: false,
          });
        } catch (constraintErr) {
          if (
            constraintErr instanceof DOMException &&
            constraintErr.name === "OverconstrainedError"
          ) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          } else {
            throw constraintErr;
          }
        }

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError(false);
      } catch (err) {
        console.error("Local preview camera error:", err);
        setError(true);
        toast.error(
          "Camera unavailable",
          "We couldn't access your camera for the self-preview.",
        );
      }
    }

    startPreview();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraEnabled, cameraId]);

  const showVideo = cameraEnabled && !error;

  return (
    <div className="absolute bottom-6 right-6 w-32 h-44 sm:w-40 sm:h-52 rounded-xl overflow-hidden bg-surface border border-border shadow-xl z-30">
      {handRaised && (
        <div className="absolute top-4 right-2 bg-accent text-text-primary rounded-full p-2 shadow-lg z-40 animate-bounce">
          <BackHand className="w-5 h-5 text-text-primary" />
        </div>
      )}

      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface/80">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name || "You"}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocalVideoPreview;
