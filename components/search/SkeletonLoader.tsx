"use client";

import React from "react";

export function ProfileCardSkeleton() {
  return (
    <div className="w-full bg-surface border border-border/50 rounded-2xl p-5 select-none animate-pulse flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-text-secondary/15 ring-2 ring-background shadow-sm" />

            <div className="absolute -bottom-1.5 -right-1.5 w-10 h-5 bg-background border border-border/40 rounded-lg shadow-sm flex items-center justify-center">
              <div className="w-6 h-2.5 bg-text-secondary/20 rounded-sm" />
            </div>
          </div>

          <div className="space-y-2 min-w-0 flex-1 pt-1">
            <div className="h-4 bg-text-secondary/15 rounded-md w-3/4" />
            <div className="h-4 bg-text-secondary/10 rounded w-1/3" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-5">
          <div className="w-14 h-6 bg-text-secondary/10 border border-border/30 rounded-lg" />
          <div className="w-20 h-6 bg-text-secondary/10 border border-border/30 rounded-lg" />
          <div className="w-16 h-6 bg-text-secondary/10 border border-border/30 rounded-lg" />
          <div className="w-10 h-5 bg-text-secondary/5 rounded-lg self-center" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-text-secondary/10 rounded-lg shrink-0" />

          <div className="flex flex-col gap-1">
            <div className="h-3.5 bg-text-secondary/15 rounded w-6" />
            <div className="h-2 bg-text-secondary/10 rounded w-12" />
          </div>
        </div>

        <div className="w-24 h-8 bg-text-secondary/15 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

interface ProfileGridSkeletonProps {
  count?: number;
}

export default function ProfileGridSkeleton({
  count = 6,
}: ProfileGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 w-full"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <ProfileCardSkeleton key={idx} />
      ))}
    </div>
  );
}
