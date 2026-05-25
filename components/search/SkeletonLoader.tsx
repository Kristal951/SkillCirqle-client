"use client";

import React from "react";

export function ProfileCardSkeleton() {
  return (
    <div className="w-full bg-surface border border-border rounded-2xl p-6 select-none animate-pulse flex flex-col justify-between h-full">
      <div>
        {/* TOP ROW: AVATAR AND RATING PILL PLACEHOLDERS */}
        <div className="flex justify-between items-start mb-6">
          {/* Mentor Avatar Box Placeholder */}
          <div className="w-16 h-16 rounded-[1.25rem] bg-text-secondary/15 shrink-0 border-2 border-transparent" />

          {/* Rating Badge Placeholder */}
          <div className="w-16 h-8 bg-text-secondary/10 rounded-lg" />
        </div>

        {/* METADATA INFO STACK: NAME AND ROLE */}
        <div className="space-y-3">
          {/* Name Strip Block */}
          <div className="h-5 bg-text-secondary/15 rounded-md w-3/4" />
          {/* Role Strip Block */}
          <div className="h-4 bg-text-secondary/10 rounded-md w-1/2" />
        </div>

        {/* SKILLS TAGS WRAPPER ROWS */}
        <div className="flex flex-wrap gap-2 mt-6">
          {/* Generating a localized layout of mock tag fragments */}
          <div className="w-16 h-7 bg-text-secondary/10 border border-border/40 rounded-xl" />
          <div className="w-24 h-7 bg-text-secondary/10 border border-border/40 rounded-xl" />
          <div className="w-20 h-7 bg-text-secondary/10 border border-border/40 rounded-xl" />
        </div>
      </div>

      {/* BOTTOM ACTION SECTION */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/50">
        {/* Metric Counter Context Area */}
        <div className="flex items-center gap-2">
          {/* Exchange Icon Box */}
          <div className="w-5 h-5 bg-text-secondary/10 rounded shrink-0" />
          {/* Exchange Numeric Block */}
          <div className="h-5 bg-text-secondary/15 rounded w-8" />
          {/* Text Phrase */}
          <div className="h-4 bg-text-secondary/10 rounded w-16 hidden sm:block" />
        </div>

        {/* Propose CTA Core Action Element Button Placeholder */}
        <div className="w-28 h-11 bg-text-secondary/15 rounded-xl shrink-0" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 w-full aria-hidden='true'">
      {Array.from({ length: count }).map((_, idx) => (
        <ProfileCardSkeleton key={idx} />
      ))}
    </div>
  );
}
