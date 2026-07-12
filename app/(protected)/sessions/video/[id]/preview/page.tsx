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
import Videocam from "@material-symbols/svg-400/outlined/video_camera_front.svg";
import VideocamOff from "@material-symbols/svg-400/outlined/video_camera_front_off.svg";
import Mic from "@material-symbols/svg-400/outlined/mic.svg";
import MicOff from "@material-symbols/svg-400/outlined/mic_off.svg";
import Close from "@material-symbols/svg-400/outlined/close.svg";
import VolumeUp from "@material-symbols/svg-400/outlined/volume_up.svg";
import CustomSelect from "@/components/sessions/preview/CustomSelect";
import { getSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";
import { useWorkspaceResources } from "@/hooks/useWorkspaceResources";

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

const VideoPreview = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initialDeviceSetRef = useRef(false);
  const isJoiningRef = useRef(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const socket = getSocket();

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
  const [startingSession, setStartingSession] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [previewLockedUntil, setPreviewLockedUntil] = useState<Date | null>(
    null,
  );
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  const rawId = params?.id || params?.room_name;
  const sessionId = typeof rawId === "string" ? rawId : null;

  const {
    sessionData,
    loading: sessionLoading,
    markSessionActive,
  } = useSessionData(sessionId, user?.id);
  const { resources, loading: resourcesLoading } = useWorkspaceResources({
    workspaceId: sessionData?.workspaceId || "",
    sessionId: sessionId || undefined,
  });

  const isHost = !!sessionData?.isHost;

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

      streamRef.current = initialStream;
      setStream(initialStream);

      const videoTrack = initialStream.getVideoTracks()[0];
      const audioTrack = initialStream.getAudioTracks()[0];

      await loadDevices();

      initialDeviceSetRef.current = true;
      setSelectedCamera(videoTrack?.getSettings().deviceId || "");
      setSelectedMicrophone(audioTrack?.getSettings().deviceId || "");

      setDevicesReady(true);
      setLoading(false);
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
    if (initialDeviceSetRef.current) {
      initialDeviceSetRef.current = false;
      return;
    }

    let isCurrent = true;

    const startSelectedDevices = async () => {
      try {
        setDevicesReady(false);
        stopAllTracks();

        const buildConstraints = (
          camId: string,
          micId: string,
        ): MediaStreamConstraints => ({
          video: camId ? { deviceId: { exact: camId } } : true,
          audio: micId ? { deviceId: { exact: micId } } : true,
        });

        let newStream: MediaStream;

        try {
          newStream = await navigator.mediaDevices.getUserMedia(
            buildConstraints(selectedCamera, selectedMicrophone),
          );
        } catch (constraintErr) {
          if (
            constraintErr instanceof DOMException &&
            constraintErr.name === "OverconstrainedError"
          ) {
            console.warn(
              "Selected device unavailable, falling back to default:",
              constraintErr,
            );
            newStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });

            const videoTrack = newStream.getVideoTracks()[0];
            const audioTrack = newStream.getAudioTracks()[0];
            setSelectedCamera(videoTrack?.getSettings().deviceId || "");
            setSelectedMicrophone(audioTrack?.getSettings().deviceId || "");
          } else {
            throw constraintErr;
          }
        }

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
    if (!sessionData?.scheduledAt) return;

    const scheduledAt = new Date(sessionData.scheduledAt).getTime();

    const tick = () => {
      const diff = Math.max(0, Math.floor((scheduledAt - Date.now()) / 1000));
      setCountdownSeconds(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [sessionData?.scheduledAt]);

  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleSessionStarted = ({
      sessionId: startedSessionId,
    }: {
      sessionId: string;
    }) => {
      if (startedSessionId !== sessionId) return;
      setSessionActive(true);
    };

    socket.on("session-started", handleSessionStarted);
    return () => {
      socket.off("session-started", handleSessionStarted);
    };
  }, [socket, sessionId]);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/dashboard");
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionData?.status === "ACTIVE") {
      setSessionActive(true);
    }
  }, [sessionData?.status]);

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
    setSelectedSpeaker(speakerId);

    if (videoRef.current && "setSinkId" in videoRef.current) {
      try {
        await (videoRef.current as any).setSinkId(speakerId);
      } catch (err) {
        console.error("Audio target assignment failed:", err);
      }
    }
  };

  const isCountingDown =
    countdownSeconds !== null && countdownSeconds > 0 && !sessionActive;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const canJoin = isHost || sessionActive;

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
      icon: micOn ? Mic : MicOff,
      onClick: () => toggleMic(),
      variant: micOn ? "standard" : "active-primary",
    },
    {
      icon: camOn ? Videocam : VideocamOff,
      onClick: () => toggleCam(),
      variant: camOn ? "standard" : "active-primary",
    },
  ];

  useEffect(() => {
    if (!stream) return;

    const video = videoRef.current;
    if (!video) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    const handleCanPlay = () => video.play().catch(() => {});
    video.addEventListener("loadedmetadata", handleCanPlay);

    return () => video.removeEventListener("loadedmetadata", handleCanPlay);
  }, [stream]);

  useEffect(() => {
    if (!socket || !sessionId) return;

    const joinPreview = () => {
      socket.emit(
        "session:join-lobby",
        { sessionId },
        (response: {
          success: boolean;
          message?: string;
          workspaceId?: string;
          tooEarly?: boolean;
          opensAt?: string;
          requiresRating?: boolean;
          unratedSessionId?: string;
        }) => {
          if (!response.success) {
            if (response.tooEarly && response.opensAt) {
              setPreviewLockedUntil(new Date(response.opensAt));
              return;
            }

            if (response.requiresRating && response.unratedSessionId) {
              showSocketError(response.message);
              router.replace(
                `/sessions/video/${response.unratedSessionId}/ended?reason=completed`,
              );
              return;
            }

            showSocketError(response.message);
            router.replace(`/workspace/${response.workspaceId}`);
            return;
          }

          setPreviewLockedUntil(null);
        },
      );
    };

    if (socket.connected) {
      joinPreview();
    } else {
      socket.once("connect", joinPreview);
    }

    return () => {
      socket.off("connect", joinPreview);
      if (!isJoiningRef.current) {
        socket.emit("session:leave-lobby", { sessionId });
      }
    };
  }, [socket, sessionId, sessionData?.workspaceId]);

  const handleExit = () => {
    stopAllTracks();
    router.back();
  };

  const handleJoin = async () => {
    if (!canJoin) return;
    if (startingSession) return;
    setStartingSession(true);

    try {
      if (isHost) {
        const success = await markSessionActive();
        if (!success) {
          return;
        }
      }

      const refreshed = await new Promise<boolean>((resolve) => {
        socket?.emit(
          "session:join-lobby",
          { sessionId },
          (response: {
            success: boolean;
            message?: string;
            requiresRating?: boolean;
            unratedSessionId?: string;
          }) => {
            if (!response?.success) {
              if (response.requiresRating && response.unratedSessionId) {
                showSocketError(response.message);
                window.location.href = `/sessions/video/${response.unratedSessionId}/ended?reason=completed`;
                resolve(false);
                return;
              }

              showSocketError(response.message);
              resolve(false);
              return;
            }

            resolve(true);
          },
        );
      });

      if (!refreshed) return;

      isJoiningRef.current = true;

      stopAllTracks();
      router.push(
        `/sessions/video/${sessionId}/call?mic=${micOn}&cam=${camOn}&cameraId=${selectedCamera}&microphoneId=${selectedMicrophone}&speakerId=${selectedSpeaker}`,
      );
    } catch (error) {
      console.error("Error occurred while joining the session:", error);
    } finally {
      setStartingSession(false);
    }
  };

  const joinButtonLabel = () => {
    if (!devicesReady) return "Configuring…";
    if (isCountingDown) {
      return `Starts in ${formatCountdown(countdownSeconds!)}`;
    }
    if (startingSession) return isHost ? "Starting…" : "Joining…";
    if (isHost) return "Start Session";
    if (!sessionActive) return "Waiting for host…";
    return "Join Session";
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-4 bg-background">
      <div className="col-span-1 md:col-span-3 flex items-center justify-center relative p-4 md:p-8">
        {!error && (
          <div
            className={`w-full h-full max-h-135 aspect-video relative bg-surface/50 rounded-3xl overflow-hidden shadow-2xl ${
              loading ? "hidden" : ""
            }`}
          >
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

        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Spinner size={30} />
            <p className="text-zinc-400 text-sm animate-pulse">
              Configuring Call settings
            </p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 max-w-sm border border-border rounded-2xl shadow-xl">
            <Videocam className=" text-red-400 text-4xl mb-2" />
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
            <Close className="text-xl" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-8 text-zinc-300 overflow-y-auto min-h-0">
          <div className="space-y-1">
            <span className="text-[10px] tracking-wider uppercase font-bold text-text-secondary block">
              Session Title
            </span>
            <h2 className="text-lg font-bold text-text-primary capitalize wrap-break-word leading-snug">
              {sessionData?.title || "Untitled Session"}
            </h2>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] tracking-wider uppercase font-bold text-text-secondary block">
              Session Duration
            </span>
            <h2 className="text-sm font-bold text-text-primary capitalize wrap-break-word leading-snug">
              {sessionData?.duration || "00:00"} minutes
            </h2>
          </div>

          {resources.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] tracking-wider uppercase font-bold text-text-secondary block">
                Resources for this session
              </span>
              <div className="space-y-2">
                {resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.type === "link" ? r.url! : `#`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-border/50 hover:border-primary/30 transition-colors text-sm text-text-primary truncate"
                  >
                    {r.type === "link"
                      ? r.link_title
                      : r.type === "file"
                        ? r.file_name
                        : r.note_title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="w-full space-y-2">
            <span className="text-[10px] tracking-wider uppercase font-bold text-text-secondary block">
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
                    const isMe = participant.id === user?.id;
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
                              {isMe ? "You" : "Partner"}
                            </p>
                            <p className="text-text-primary text-sm font-semibold truncate leading-tight">
                              {participant.name}
                            </p>
                          </div>
                        </div>

                        {isMe && !participant.isHost && (
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
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
              Device settings
            </h3>

            <div className="space-y-2">
              <CustomSelect
                label="Camera"
                icon={Videocam}
                value={selectedCamera}
                options={cameras}
                fallbackLabel="Camera"
                onChange={setSelectedCamera}
              />
              <CustomSelect
                label="Microphone"
                icon={Mic}
                value={selectedMicrophone}
                options={microphones}
                fallbackLabel="Microphone"
                onChange={setSelectedMicrophone}
              />
              <CustomSelect
                label="Speaker Output"
                icon={VolumeUp}
                value={selectedSpeaker}
                options={speakers}
                fallbackLabel="Speaker"
                onChange={changeSpeaker}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/5 bg-background/50 shrink-0">
          {!isHost && !sessionActive && devicesReady && !isCountingDown && (
            <p className="text-xs text-text-secondary text-center mb-2">
              You'll be able to join as soon as the host starts the session.
            </p>
          )}
          <button
            onClick={handleJoin}
            disabled={
              !devicesReady ||
              loading ||
              !!error ||
              !stream ||
              !canJoin ||
              startingSession ||
              isCountingDown
            }
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:bg-primary text-text-primary py-3.5 rounded-xl font-medium tracking-wide transition shadow-xl active:scale-[0.99]"
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
