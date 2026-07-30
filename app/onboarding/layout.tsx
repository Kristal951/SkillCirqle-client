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
  const { setTotalSteps, step, isLoadingStep, getUserCurrentStepFromDB } =
    useOnboardingStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;

    if (!user?.id) {
      router.replace("/auth/signin");
      return;
    }

    setTotalSteps(2);
    getUserCurrentStepFromDB();
  }, [isHydrated, user?.id]);

  useEffect(() => {
    if (!isHydrated || isLoadingStep || !user?.id) return;

    if (user?.has_onboarded) {
      router.replace("/onboarding/onboardingCompleted");
      return;
    }

    if (typeof step !== "number") return;

    const target = (step === 0 || step === 1) ? "/onboarding" : `/onboarding/step-${step}`;

    if (pathname !== target) {
      const t = setTimeout(() => {
        router.replace(target);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isHydrated, isLoadingStep, user?.id, user?.has_onboarded, step, pathname, router]);

  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (!user?.id) return null;

  return (
    <div className="h-screen w-full flex flex-col">
      <Header userOnboarded={user?.has_onboarded} />
      <MobileStepper/>

      <main className="flex-1 py-4 overflow-y-auto">{children}</main>
    </div>
  );
}