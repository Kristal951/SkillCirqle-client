import React from "react";

const SkillCardSkeleton = () => {
  return (
    <div className="border border-border/10 dark:border-transparent min-w-75 max-w-85 lg:w-100 shrink-0 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm bg-surface/40 animate-pulse">
      <div className="h-52 w-full bg-surface/30" />

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="h-6 w-2/3 bg-surface/40 rounded-md" />

        <div className="space-y-2 mt-1">
          <div className="h-4 w-full bg-surface/25 rounded-md" />
          <div className="h-4 w-5/6 bg-surface/25 rounded-md" />
          <div className="h-4 w-4/5 bg-surface/25 rounded-md" />
        </div>
      </div>

      <div className="w-full flex items-center justify-between p-4 pt-0">
        <div className="flex items-center -space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-surface/30" />
          <div className="w-8 h-8 rounded-full bg-surface/30" />
          <div className="w-8 h-8 rounded-full bg-surface/30" />
        </div>

        <div className="h-9 w-28 bg-primary/10 rounded-lg" />
      </div>
    </div>
  );
};

export default SkillCardSkeleton;
