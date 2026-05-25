"use client";

import React from "react";
import { motion } from "framer-motion";

export function ProposalCardSkeleton() {
  return (
    <div className="p-5 sm:p-6 bg-surface rounded-2xl border border-border/60 shadow-sm w-full select-none animate-pulse">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-6 gap-2">
        <div className="flex gap-3 sm:gap-4 items-center">
          {/* Avatar box placeholder */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-text-secondary/15 shrink-0" />

          <div className="flex flex-col gap-2">
            {/* Name string block */}
            <div className="h-4 sm:h-5 bg-text-secondary/15 rounded-md w-32 sm:w-40" />

            {/* Dynamic layout configuration pills */}
            <div className="flex gap-2">
              <div className="w-20 h-5 bg-text-secondary/10 rounded" />
              <div className="w-20 h-5 bg-text-secondary/10 rounded" />
            </div>
          </div>
        </div>

        {/* Status text capsule label */}
        <div className="w-16 sm:w-20 h-5 bg-text-secondary/10 rounded-full" />
      </div>

      {/* BLOCK CARDS SPLITTER SECTION */}
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Box Block 1: Skill to learn */}
          <div className="w-full flex-1 bg-background/30 border border-border/40 p-4 rounded-xl flex flex-col gap-3">
            <div className="h-3 bg-text-secondary/10 rounded-md w-1/2" />
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-text-secondary/15 rounded-md shrink-0" />
              <div className="h-4 bg-text-secondary/15 rounded-md w-3/5" />
            </div>
          </div>

          {/* Swap divider icon symbol slot */}
          <div className="w-6 h-6 bg-text-secondary/10 rounded-full hidden md:block shrink-0" />

          {/* Box Block 2: Skill to teach */}
          <div className="w-full flex-1 bg-background/30 border border-border/40 p-4 rounded-xl flex flex-col gap-3">
            <div className="h-3 bg-text-secondary/10 rounded-md w-1/2" />
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-text-secondary/15 rounded-md shrink-0" />
              <div className="h-4 bg-text-secondary/15 rounded-md w-3/5" />
            </div>
          </div>
        </div>

        {/* User explicit custom proposal message paragraph lines */}
        <div className="py-4 space-y-2">
          <div className="h-3.5 bg-text-secondary/10 rounded-md w-full" />
          <div className="h-3.5 bg-text-secondary/10 rounded-md w-4/5" />
        </div>
      </div>

      {/* BOTTOM FOOTER SECTION */}
      <div className="flex flex-row items-center justify-between pt-5 border-t border-border/40 gap-4 mt-2">
        {/* Calendar historical context block */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-text-secondary/15 rounded shrink-0" />
          <div className="h-3 bg-text-secondary/10 rounded-md w-24" />
        </div>

        {/* Action button interface placeholders layout spacing */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <div className="h-9 bg-text-secondary/15 rounded-xl w-24 hidden sm:block" />
          <div className="h-9 bg-text-secondary/15 rounded-xl w-full sm:w-28" />
        </div>
      </div>
    </div>
  );
}

// Optional container module layout view to cleanly map lists out
export default function ProposalFeedSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4 w-full"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <ProposalCardSkeleton key={index} />
      ))}
    </motion.div>
  );
}
