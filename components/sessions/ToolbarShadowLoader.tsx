export function ToolbarShadowLoader({
  showTimer = true,
}: {
  showTimer?: boolean;
}) {
  const regularButtonCount = 6;

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center pb-8 pointer-events-none">
      {showTimer && (
        <div className="absolute top-5 right-5 z-50">
          <div className="animate-pulse backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-border/40 bg-white/10 w-16 h-7" />
        </div>
      )}

      <div className="relative z-50 h-17 border border-border bg-surface/40 rounded-full backdrop-blur-md flex items-center justify-center gap-2 md:gap-4 px-4 md:px-6 shadow-2xl animate-pulse">
        {Array.from({ length: regularButtonCount }).map((_, i) => (
          <div
            key={`btn-${i}`}
            className="w-12 h-12 rounded-full bg-white/10"
          />
        ))}

        <div className="w-12 md:w-24 h-12 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
