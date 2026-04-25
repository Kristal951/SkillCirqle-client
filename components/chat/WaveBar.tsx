import { useEffect, useRef, useState } from "react";

const Waveform = ({
  waveBars,
  isPaused,
}: {
  waveBars: number[];
  isPaused?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [barCount, setBarCount] = useState(50); // default fallback

  useEffect(() => {
    const updateBarCount = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;

      // better density control (tweakable)
      const BAR_WIDTH = 3;
      const GAP = 1;

      const count = Math.floor(width / (BAR_WIDTH + GAP));
      setBarCount(count);
    };

    updateBarCount();

    const observer = new ResizeObserver(updateBarCount);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-end w-full h-10 px-2 overflow-hidden"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const dataIndex = Math.floor(
          (i / barCount) * waveBars.length
        );

        const rawValue = waveBars[dataIndex] || 0;
        const normalized = rawValue / 255;

        const height = Math.max(
          4,
          Math.pow(normalized, 1.2) * 36
        );

        return (
          <div
            key={i}
            className={`flex-1 mx-[0.5px] rounded-full transition-all duration-150 ease-out ${
              isPaused ? "bg-red-500/40" : "bg-red-500"
            }`}
            style={{
              height: `${height}px`,
              opacity: 0.3 + normalized * 0.7,
              maxWidth: "3px",
            }}
          />
        );
      })}
    </div>
  );
};

export default Waveform;