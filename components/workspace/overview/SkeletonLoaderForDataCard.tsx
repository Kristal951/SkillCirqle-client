import React from "react";

const SessionCardSkeleton = () => {
  return (
    <div className="bg-surface/50 p-8 rounded-2xl relative overflow-hidden animate-pulse">
      {/* Large background icon placeholder */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <div className="w-16 h-16 rounded-full bg-text-primary/10" />
      </div>

      {/* Label */}
      <div className="h-3 w-24 rounded bg-text-primary/10 mb-4" />

      {/* Value */}
      <div className="h-10 w-20 rounded bg-text-primary/10 mb-3" />

      {/* Optional sub-value */}
      <div className="h-4 w-16 rounded bg-text-primary/10" />

      {/* Bottom accent bar */}
      <div className="mt-6 h-1 w-12 rounded-full bg-text-primary/10" />
    </div>
  );
};

export default SessionCardSkeleton;