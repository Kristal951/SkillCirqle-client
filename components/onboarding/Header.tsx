import { useOnboardingStore } from "@/store/useOnboardingStore";
import Link from "next/link";
import React from "react";

const Header = () => {
  const { step, totalSteps } = useOnboardingStore();
  const safeStep = step ?? 0;
  const safeTotal = totalSteps ?? 0;

  const progress = safeTotal ? (safeStep / safeTotal) * 100 : 0;

  return (
    <div className="w-full bg-background flex justify-between items-center px-6 py-4">
      <h1 className="text-2xl font-semibold text-white">SkillCirqle</h1>

      {safeStep > 0 ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Step <span className="font-bold text-white">{step}</span> of{" "}
            {totalSteps}
          </span>

          <div className="flex items-center gap-2 w-40">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-text-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-xs text-text-primary font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      ) : (
        <Link
          href="/dashboard"
          className="text-sm font-medium text-text-primary/40 hover:text-text-primary"
        >
          Skip for now
        </Link>
      )}
    </div>
  );
};

export default Header;
