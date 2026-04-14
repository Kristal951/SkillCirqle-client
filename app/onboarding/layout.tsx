"use client";

import Header from "@/components/onboarding/Header";
import MobileStepper from "@/components/onboarding/MobileStepper";
import Spinner from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrated } = useAuthStore();
  const { 
    setTotalSteps, 
    step, 
    getUserCurrentStepFromDB, 
    isLoadingStep 
  } = useOnboardingStore();
  
  const router = useRouter();
  const pathname = usePathname();

  // 1. Handle Authentication and Initial Fetching
  useEffect(() => {
    if (!isHydrated) return;

    if (!user?.id) {
      router.replace("/auth/signin");
      return;
    }

    // Initialize onboarding state
    setTotalSteps(3);
    getUserCurrentStepFromDB();
  }, [isHydrated, user?.id]);

  // 2. Handle Route Guarding / Redirects
  useEffect(() => {
    if (!isHydrated || isLoadingStep || !user?.id || user?.has_onboarded) return;
    if (typeof step !== "number") return;

    const target = step === 0 ? "/onboarding" : `/onboarding/step-${step}`;

    // Only redirect if we aren't already there
    if (pathname !== target) {
      const t = setTimeout(() => {
        router.replace(target);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [step, pathname, isHydrated, isLoadingStep, user?.id, user?.has_onboarded]);

  // 3. Loading State
  if (!isHydrated || isLoadingStep) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  // Safety check to prevent layout flash before redirect
  if (!user?.id) return null;

  return (
    <div className="h-screen w-full flex flex-col">
      <Header />
      <div className="pt-22.5 md:pt-0 w-full">
        <MobileStepper />
      </div>
      <main className="flex-1 py-4 overflow-y-auto">{children}</main>
    </div>
  );
}