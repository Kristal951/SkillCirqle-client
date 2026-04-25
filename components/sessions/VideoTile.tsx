import { useEffect, useRef } from "react";

export const VideoTile = ({ participant }: any) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoTrack = participant.tracks?.video?.persistentTrack;

    if (videoTrack) {
      videoTrack.attach(videoRef.current);
    }

    return () => {
      videoTrack?.detach(videoRef.current);
    };
  }, [participant]);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      <div className="absolute bottom-2 left-2 text-sm">
        {participant.user_name || "Guest"}
      </div>
    </div>
  );
};