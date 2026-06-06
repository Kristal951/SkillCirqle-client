"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight, Coins, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Confetti from "react-confetti";
import { toast } from "@/lib/toast";
import { useTokenStore } from "@/store/useTokenStore";
import { useRouter } from "next/navigation";
const OnboardingCompleted = () => {
  const { user } = useAuthStore();
  const { awardUserOnboardingTokens, loading } = useTokenStore();

  const [displayTokens, setDisplayTokens] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const targetTokens = 5;
  const hasRun = React.useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!targetTokens) return;

    let counter: NodeJS.Timeout;

    const awardAndAnimate = async () => {
      try {
        const res = await awardUserOnboardingTokens();

        if (res?.code === "ALREADY_REWARDED") {
          toast.info("Already Awarded", "You've been awarded earlier.");
          return;
        }

        if (res?.tokens !== undefined) {
          toast.success("+5 tokens awarded!");

          let start = 0;
          const end = res.tokens ?? targetTokens;
          const duration = 1000;
          const stepTime = 20;

          const increment = end / (duration / stepTime);

          counter = setInterval(() => {
            start += increment;

            if (start >= end) {
              start = end;
              clearInterval(counter);
            }

            setDisplayTokens(parseFloat(start.toFixed(2)));
          }, stepTime);
        }
      } catch (error) {
        console.log(error, "award token error");
        toast.error("Something went wrong");
      }
    };

    if (!hasRun.current) {
      hasRun.current = true;
      awardAndAnimate();
    }

    return () => {
      if (counter) clearInterval(counter);
    };
  }, [targetTokens]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToPage = (page: string) => {
    router.push(`/${page}`);
  };

  return (
    <div className="relative h-full w-full bg-background text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          numberOfPieces={150}
          recycle={false}
          colors={["#3b82f6", "#6366f1", "#a855f7", "#10b981"]}
        />
      )}

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center gap-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-linear-to-tr from-primary to-accent rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500" />
          <div className="relative w-36 h-36 rounded-full p-1 bg-linear-to-tr from-border/80 via-primary/30 to-accent/40 backdrop-blur-sm">
            <div className="w-full h-full rounded-full overflow-hidden bg-muted/30 flex items-center justify-center relative">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface border border-border/50 text-text-primary text-3xl font-bold uppercase">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            You're all set, {user?.name?.split(" ")[0]}.
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-lg mx-auto leading-relaxed">
            Your profile is live. We've topped up your wallet with 5 tokens to
            get your first exchange started.
          </p>
        </div>

        <div className="w-full max-w-sm bg-linear-to-b from-surface/60 to-surface/20 border border-border/60 backdrop-blur-md p-5 rounded-2xl shadow-xl flex items-center gap-4 transition hover:border-border/80">
          <div className="p-3.5 bg-background border border-border/40 rounded-xl shadow-inner flex items-center justify-center shrink-0">
            <Coins className="w-7 h-7 text-text-accent" />
          </div>
          <div className="text-left flex flex-col gap-0.5">
            <div className="text-3xl font-black tracking-tight text-text-primary font-mono">
              {displayTokens.toFixed(2)}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              SkillCredits awarded
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-center mt-4">
          <button
            disabled={loading}
            onClick={() => handleGoToPage("dashboard")}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            disabled={loading}
            onClick={() => handleGoToPage("profile")}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed  sm:w-auto px-6 py-3.5 bg-surface/40 hover:bg-surface/80 text-text-primary font-semibold rounded-xl border border-border/80 flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200"
          >
            View Profile
            <User className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompleted;
