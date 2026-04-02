"use client";

import Header from "@/components/onboarding/Header";
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
  const router = useRouter();
  const pathname = usePathname();

  const { setTotalSteps, step, getUserCurrentStepFromDB, isLoadingStep } =
    useOnboardingStore();

  useEffect(() => {
    if (!user || user.hasOnboarded) return;

    setTotalSteps(3);
    getUserCurrentStepFromDB();
  }, [user?.uid]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.replace("/auth/signin");
      return;
    }

    if (
      user.hasOnboarded &&
      pathname.startsWith("/onboarding") &&
      pathname !== "/onboarding/onboardingCompleted"
    ) {
      router.replace("/dashboard");
      return;
    }
  }, [user, isHydrated, pathname, router]);

  useEffect(() => {
    if (!isHydrated || isLoadingStep) return;
    if (!user || user.hasOnboarded) return;
    if (typeof step !== "number") return;

    const targetPath = step === 0 ? "/onboarding" : `/onboarding/step-${step}`;

    if (pathname !== targetPath && !user.hasOnboarded) {
      router.replace(targetPath);
    }
  }, [step, pathname, isHydrated, isLoadingStep, user, router]);

  if (!isHydrated || !user || isLoadingStep) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex h-full w-full flex-col">
        <Header />
        {children}
      </div>
    </div>
  );
}
