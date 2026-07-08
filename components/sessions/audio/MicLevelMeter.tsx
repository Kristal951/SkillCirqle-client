"use client";
import { useEffect, useRef, useState } from "react";

interface MicLevelMeterProps {
  stream: MediaStream | null;
  micOn: boolean;
}

const BAR_COUNT = 24;

export default function MicLevelMeter({ stream, micOn }: MicLevelMeterProps) {
  const [levels, setLevels] = useState<number[]>(Array(BAR_COUNT).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);

      const chunkSize = Math.floor(dataArray.length / BAR_COUNT);
      const nextLevels: number[] = [];

      for (let i = 0; i < BAR_COUNT; i++) {
        const chunk = dataArray.slice(i * chunkSize, (i + 1) * chunkSize);
        const avg = chunk.reduce((sum, v) => sum + v, 0) / chunk.length;
        nextLevels.push(Math.min(1, avg / 140));
      }

      setLevels(nextLevels);
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      source.disconnect();
      analyser.disconnect();
      audioContext.close().catch(() => {});
    };
  }, [stream]);

  return (
    <div className="flex items-end justify-center gap-1 h-24">
      {levels.map((level, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-75 ${
            micOn ? "bg-primary" : "bg-text-secondary/20"
          }`}
          style={{
            height: micOn ? `${8 + level * 88}%` : "8%",
          }}
        />
      ))}
    </div>
  );
}
