"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const VideoPreview = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // 🎯 Avatar fallback
  const getAvatarUrl = (name?: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || "User"
    )}&background=4f46e5&color=fff&bold=true&size=256`;

  const roomName =
    typeof params?.room_name === "string"
      ? params.room_name.replace(/\s+/g, "-")
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

  const mentorImage =
    mentorDetails?.image?.trim()
      ? mentorDetails.image
      : getAvatarUrl(mentorDetails?.name);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setLoading(true);

        currentStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: true,
        });

        setStream(currentStream);

        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setLoading(false);

        if (err.name === "NotAllowedError") {
          setError("Camera & microphone permission denied");
        } else {
          setError("No camera or microphone found");
        }
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 🎤 Mic toggle
  const toggleMic = () => {
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setMicOn((prev) => !prev);
  };

  // 📷 Cam toggle
  const toggleCam = () => {
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setCamOn((prev) => !prev);
  };

  // 🚪 EXIT HANDLER (IMPORTANT)
  const handleExit = () => {
    // stop camera/mic
    stream?.getTracks().forEach((track) => track.stop());

    // cleanup video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // go back
    router.back();
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-4 bg-background">

      {/* MAIN */}
      <div className="col-span-1 md:col-span-3 bg-black flex items-center justify-center relative">

        {/* EXIT BUTTON (TOP LEFT) */}
        <button
          onClick={handleExit}
          className="absolute top-4 left-4 z-50 bg-surface/40 flex items-center text-white px-4 py-2 rounded-lg backdrop-blur-md"
        >
          ← Exit
        </button>

        {/* LOADING */}
        {loading && !error && (
          <p className="text-white animate-pulse">Starting camera...</p>
        )}

        {/* ERROR */}
        {error && (
          <div className="text-center p-6">
            <p className="text-red-400 mb-3">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 text-sm hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* VIDEO / AVATAR */}
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
              <div className="w-full h-full flex items-center justify-center bg-black">
                <img
                  src={avatarSrc}
                  alt={user?.name || "User"}
                  className="w-40 h-40 rounded-full border border-white/10 shadow-lg object-cover"
                />
              </div>
            )}

            {/* CONTROLS */}
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

      {/* SIDE */}
      <div className="col-span-1 bg-surface flex flex-col">

        <div className="p-6 text-white font-bold text-lg border-b border-white/5">
          Session Preview
        </div>

        <div className="flex-1 p-6 space-y-5 text-slate-300">

          <h1 className="text-2xl font-bold text-white">{roomName}</h1>

          {/* MENTOR */}
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
              <p className="text-white font-semibold">
                {mentorDetails.name}
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-3 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                stream ? "bg-green-500" : "bg-red-500 animate-pulse"
              }`}
            />
            <p>
              {stream ? "Ready to join" : "Initializing devices..."}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-white/5">
          <button
            disabled={!stream}
            className="w-full bg-primary hover:bg-primary/80 disabled:opacity-50 text-white py-3 rounded-xl font-semibold"
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;