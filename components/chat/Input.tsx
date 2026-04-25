"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { MessageType, useChatStore } from "@/store/useChatStore";
import { Send, Smile, Mic, X, Play, Pause, Trash2 } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { uploadFile } from "@/utils/uploadFile";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import Spinner from "../ui/Spinner";

type RecorderState = "idle" | "recording" | "paused" | "preview";

const Input = () => {
  const BAR_COUNT = 50;
  const [message, setMessage] = useState("");
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordTime, setRecordTime] = useState(0);
  const [waveBars, setWaveBars] = useState<number[]>(Array(BAR_COUNT).fill(0));
  const [isPaused, setIsPaused] = useState(false);
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const [uploadingFiles, setUploadingFiles] = useState<
    { file: File; id: string; previewUrl: string }[]
  >([]);
  const [uploadedMedia, setUploadedMedia] = useState<
    { url: string; file: File; id: string }[]
  >([]);

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const [isUploading, setIsUploading] = useState(false);

  const { sendMessage, activeChat } = useChatStore();
  const { user } = useAuthStore();
  const { theme, resolvedTheme } = useTheme();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversationId = activeChat?.id;

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const attachmentModalRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pausedRef = useRef(false);
  const isCancellingRef = useRef(false);
  const waveHistoryRef = useRef<number[][]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getSafeSocket = () => getSocket();
  const userId = user?.id || "";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => setRecordTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node))
        setShowEmojiPicker(false);
      if (
        attachmentModalRef.current &&
        !attachmentModalRef.current.contains(e.target as Node)
      )
        setShowAttachmentModal(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const el = document.querySelector("textarea");
    if (!el) return;

    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [message]);

  useEffect(() => {
    return () => {
      const socket = getSafeSocket();

      if (!socket || !conversationId) return;

      socket.emit("stop_typing", {
        conversationId,
      });
    };
  }, [conversationId]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const setupAudioVisualization = (stream: MediaStream) => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }

    const audioContext = audioContextRef.current;

    const source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128; // 👈 more resolution
    analyserRef.current = analyser;

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateWave = () => {
      analyser.getByteFrequencyData(dataArray);

      const step = Math.floor(bufferLength / BAR_COUNT);

      const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
        const slice = dataArray.slice(i * step, (i + 1) * step);
        const avg = slice.reduce((sum, v) => sum + v, 0) / (slice.length || 1);
        return avg;
      });

      setWaveBars(bars);

      waveHistoryRef.current.push(bars);

      if (waveHistoryRef.current.length > 50) {
        waveHistoryRef.current.shift();
      }

      animationRef.current = requestAnimationFrame(updateWave);
    };
    updateWave();
  };

  const lastWave =
    waveHistoryRef.current[waveHistoryRef.current.length - 1] || waveBars;

  const startRecording = async () => {
    waveHistoryRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(200);

      setupAudioVisualization(stream);

      setIsRecording(true);
      setIsPaused(false);
      setRecorderState("recording");
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const togglePause = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (recorderState === "recording") {
      recorder.pause();
      pausedRef.current = true;
      setRecorderState("paused");
      setIsPaused(true);
    } else if (recorderState === "paused") {
      recorder.resume();
      pausedRef.current = false;
      setRecorderState("recording");
      setIsPaused(false);
    }
  };

  const resumeRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.resume();
    pausedRef.current = false;
    setRecorderState("recording");
    setIsPaused(false);
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = async () => {
      setLoading(true);

      if (isCancellingRef.current) {
        isCancellingRef.current = false;
        return;
      }

      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const url = await uploadFile(file, userId);

      sendMessage({
        conversationId: conversationId || "",
        senderId: user?.id || "",
        senderAvatar: user?.avatar_url || "",
        content: "🎤 Voice message",
        type: "audio",
        metadata: {
          media: [{ url, name: file.name, type: "audio" }],
        },
        name: user?.name || "",
      });

      cleanup();
    };

    recorder.stop();
  };

  const cleanup = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordTime(0);
    setLoading(false);

    // 👇 THIS is what you're missing
    setRecorderState("idle");

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef?.current?.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  };

  const cancelRecording = () => {
    isCancellingRef.current = true;

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    audioChunksRef.current = [];
    setAudioBlob(null);
    setAudioUrl(null);

    cleanup();
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecorderState("idle");
    audioChunksRef.current = [];
  };

  const isTypingRef = useRef(false);

  const handleTyping = () => {
    const socket = getSafeSocket();

    if (!socket || !conversationId || !user?.id) return;

    if (!isTypingRef.current) {
      socket.emit("typing", {
        conversationId,
        userId: user.id,
      });

      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId,
        userId: user.id,
      });

      isTypingRef.current = false;
    }, 1000);
  };

  const generatePreview = () => {
    if (audioChunksRef.current.length === 0) return;

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);

    setAudioBlob(blob);
    setAudioUrl(url);
  };

  const handleFilePreview = async (files: File[]) => {
    setShowAttachmentModal(false);
    setIsUploading(true);

    const prepared = files.map((file) => {
      const id = `${file.name}-${file.size}-${Date.now()}`;

      return {
        file,
        id,
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith("image/") ? "image" : "file",
      };
    });

    setUploadingFiles(prepared);

    const uploads = prepared.map(async ({ file, id, type }) => {
      setUploadProgress((prev) => ({
        ...prev,
        [id]: 0,
      }));

      const url = await uploadFile(file, userId, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          [id]: progress,
        }));
      });

      return {
        id,
        url,
        file,
        type,
        previewUrl: type === "image" ? URL.createObjectURL(file) : "",
      };
    });

    const results = await Promise.all(uploads);

    setUploadedMedia(results);
    setUploadingFiles([]);
    setIsUploading(false);
  };
  const canSend = !isUploading;

  const handleRemoveUploadedMedia = (id: string) => {
    setUploadedMedia((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = async () => {
    setShowAttachmentModal(false);

    if (!conversationId || isUploading) return;

    const images = uploadedMedia.filter((m) =>
      m.file.type.startsWith("image/"),
    );

    const files = uploadedMedia.filter(
      (m) => !m.file.type.startsWith("image/"),
    );

    const hasText = message.trim().length > 0;
    const hasImages = images.length > 0;
    const hasFiles = files.length > 0;

    if (!hasText && !hasImages && !hasFiles) return;

    let type: MessageType = "text";

    if (hasImages && hasFiles) type = "mixed";
    else if (hasImages) type = "image";
    else if (hasFiles) type = "file";

    const imageCount = images.length;
    const fileCount = files.length;

    const content = hasText
      ? message.trim()
      : hasImages && !hasFiles
        ? imageCount === 1
          ? "Sent an image"
          : `Sent ${imageCount} images`
        : hasFiles && !hasImages
          ? fileCount === 1
            ? "Sent a file"
            : `Sent ${fileCount} files`
          : `Sent ${uploadedMedia.length} items`;

    sendMessage({
      conversationId,
      senderId: user?.id || "",
      senderAvatar: user?.avatar_url || "",
      content,
      type,
      metadata: uploadedMedia.length
        ? {
            media: uploadedMedia.map((m) => ({
              url: m.url,
              name: m.file.name,
              type: m.file.type.startsWith("image/") ? "image" : "file",
            })),
          }
        : undefined,
      name: user?.name || "",
    });

    setMessage("");
    setUploadedMedia([]);
    setUploadProgress({});

    const socket = getSafeSocket();
    socket?.emit("stop_typing", {
      conversationId,
      userId: user?.id,
    });
  };

  const handleRemoveFile = (id: string) => {
    setUploadingFiles((prev) => {
      const target = prev.find((f) => f.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return prev.filter((f) => f.id !== id);
    });

    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  return (
    <div className="w-full sticky flex flex-col bottom-0 px-3 py-1 bg-surface/60 backdrop-blur-md justify-center gap-2 border-t border-border">
      {uploadingFiles.length > 0 && (
        <div className="w-full flex gap-2 flex-wrap">
          {uploadingFiles.map(({ file, id, previewUrl }) => {
            const progress = uploadProgress[id] || 0;

            return (
              <div key={id} className="relative w-20 h-20">
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover opacity-60 rounded-lg"
                />

                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {Math.round(progress)}%
                </div>

                <button
                  onClick={() => handleRemoveFile(id)}
                  className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-black/80"
                >
                  <X />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {uploadedMedia.length > 0 && !isUploading && (
        <div className="flex gap-2 flex-wrap">
          {uploadedMedia.map((item) => (
            <div key={item.id} className="relative w-20 h-20">
              {item.file.type.startsWith("image/") ? (
                <img
                  src={item.url}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-surface flex flex-col items-center justify-center text-xs p-2 text-center">
                  📄
                  <span className="mt-1 truncate w-full">{item.file.name}</span>
                </div>
              )}

              <button
                onClick={() => handleRemoveUploadedMedia(item.id)}
                className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-black/80"
              >
                <X />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        {recorderState === "recording" || recorderState === "paused" ? (
          <button
            onClick={deleteRecording}
            className="p-2 text-text-secondary hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        ) : (
          <button
            onClick={() => setShowAttachmentModal(!showAttachmentModal)}
            className={`p-2 rounded-full transition-colors `}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{
                fontVariationSettings: `${showAttachmentModal ? "'FILL' 1" : ""}`,
              }}
            >
              add_circle
            </span>
          </button>
        )}

        <div className="flex-1 bg-muted/50 rounded-2xl px-4 py-2 flex items-center min-h-11">
          {/* 🎧 PAUSED PREVIEW */}
          {recorderState === "paused" ? (
            <div className="flex items-center gap-[2px] flex-1 h-10 overflow-hidden">
              {lastWave.map((v, i) => {
                const height = Math.max(4, (v / 255) * 36);

                return (
                  <div
                    key={i}
                    className="w-[2px] bg-red-500/80 rounded-full"
                    style={{ height }}
                  />
                );
              })}
            </div>
          ) : recorderState === "recording" ? (
            /* 🎤 LIVE RECORDING */
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-1">
                <span className="bg-red-500 w-2 h-2 rounded-full" />
                <span className="text-sm font-mono font-semibold animate-pulse">
                  {formatTime(recordTime)}
                </span>
              </div>

              <div className="w-full flex items-center gap-[2px] h-8">
                {Array.from({ length: BAR_COUNT }).map((_, i) => {
                  const v = waveBars[i] ?? 0;

                  return (
                    <div
                      key={i}
                      className="bg-red-500 rounded-full transition-all"
                      style={{
                        width: "2px", // 👈 consistent thin bars
                        height: `${Math.max(4, (v / 255) * 100)}%`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleSend())
              }
              placeholder="Type a Message..."
              rows={1}
              className="w-full bg-transparent outline-none text-[15px] resize-none py-1 max-h-32"
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          {recorderState === "idle" && (
            <div className="relative ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmojiPicker((prev) => !prev);
                }}
                className="text-muted-foreground hover:bg-text-secondary/30 p-2 rounded-full transition-colors"
              >
                <Smile size={22} />
              </button>
              {showEmojiPicker && (
                <div
                  className="absolute bottom-12 right-0 z-50 shadow-2xl"
                  ref={emojiRef}
                >
                  <EmojiPicker
                    onEmojiClick={(d) => setMessage((p) => p + d.emoji)}
                    theme={
                      resolvedTheme === "dark"
                        ? Theme.DARK
                        : resolvedTheme === "light"
                          ? Theme.LIGHT
                          : Theme.AUTO
                    }
                  />
                </div>
              )}
            </div>
          )}

          {message.trim() || uploadedMedia.length > 0 ? (
            <button
              onClick={handleSend}
              disabled={isUploading}
              className="p-3 bg-primary text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          ) : recorderState === "recording" || recorderState === "paused" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={togglePause}
                className="p-2 text-muted-foreground hover:bg-text-secondary/30 rounded-full transition-colors"
              >
                {recorderState === "paused" ? (
                  <Play size={20} fill="currentColor" />
                ) : (
                  <Pause size={20} fill="currentColor" />
                )}
              </button>
              <button
                onClick={stopRecording}
                disabled={loading}
                className="p-3 bg-primary text-white rounded-xl"
              >
                {loading ? <Spinner size={20} /> : <Send size={20} />}
              </button>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="text-text-primary hover:bg-text-secoacndary/30 p-2 rounded-full transition-colors"
            >
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>

      {showAttachmentModal && (
        <div
          className="w-60 bottom-20 rounded-xl bg-surface absolute"
          ref={attachmentModalRef}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 w-full hover:bg-primary/10 py-4 px-6 transition-colors text-text-primary group"
          >
            <span
              className="material-symbols-outlined text-text-primary group-hover:scale-110 transition-transform"
              style={{
                fontVariationSettings: "'FILL' 1",
              }}
            >
              description
            </span>
            <span className="text-base font-medium">Document</span>
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-3 w-full hover:bg-primary/10 py-4 px-6 transition-colors text-text-primary group"
          >
            <span
              className="material-symbols-outlined text-text-primary group-hover:scale-110 transition-transform"
              style={{
                fontVariationSettings: "'FILL' 1",
              }}
            >
              image
            </span>
            <span className="text-base font-medium">Image</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 w-full hover:bg-primary/10 py-4 px-6 transition-colors text-text-primary group"
          >
            <span
              className="material-symbols-outlined text-text-primary group-hover:scale-110 transition-transform"
              style={{
                fontVariationSettings: "'FILL' 1",
              }}
            >
              folder
            </span>
            <span className="text-base font-medium">File</span>
          </button>
        </div>
      )}

      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
      />

      <input
        type="file"
        accept="image/*"
        hidden
        multiple
        ref={imageInputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          handleFilePreview(files);
        }}
      />

      <input
        type="file"
        hidden
        multiple
        ref={fileInputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          handleFilePreview(files);
        }}
      />
    </div>
  );
};

export default Input;
