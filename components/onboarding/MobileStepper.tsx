import { useOnboardingStore } from "@/store/useOnboardingStore";
import React from "react";

const MobileStepper = () => {
  const { totalSteps, step } = useOnboardingStore();
  
  return (
    <div className="w-full lg:hidden flex justify-between items-center gap-2 px-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
       const isActive = index + 1 === step;

        return (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              isActive ? " bg-text-primary" : " bg-text-secondary/30"
            }`}
          />
        );
      })}
    </div>
  );
};

export default MobileStepper;
