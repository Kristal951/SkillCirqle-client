"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const VideoPreview = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devicesReady, setDevicesReady] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const getAvatarUrl = (name?: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || "User",
    )}&background=4f46e5&color=fff&bold=true&size=256`;

  const roomName =
    typeof params?.room_name === "string"
      ? decodeURIComponent(params.room_name).replace(/\s+/g, "-")
      : "default-session";

  const mentorDetails = {
    name: "Alex Chen",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvnGj5jWfxIKaJV85PFieaGaWob87y48ITx6KZjoADKi9GrsxJv5SFj5SGbTmhPFBBvcNXbJ2d7pGxAi0-zQOnVy0aGiwj46TjI8bksk3Mh12zX373-xM-O7ThQPKqnlZKlNBlRQfs5FSK3CCN0e9wMskfW0zvS7RVDJYBgeaFLTQcs01mt6sui9zF46WtU3sJQLW3loOWYFr6vmv1rzah45c6Plaglc3x_ehHlhc7TRFQPV49P1zmmK7MtKW6rC7iJ_rovCXa2oQE",
  };

  const avatarSrc =
    user?.avatar_url && user.avatar_url.trim() !== ""
      ? user.avatar_url
      : getAvatarUrl(user?.name);

  const mentorImage = mentorDetails?.image?.trim()
    ? mentorDetails.image
    : getAvatarUrl(mentorDetails?.name);

  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setLoading(true);
      setPermissionError(null);

      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      setStream(currentStream);
      streamRef.current = currentStream;

      if (videoRef.current) {
        videoRef.current.srcObject = currentStream;
      }

      setLoading(false);
      setDevicesReady(true);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      setDevicesReady(false);

      if (err.name === "NotAllowedError") {
        setError("Camera & microphone permission denied");
        setPermissionError("denied");
      } else {
        setError("No camera or microphone found");
      }
    }
  };

  const retryDevices = async () => {
    setError("");
    setLoading(true);
    await startCamera();
  };

  const toggleMic = () => {
    if (!stream) return;

    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) return;

    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setMicOn((prev) => !prev);
  };

  const toggleCam = async () => {
    if (!stream) return;

    const videoTracks = stream.getVideoTracks();
    if (!videoTracks.length) return;

    const track = videoTracks[0];
    const isEnabled = track.enabled;

    if (isEnabled) {
      track.enabled = false;
      setCamOn(false);
    } else {
      track.enabled = true;
      setCamOn(true);

      await new Promise((r) => setTimeout(r, 50));

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.srcObject = stream;

        videoRef.current.play().catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (!videoRef.current || !stream) return;

    const video = videoRef.current;

    video.srcObject = stream;

    const handleCanPlay = () => {
      video.play().catch(() => {});
    };

    video.addEventListener("loadedmetadata", handleCanPlay);

    return () => {
      video.removeEventListener("loadedmetadata", handleCanPlay);
    };
  }, [stream]);

  const handleExit = () => {
    streamRef.current?.getTracks().forEach((t) => {
      t.stop();
      t.enabled = false;
    });

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    router.back();
  };

  useEffect(() => {
    startCamera();

    return () => {
      stream?.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setStream(null);
      setDevicesReady(false);
    };
  }, []);

  const handleJoin = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.push(`/sessions/video/${roomName}/call`);
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-4 bg-background">
      <div className="col-span-1 md:col-span-3 bg-background flex items-center justify-center relative">
        <button
          onClick={handleExit}
          className="absolute top-4 left-4 z-50 bg-surface/40 flex items-center text-white px-4 py-2 rounded-lg backdrop-blur-md"
        >
          ← Exit
        </button>

        {loading && !error && (
          <div className="w-full flex h-full items-center justify-center">
            <p className="text-white animate-pulse">Starting camera...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-6">
            <p className="text-red-400 mb-3">⚠️ {error}</p>

            <button
              onClick={retryDevices}
              className="text-blue-400 text-sm hover:underline"
            >
              Retry devices
            </button>
          </div>
        )}

        {!error && (
          <div className="w-full h-full relative">
            {camOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-background">
                <img
                  src={avatarSrc}
                  alt={user?.name || "User"}
                  className="w-40 h-40 rounded-full border border-white/10 shadow-lg object-cover"
                />
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface/40 backdrop-blur-md px-5 py-3 rounded-full">
              <button
                onClick={toggleMic}
                className={`w-14 h-14 rounded-full ${
                  micOn ? "bg-primary" : "bg-white/10"
                } flex items-center justify-center text-white`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {micOn ? "mic" : "mic_off"}
                </span>
              </button>

              <button
                onClick={toggleCam}
                className={`w-14 h-14 rounded-full ${
                  camOn ? "bg-primary" : "bg-white/10"
                } flex items-center justify-center text-white`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {camOn ? "videocam" : "videocam_off"}
                </span>
              </button>

              <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-2xl">
                  more_vert
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-1 bg-surface flex flex-col">
        <div className="p-6 text-white font-bold text-lg border-b border-white/5">
          Session Preview
        </div>

        <div className="flex-1 p-6 space-y-5 text-slate-300">
          <h1 className="text-2xl font-bold text-white">{roomName}</h1>

          <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img
                src={mentorImage}
                alt={mentorDetails.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-slate-400">Mentor</p>
              <p className="text-white font-semibold">{mentorDetails.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                stream ? "bg-green-500" : "bg-red-500 animate-pulse"
              }`}
            />
            <p>{devicesReady ? "Ready to join" : "Initializing devices..."}</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleJoin}
            disabled={!devicesReady || loading || !!error || !stream}
            className="w-full bg-primary hover:bg-primary/80 disabled:opacity-50 text-white py-3 rounded-xl font-semibold"
          >
            {!devicesReady ? "Checking devices..." : "Join Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
