export function ListSkeleton() {
  return (
    <div className="bg-surface/50 rounded-2xl border border-text-primary/5 divide-y divide-text-primary/5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-3.5 animate-pulse"
        >
          <div className="w-9 h-9 rounded-xl bg-text-primary/5 shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 w-1/2 rounded-full bg-text-primary/5" />
            <div className="h-2.5 w-1/4 rounded-full bg-text-primary/5" />
          </div>
        </div>
      ))}
    </div>
  );
}