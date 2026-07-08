"use client";

import {
  CallToolbar,
  ToolbarButtonConfig,
} from "@/components/sessions/SessionToolBar";
import Spinner from "@/components/ui/Spinner";
import { useSessionData } from "@/hooks/useSessionDataHook";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Mic from "@material-symbols/svg-400/outlined/mic.svg";
import MicOff from "@material-symbols/svg-400/outlined/mic_off.svg";
import Close from "@material-symbols/svg-400/outlined/close.svg";
import VolumeUp from "@material-symbols/svg-400/outlined/volume_up.svg";
import CustomSelect from "@/components/sessions/preview/CustomSelect";
import { getSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";
import MicLevelMeter from "@/components/sessions/audio/MicLevelMeter";

const AudioPreview = () => {
  const streamRef = useRef<MediaStream | null>(null);
  const isJoiningRef = useRef(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const socket = getSocket();

  const [micOn, setMicOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devicesReady, setDevicesReady] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [startingSession, setStartingSession] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  const rawId = params?.id;
  const sessionId = typeof rawId === "string" ? rawId : null;

  const {
    sessionData,
    loading: sessionLoading,
    markSessionActive,
  } = useSessionData(sessionId, user?.id);

  const isHost = !!sessionData?.isHost;

  const getAvatarUrl = (name?: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=4f46e5&color=fff&bold=true&size=256`;

  const avatarSrc = user?.avatar_url?.trim()
    ? user.avatar_url
    : getAvatarUrl(user?.name);

  const stopAllTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");
      const outputs = devices.filter((d) => d.kind === "audiooutput");

      setMicrophones(mics);
      setSpeakers(outputs);

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
        audio: true,
      });

      streamRef.current = initialStream;
      setStream(initialStream);

      const audioTrack = initialStream.getAudioTracks()[0];

      await loadDevices();
      setSelectedMicrophone(audioTrack?.getSettings().deviceId || "");

      setDevicesReady(true);
      setLoading(false);
    } catch (err: any) {
      console.error("Mic permission sequence failed:", err);
      setLoading(false);
      setDevicesReady(false);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setError("Microphone permission denied");
        setPermissionError("denied");
      } else {
        setError("No microphone hardware detected");
      }
    }
  };

  useEffect(() => {
    initializeMedia();

    const handleDeviceChange = () => loadDevices();
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
      stopAllTracks();
    };
  }, []);

  const initialMicSetRef = useRef(true);

  useEffect(() => {
    if (!selectedMicrophone) return;
    if (initialMicSetRef.current) {
      initialMicSetRef.current = false;
      return;
    }

    let isCurrent = true;

    (async () => {
      try {
        setDevicesReady(false);
        stopAllTracks();

        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedMicrophone } },
        });

        if (!isCurrent) {
          newStream.getTracks().forEach((t) => t.stop());
          return;
        }

        newStream.getAudioTracks().forEach((t) => (t.enabled = micOn));
        streamRef.current = newStream;
        setStream(newStream);
        setDevicesReady(true);
        setLoading(false);
      } catch (err) {
        console.error("Failed to switch microphone:", err);
        if (isCurrent) setError("Failed to initialize microphone");
      }
    })();

    return () => {
      isCurrent = false;
    };
  }, [selectedMicrophone]);

  const toggleMic = () => {
    streamRef.current
      ?.getAudioTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setMicOn((prev) => !prev);
  };

  const toolbarButtonsConfig: ToolbarButtonConfig[] = [
    {
      icon: micOn ? Mic : MicOff,
      onClick: toggleMic,
      variant: micOn ? "standard" : "active-primary",
    },
  ];

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

  const isCountingDown =
    countdownSeconds !== null && countdownSeconds > 0 && !sessionActive;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const canJoin = !isCountingDown && (isHost || sessionActive);

  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleSessionStarted = ({
      sessionId: startedId,
    }: {
      sessionId: string;
    }) => {
      if (startedId !== sessionId) return;
      setSessionActive(true);
    };

    socket.on("session-started", handleSessionStarted);
    return () => {
      socket.off("session-started", handleSessionStarted);
    };
  }, [socket, sessionId]);

  useEffect(() => {
    if (!sessionId) router.replace("/dashboard");
  }, [sessionId]);

  useEffect(() => {
    if (sessionData?.status === "ACTIVE") setSessionActive(true);
  }, [sessionData?.status]);

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
        }) => {
          if (!response.success) {
            toast.error(response.message ?? "Unable to join preview");
            router.replace(`/workspace/${response.workspaceId}`);
          }
        },
      );
    };

    if (socket.connected) joinPreview();
    else socket.once("connect", joinPreview);

    return () => {
      socket.off("connect", joinPreview);
      if (!isJoiningRef.current) {
        socket.emit("session:leave-lobby", { sessionId });
      }
    };
  }, [socket, sessionId]);

  const handleExit = () => {
    stopAllTracks();
    router.back();
  };

  const handleJoin = async () => {
    if (!canJoin || startingSession) return;
    setStartingSession(true);

    try {
      if (isHost) {
        const success = await markSessionActive();
        if (!success) return;
      }

      const refreshed = await new Promise<boolean>((resolve) => {
        socket?.emit(
          "session:join-lobby",
          { sessionId },
          (response: { success: boolean; message?: string }) => {
            if (!response?.success) {
              toast.error(response?.message ?? "Unable to join session");
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
        `/sessions/audio/${sessionId}/call?mic=${micOn}&microphoneId=${selectedMicrophone}&speakerId=${selectedSpeaker}`,
      );
    } catch (error) {
      console.error("Error occurred while joining the session:", error);
    } finally {
      setStartingSession(false);
    }
  };

  const joinButtonLabel = () => {
    if (!devicesReady) return "Configuring…";
    if (isCountingDown)
      return `Starts in ${formatCountdown(countdownSeconds!)}`;
    if (startingSession) return isHost ? "Starting…" : "Joining…";
    if (isHost) return "Start Session";
    if (!sessionActive) return "Waiting for host…";
    return "Join Session";
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-4 bg-background">
      <div className="col-span-1 md:col-span-3 flex items-center justify-center relative p-4 md:p-8">
        {!error && !loading && (
          <div className="w-full max-w-md flex flex-col items-center gap-8">
            <img
              src={avatarSrc}
              alt="You"
              className="w-32 h-32 rounded-full border-2 border-white/10 object-cover shadow-2xl"
            />
            <MicLevelMeter stream={stream} micOn={micOn} />
            <CallToolbar buttons={toolbarButtonsConfig} />
          </div>
        )}

        {loading && !error && (
          <div className="flex flex-col items-center gap-3">
            <Spinner size={30} />
            <p className="text-zinc-400 text-sm animate-pulse">
              Configuring audio settings
            </p>
          </div>
        )}

        {error && (
          <div className="text-center p-6 max-w-sm border border-border rounded-2xl shadow-xl">
            <Mic className="text-red-400 text-4xl mb-2" />
            <p className="text-text-primary font-medium mb-1">{error}</p>
            <p className="text-xs text-text-secondary mb-4">
              {permissionError === "denied"
                ? "Check system settings to allow microphone access."
                : "Ensure your microphone is connected."}
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
                    const participantAvatar =
                      participant.avatar_url || getAvatarUrl(participant.name);

                    return (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between gap-3 p-3.5 bg-surface rounded-xl border border-border/50 hover:border-text-primary/10 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-11 h-11 rounded-xl overflow-hidden relative border border-text-primary/5 bg-text-primary/5 shrink-0">
                            <Image
                              src={participantAvatar}
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
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent py-1 shrink-0">
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
                onChange={setSelectedSpeaker}
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
              startingSession
            }
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

export default AudioPreview;
