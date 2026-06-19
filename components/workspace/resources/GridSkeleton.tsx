export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-3 p-4 rounded-2xl bg-surface/50 border border-text-primary/5 animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-text-primary/5" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-3/4 rounded-full bg-text-primary/5" />
            <div className="h-2.5 w-1/2 rounded-full bg-text-primary/5" />
          </div>
        </div>
      ))}
    </div>
  );
}