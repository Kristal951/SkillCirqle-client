"use client";

import {
  CallToolbar,
  ToolbarButtonConfig,
} from "@/components/sessions/SessionToolBar";
import Spinner from "@/components/ui/Spinner";
import { useSessionData } from "@/hooks/useSessionDataHook";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface CustomSelectProps {
  label: string;
  icon: string;
  value: string;
  options: MediaDeviceInfo[];
  onChange: (id: string) => void;
  fallbackLabel: string;
}

const CustomSelect = ({
  label,
  icon,
  value,
  options,
  onChange,
  fallbackLabel,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.deviceId === value);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-xs text-text-secondary font-medium px-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surface/90 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-text-primary flex items-center justify-between hover:bg-surface transition text-left"
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className="material-symbols-outlined text-text-primary text-lg shrink-0 select-none">
            {icon}
          </span>
          <span className="truncate">
            {selectedOption?.label || fallbackLabel}
          </span>
        </div>
        <span className="material-symbols-outlined text-text-secondary text-sm select-none">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border space-y-2 rounded-xl shadow-2xl max-h-48 overflow-y-auto scrollbar-hide p-1 backdrop-blur-xl">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-secondary italic">
              No devices found
            </div>
          ) : (
            options.map((opt, idx) => (
              <button
                key={opt.deviceId || idx}
                type="button"
                onClick={() => {
                  onChange(opt.deviceId);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2.5 transition ${
                  opt.deviceId === value
                    ? "bg-primary text-text-primary font-medium"
                    : "text-text-secondary hover:bg-text-secondary/20 hover:text-text-primary"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg ${opt.deviceId === value ? "text-white" : "text-zinc-500"}`}
                >
                  {icon}
                </span>
                <span className="truncate">
                  {opt.label || `${fallbackLabel} ${idx + 1}`}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const VideoPreview = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const searchParams = useSearchParams();

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
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const rawId = params?.id || params?.room_name;
  const sessionId = typeof rawId === "string" ? rawId : null;

  const {
    sessionData,
    loading: sessionLoading,
    markSessionActive,
  } = useSessionData(sessionId, user?.id);
  const isStillLoading = sessionLoading || !user;
  const otherParticipant = sessionData?.isHost
    ? sessionData.guest
    : sessionData?.host;
  const currentParticipant = sessionData?.isHost
    ? sessionData.host
    : sessionData?.guest;

  // Host can always start; guests must wait until the host has actually
  // started the session (sessionData.status flips to "ACTIVE").
  const isHost = !!sessionData?.isHost;
  const sessionActive = sessionData?.status === "ACTIVE";
  const canJoin = isHost || sessionActive;

  const getAvatarUrl = (name?: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=4f46e5&color=fff&bold=true&size=256`;

  const avatarSrc = user?.avatar_url?.trim()
    ? user.avatar_url
    : getAvatarUrl(user?.name);

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cams = devices.filter((d) => d.kind === "videoinput");
      const mics = devices.filter((d) => d.kind === "audioinput");
      const outputs = devices.filter((d) => d.kind === "audiooutput");

      setCameras(cams);
      setMicrophones(mics);
      setSpeakers(outputs);

      setSelectedCamera((prev) =>
        prev && cams.some((c) => c.deviceId === prev)
          ? prev
          : cams[0]?.deviceId || "",
      );
      setSelectedMicrophone((prev) =>
        prev && mics.some((m) => m.deviceId === prev)
          ? prev
          : mics[0]?.deviceId || "",
      );
      setSelectedSpeaker((prev) =>
        prev && outputs.some((o) => o.deviceId === prev)
          ? prev
          : outputs[0]?.deviceId || "",
      );
    } catch (err) {
      console.error("Hardware query failed:", err);
    }
  };

  const initializeMedia = async () => {
    try {
      setLoading(true);
      setError("");
      setPermissionError(null);

      const initialStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      initialStream.getTracks().forEach((t) => t.stop());

      await loadDevices();
    } catch (err: any) {
      console.error("Device permission sequence failed:", err);
      setLoading(false);
      setDevicesReady(false);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setError("Camera & microphone permission denied");
        setPermissionError("denied");
      } else {
        setError("No camera or microphone hardware detected");
      }
    }
  };

  useEffect(() => {
    if (!selectedCamera && !selectedMicrophone) return;

    let isCurrent = true;

    const startSelectedDevices = async () => {
      try {
        setDevicesReady(false);
        stopAllTracks();

        const constraints: MediaStreamConstraints = {
          video: selectedCamera
            ? { deviceId: { exact: selectedCamera } }
            : true,
          audio: selectedMicrophone
            ? { deviceId: { exact: selectedMicrophone } }
            : true,
        };

        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        if (!isCurrent) {
          newStream.getTracks().forEach((t) => t.stop());
          return;
        }

        newStream.getAudioTracks().forEach((t) => (t.enabled = micOn));
        newStream.getVideoTracks().forEach((t) => (t.enabled = camOn));

        streamRef.current = newStream;
        setStream(newStream);
        setDevicesReady(true);
        setLoading(false);

        if (
          selectedSpeaker &&
          videoRef.current &&
          "setSinkId" in videoRef.current
        ) {
          await (videoRef.current as any).setSinkId(selectedSpeaker);
        }
      } catch (err) {
        console.error("Failed to mount selected hardware combination:", err);
        if (isCurrent) setError("Failed to initialize active device stream");
      }
    };

    startSelectedDevices();

    return () => {
      isCurrent = false;
    };
  }, [selectedCamera, selectedMicrophone]);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/dashboard");
    }
  }, [sessionId]);

  useEffect(() => {
    initializeMedia();

    const handleDeviceChange = async () => {
      console.log(
        "Hardware modification detected. Auto-remapping active links...",
      );
      await loadDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
      stopAllTracks();
    };
  }, []);

  const changeSpeaker = async (speakerId: string) => {
    if (videoRef.current && "setSinkId" in videoRef.current) {
      try {
        await (videoRef.current as any).setSinkId(speakerId);
        setSelectedSpeaker(speakerId);
      } catch (err) {
        console.error("Audio target assignment failed:", err);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current)
      streamRef.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = !t.enabled));
    setMicOn((prev) => !prev);
  };

  const toggleCam = () => {
    if (streamRef.current)
      streamRef.current
        .getVideoTracks()
        .forEach((t) => (t.enabled = !t.enabled));
    setCamOn((prev) => !prev);
  };

  const toolbarButtonsConfig: ToolbarButtonConfig[] = [
    {
      icon: micOn ? "mic" : "mic_off",
      onClick: () => toggleMic(),
      variant: micOn ? "standard" : "active-primary",
    },
    {
      icon: camOn ? "videocam" : "videocam_off",
      onClick: () => toggleCam(),
      variant: camOn ? "standard" : "active-primary",
    },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    const handleCanPlay = () => video.play().catch(() => {});
    video.addEventListener("loadedmetadata", handleCanPlay);
    return () => video.removeEventListener("loadedmetadata", handleCanPlay);
  }, [stream]);

  const handleExit = () => {
    stopAllTracks();
    router.back();
  };

  const handleJoin = async () => {
    // Guard: a guest should never be able to join before the host has
    // started the session, even if this somehow gets called directly
    // (e.g. a stale click queued before state updated).
    if (!canJoin) return;

    stopAllTracks();
    await markSessionActive();
    router.push(
      `/sessions/video/${sessionId}/call?mic=${micOn}&cam=${camOn}&cameraId=${selectedCamera}&microphoneId=${selectedMicrophone}&speakerId=${selectedSpeaker}`,
    );
  };

  const joinButtonLabel = () => {
    if (!devicesReady) return "Configuring…";
    if (isHost) return "Start Session";
    if (!sessionActive) return "Waiting for host…";
    return "Join Session";
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-4 bg-background">
      <div className="col-span-1 md:col-span-3 flex items-center justify-center relative p-4 md:p-8">
        {loading && !error && (
          <div className="flex flex-col items-center gap-3">
            <Spinner size={30} />
            <p className="text-zinc-400 text-sm animate-pulse">
              Configuring Call settings
            </p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 max-w-sm border border-border rounded-2xl shadow-xl">
            <span className="material-symbols-outlined text-red-400 text-4xl mb-2">
              videocam_off
            </span>
            <p className="text-text-primary font-medium mb-1">{error}</p>
            <p className="text-xs text-text-secondary mb-4">
              {permissionError === "denied"
                ? "Check system settings to allow browser device access."
                : "Ensure devices are secured firmly."}
            </p>
            <button
              onClick={initializeMedia}
              className="px-4 py-2 bg-surface/50 hover:bg-surface text-text-primary rounded-xl text-sm border border-border transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!error && !loading && (
          <div className="w-full h-full max-h-135 aspect-video relative bg-surface/50 rounded-3xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${camOn ? "opacity-100" : "opacity-0 absolute pointer-events-none"}`}
            />
            <div
              className={`absolute inset-0 flex items-center justify-center bg-surface/50 transition-opacity duration-300 ${!camOn ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <img
                src={avatarSrc}
                alt="User"
                className="w-32 h-32 rounded-full border-2 border-white/10 object-cover shadow-2xl"
              />
            </div>

            <CallToolbar buttons={toolbarButtonsConfig} />
          </div>
        )}
      </div>

      <div className="col-span-1 bg-surface/50 border-l border-border/50 overflow-y-auto scrollbar-hide flex flex-col backdrop-blur-sm h-full min-w-0">
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-surface/20">
          <h1 className="text-xl font-semibold text-text-primary">
            Session Preview
          </h1>
          <button
            onClick={handleExit}
            className="text-text-secondary hover:text-white transition p-1 rounded-lg hover:bg-white/5"
            type="button"
          >
            <span className="material-symbols-outlined text-xl block">
              close
            </span>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-8 text-zinc-300 overflow-y-auto min-h-0">
          <div className="space-y-1">
            <span className="text-[10px] tracking-wider uppercase font-bold text-text-secondary/60 block">
              Session Title
            </span>
            <h2 className="text-lg font-bold text-text-primary capitalize wrap-break-word leading-snug">
              {sessionData?.title || "Untitled Session"}
            </h2>
          </div>

          <div className="w-full space-y-2">
            <span className="text-[10px] tracking-wider uppercase font-bold text-text-secondary/60 block">
              Session Participants
            </span>

            {sessionLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3.5 bg-surface rounded-2xl border border-border/50 animate-pulse"
                  >
                    <div className="w-11 h-11 rounded-xl bg-text-primary/10 shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-2.5 w-16 rounded-full bg-text-primary/10" />
                      <div className="h-3.5 w-28 rounded-full bg-text-primary/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              sessionData?.host &&
              sessionData?.guest && (
                <div className="space-y-2">
                  {[sessionData.host, sessionData.guest].map((participant) => {
                    const avatarSrc =
                      participant.avatar_url || getAvatarUrl(participant.name);

                    return (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between gap-3 p-3.5 bg-surface rounded-xl border border-border/50 hover:border-text-primary/10 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-11 h-11 rounded-xl overflow-hidden relative border border-text-primary/5 bg-text-primary/5 shrink-0">
                            <Image
                              src={avatarSrc}
                              alt={participant.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary leading-none mb-1.5">
                              {participant.id === user?.id ? "You" : "Partner"} 
                            </p>
                            <p className="text-text-primary text-sm font-semibold truncate leading-tight">
                              {participant.name}
                            </p>
                          </div>
                        </div>

                        {participant.isCurrentUser && !participant.isHost && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-primary bg-text-primary/5 px-2.5 py-1 rounded-md border border-text-primary/5 shrink-0">
                            You
                          </span>
                        )}

                        {participant.isHost && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent  py-1 shrink-0">
                            Host
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/60 block">
              Device settings
            </h3>

            <div className="space-y-2">
              <CustomSelect
                label="Camera"
                icon="videocam"
                value={selectedCamera}
                options={cameras}
                fallbackLabel="Camera"
                onChange={setSelectedCamera}
              />
              <CustomSelect
                label="Microphone"
                icon="mic"
                value={selectedMicrophone}
                options={microphones}
                fallbackLabel="Microphone"
                onChange={setSelectedMicrophone}
              />
              <CustomSelect
                label="Speaker Output"
                icon="volume_up"
                value={selectedSpeaker}
                options={speakers}
                fallbackLabel="Speaker"
                onChange={changeSpeaker}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/5 bg-background/50 shrink-0">
          {!isHost && !sessionActive && devicesReady && (
            <p className="text-xs text-text-secondary text-center mb-2">
              You'll be able to join as soon as the host starts the session.
            </p>
          )}
          <button
            onClick={handleJoin}
            disabled={!devicesReady || loading || !!error || !stream || !canJoin}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary text-white py-3.5 rounded-xl font-medium tracking-wide transition shadow-xl active:scale-[0.99]"
            type="button"
          >
            {joinButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;