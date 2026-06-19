export function SessionsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="h-3 w-20 rounded-full bg-text-primary/5 mb-3" />
        <div className="bg-surface/50 rounded-2xl border border-text-primary/5 divide-y divide-text-primary/5">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-text-primary/5 shrink-0" />

              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="h-3 w-2/3 rounded-full bg-text-primary/5" />
                <div className="h-2.5 w-1/3 rounded-full bg-text-primary/5" />
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="h-3 w-20 rounded-full bg-text-primary/5" />
                <div className="h-2.5 w-12 rounded-full bg-text-primary/5" />
              </div>

              <div className="h-7 w-16 rounded-lg bg-text-primary/5 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="h-3 w-12 rounded-full bg-text-primary/5 mb-3" />
        <div className="bg-surface/50 rounded-2xl border border-text-primary/5 divide-y divide-text-primary/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-text-primary/5 shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="h-3 rounded-full bg-text-primary/5" style={{ width: `${50 + i * 10}%` }} />
                <div className="h-2.5 w-1/4 rounded-full bg-text-primary/5" />
              </div>
              <div className="h-5 w-16 rounded-full bg-text-primary/5 shrink-0" />
              <div className="h-2.5 w-10 rounded-full bg-text-primary/5 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}