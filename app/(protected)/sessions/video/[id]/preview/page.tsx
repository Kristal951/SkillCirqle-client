"use client";

import Spinner from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// --- CUSTOM DROPDOWN WITH ICONS COMPONENT ---
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
      <label className="text-xs text-text-secondary font-medium px-1">{label}</label>

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

// --- MAIN VIDEO PREVIEW COMPONENT ---
const VideoPreview = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const getAvatarUrl = (name?: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=4f46e5&color=fff&bold=true&size=256`;

  const roomParam = params?.id || params?.room_name || "default-session";
  const roomName =
    typeof roomParam === "string"
      ? decodeURIComponent(roomParam).replace(/\s+/g, "-")
      : "default-session";

  const mentorDetails = { name: "Alex Chen", image: "" };
  const avatarSrc = user?.avatar_url?.trim()
    ? user.avatar_url
    : getAvatarUrl(user?.name);
  const mentorImage = mentorDetails?.image?.trim()
    ? mentorDetails.image
    : getAvatarUrl(mentorDetails?.name);

  // Stop tracks safely
  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // 1. Populates device lists and updates selection states dynamically if hardware disappears
  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cams = devices.filter((d) => d.kind === "videoinput");
      const mics = devices.filter((d) => d.kind === "audioinput");
      const outputs = devices.filter((d) => d.kind === "audiooutput");

      setCameras(cams);
      setMicrophones(mics);
      setSpeakers(outputs);

      // If previous device is gone, fallback instantly to the first available profile
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

  // 2. Initial Setup: Requests permissions generic style, then kicks off enumeration
  const initializeMedia = async () => {
    try {
      setLoading(true);
      setError("");
      setPermissionError(null);

      // Simple generic handshake just to clear system permission gates
      const initialStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      initialStream.getTracks().forEach((t) => t.stop()); // Burn initial temporary stream immediately

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

  // 3. REACTIVE STREAM ENGINE: Fires dynamically when hardware choices evolve or change via USB hot-plug
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

        // Keep explicit track mutation flags synced
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

  // Handle hot-plug event loops automatically
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

  // Update hardware speaker routing on the fly
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

  // Toggle Mute Actions
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

  // Synchronize stream with video markup
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
  const handleJoin = () => {
    stopAllTracks();
    router.push(
      `/sessions/video/${roomName}/call?mic=${micOn}&cam=${camOn}&cameraId=${selectedCamera}&microphoneId=${selectedMicrophone}&speakerId=${selectedSpeaker}`,
    );
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
          <div className="w-full h-full max-w-4xl max-h-135 aspect-video relative bg-surface/50 rounded-3xl overflow-hidden shadow-2xl">
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

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-950/80 border border-white/10 backdrop-blur-xl px-4 py-2.5 rounded-full z-10">
              <button
                onClick={toggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"}`}
              >
                <span className="material-symbols-outlined text-xl">
                  {micOn ? "mic" : "mic_off"}
                </span>
              </button>
              <button
                onClick={toggleCam}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${camOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"}`}
              >
                <span className="material-symbols-outlined text-xl">
                  {camOn ? "videocam" : "videocam_off"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-1 bg-surface/50 border-l border-border/50 flex flex-col backdrop-blur-sm">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">
            Session Preview
          </h1>
          <button
            onClick={handleExit}
            className="text-zinc-500 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5 text-zinc-300 overflow-y-auto">
          {/* <div>
            <span className="text-[10px] tracking-wider uppercase text-primary font-bold">
              Active Channel
            </span>
            <h1 className="text-xl font-bold text-white capitalize mt-0.5 break-words">
              {roomName.replace(/-/g, " ")}
            </h1>
          </div> */}

          <div className="space-y-2">
            <h1 className="text-xs uppercase tracking-wide text-text-secondary">Device settings</h1>
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

          {/* <div className="flex items-center gap-3 p-3.5 bg-zinc-900 rounded-2xl border border-white/5">
            <img
              src={mentorImage}
              alt="Host"
              className="w-11 h-11 rounded-xl object-cover border border-white/10"
            />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                Assigned Host
              </p>
              <p className="text-zinc-200 text-sm font-semibold">
                {mentorDetails.name}
              </p>
            </div>
          </div> */}

          {/* <div className="flex items-center gap-2.5 text-xs bg-white/5 py-2.5 px-4 rounded-xl border border-white/5 w-fit">
            <span
              className={`w-2 h-2 rounded-full ${devicesReady ? "bg-emerald-500 shadow-md shadow-emerald-500/40" : "bg-red-500 animate-ping"}`}
            />
            <p className="font-medium text-zinc-400">
              {devicesReady
                ? "Hardware Link Secure"
                : "Awaiting System Feed..."}
            </p>
          </div> */}
        </div>

        <div className="p-6 border-t border-border/5 bg-background/50">
          <button
            onClick={handleJoin}
            disabled={!devicesReady || loading || !!error || !stream}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 text-white py-3.5 rounded-xl font-medium tracking-wide transition shadow-xl"
          >
            {!devicesReady ? "Configuring ..." : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
