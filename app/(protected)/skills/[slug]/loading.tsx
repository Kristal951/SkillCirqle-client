export default function Loading() {
  return (
    <div className="p-6 grid gap-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-40 bg-surface animate-pulse rounded" />
        <div className="h-4 w-72 bg-surface animate-pulse rounded" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-surface animate-pulse rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}