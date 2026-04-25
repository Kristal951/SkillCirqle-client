"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";
import { clearCurrentPlayer, setCurrentPlayer } from "@/utils/audioManager";

const VoicePlayer = ({ src }: { src: string }) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const isDestroyed = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");

  useEffect(() => {
    isDestroyed.current = false;

    if (!waveformRef.current) return;

    // destroy previous safely
    wavesurfer.current?.destroy();

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ccc",
      progressColor: "#ffffff",
      cursorColor: "#4f46e5",
      height: 40,
      barWidth: 2,
      barGap: 2,
    });

    wavesurfer.current = ws;

    ws.load(src);

    ws.on("ready", () => {
      if (isDestroyed.current) return;
      setDuration(formatTime(ws.getDuration()));
    });

    ws.on("audioprocess", () => {
      if (isDestroyed.current) return;
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on("play", () => {
      if (!isDestroyed.current) setIsPlaying(true);
    });

    ws.on("pause", () => {
      if (!isDestroyed.current) setIsPlaying(false);
    });

    ws.on("finish", () => {
      if (!isDestroyed.current) setIsPlaying(false);
      clearCurrentPlayer(ws);
    });

    ws.on("error", (err: any) => {
      if (isDestroyed.current) return;
      if (err?.name === "AbortError") return;
    });

    return () => {
      isDestroyed.current = true;

      try {
        ws.stop();
        ws.unAll?.();
        ws.destroy();
      } catch {}

      clearCurrentPlayer(ws);
    };
  }, [src]);

  const togglePlay = () => {
    const ws = wavesurfer.current;
    if (!ws) return;

    if (ws.isPlaying()) {
      ws.pause();
      clearCurrentPlayer(ws);
    } else {
      setCurrentPlayer(ws);
      ws.play();
    }
  };

  const changeSpeed = () => {
    const newSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(newSpeed);
    wavesurfer.current?.setPlaybackRate(newSpeed);
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl w-full">
      <div className="flex items-center gap-3">
        <button onClick={togglePlay}>
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        <div ref={waveformRef} className="w-40 z-10 cursor-pointer" />

        <button
          onClick={changeSpeed}
          className="text-xs px-2 py-1 bg-black/10 rounded-md"
        >
          {speed}x
        </button>
      </div>

      <div className="flex justify-between text-xs opacity-60">
        <span>{currentTime}</span>
        <span>{duration}</span>
      </div>
    </div>
  );
};

export default VoicePlayer;