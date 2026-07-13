import React from "react";

export const SearchCardSkeleton: React.FC = () => {
  return (
    <div className="relative flex flex-col h-full min-h-95 bg-surface/40 border border-border rounded-2xl p-6 overflow-hidden animate-pulse">
      <div className="flex flex-col justify-center items-center mb-4">
        <div className="w-28 h-28 rounded-full bg-muted/60 border-2 border-background shadow-lg" />

        <div className="py-2 text-center">
          <div className="h-6 w-32 bg-surface/20 rounded-md" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-muted/10" />
          <div className="h-4 w-8 bg-surface/10 rounded-md" />
          <div className="h-4 w-10 bg-surface/10 rounded-md" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-center py-5">
        <div className="h-7 w-16 bg-surface/10 rounded-xl" />
        <div className="h-7 w-20 bg-surface/10 rounded-xl" />
        <div className="h-7 w-14 bg-surface/10 rounded-xl" />
      </div>

      <div className="flex items-center justify-between gap-4 pt-5 border-t border-border/50">
        <div className="flex-1 h-11 bg-surface/10 rounded-lg" />
        <div className="flex-1 h-11 bg-surface/50 rounded-xl" />
      </div>
    </div>
  );
};