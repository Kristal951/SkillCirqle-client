"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight, BadgeCheck, Coins, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTokenStore } from "@/store/useTokenStore";
import Confetti from "react-confetti";
import Link from "next/link";

const OnboardingCompleted = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tokens } = useTokenStore();

  const [displayTokens, setDisplayTokens] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const targetTokens = 10;

  useEffect(() => {
    if (!targetTokens) return;

    let start = 0;
    const end = targetTokens;
    const duration = 1000;
    const stepTime = 20;

    const increment = end / (duration / stepTime);

    const counter = setInterval(() => {
      start += increment;

      if (start >= end) {
        start = end;
        clearInterval(counter);
      }

      setDisplayTokens(parseFloat(start.toFixed(2)));
    }, stepTime);

    return () => clearInterval(counter);
  }, [targetTokens]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-white">
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          numberOfPieces={200}
          recycle={false}
        />
      )}
      <div className="relative w-40 h-40">
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary group">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-black text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>
          )}
        </div>

        <BadgeCheck className="absolute bottom-2 right-2 text-white w-8 h-8 bg-primary rounded-full p-0.5 shadow-md" />
      </div>

      <div className="w-full flex items-center gap-2 justify-center flex-col py-4 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-semibold">
          You're all set,{" "}
          <span className="text-text-primary">
            {user?.name?.split(" ")[0]}.
          </span>
        </h1>

        <p className="text-sm md:text-xl text-text-secondary max-w-xl">
          Your profile is live. We've topped up your vault with 10 tokens to get
          your first exchange started.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-3 bg-accent/20 px-6 py-4 rounded-2xl border border-accent/30">
          <div className="p-3 bg-background rounded-xl">
            <Coins className="w-8 h-8 text-text-accent" />
          </div>

          <div className="text-left flex flex-col gap-2">
            <div className="text-3xl font-bold tracking-tight">
              {displayTokens.toFixed(2)}
            </div>
            <div className="text-sm text-text-secondary">
              Skill Tokens credited
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-20 flex flex-col sm:flex-row gap-8 items-center justify-center">
        <Link
          href="/dashboard"
          className="px-5 py-3 bg-text-primary text-primary rounded-md flex items-center gap-2 font-medium hover:opacity-90 transition"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/profile"
          className="px-5 py-3 bg-transparent text-text-primary rounded-md border border-text-primary flex items-center gap-2 font-medium hover:bg-text-secondary/20 transition"
        >
          View Profile
          <User className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default OnboardingCompleted;
