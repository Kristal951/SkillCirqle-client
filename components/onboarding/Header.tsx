import { useOnboardingStore } from "@/store/useOnboardingStore";
import Image from "next/image";
import React from "react";

const Header = ({ userOnboarded }: { userOnboarded?: boolean }) => {
  const { step, totalSteps } = useOnboardingStore();
  const safeStep = step ?? 0;
  const safeTotal = totalSteps ?? 0;

  const progress = safeTotal ? (safeStep / safeTotal) * 100 : 0;

  return (
    <div className="w-full bg-background flex justify-between items-center px-6 py-4">
      <div className=" w-max h-max flex items-center gap-1">
        <Image
          src="/SkillCirqle.webp"
          alt="SkillCirqle"
          width={24}
          height={27}
          priority
        />

        <h1 className="text-lg font-bold text-transparent bg-linear-to-r from-primary to-accent bg-clip-text">
          SkillCirqle
        </h1>
      </div>

      {!userOnboarded && safeTotal > 0 && (
        <div className="md:flex hidden items-center gap-4">
          <span className="text-sm text-text-secondary">
            Step <span className="font-bold text-text-primary">{safeStep}</span> of{" "}
            {totalSteps}
          </span>

          <div className="flex items-center gap-2 w-40">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-text-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(safeStep / safeTotal) * 100}%` }}
              />
            </div>

            <span className="text-xs text-text-primary font-semibold">
              {Math.round((safeStep / safeTotal) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
