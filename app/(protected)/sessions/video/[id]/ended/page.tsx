"use client";
import Spinner from "@/components/ui/Spinner";
import { useSessionData } from "@/hooks/useSessionDataHook";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import CheckCircle from "@material-symbols/svg-400/outlined/check_circle.svg";
import Cancel from "@material-symbols/svg-400/outlined/cancel.svg";
import RatingSection from "@/components/sessions/RatingModal";

export default function VideoSessionEndedPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawId = params?.id;
  const sessionId = typeof rawId === "string" ? rawId : null;

  const reason = searchParams?.get("reason");
  const user = useAuthStore((s) => s.user);
  const { sessionData, loading } = useSessionData(sessionId, user?.id);

  const [showRating, setShowRating] = useState(false);
  const [ratingChecked, setRatingChecked] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);

  useEffect(() => {
    if (!loading && !sessionData) {
      router.replace("/sessions");
    }
  }, [loading, sessionData, router]);

  const isCompleted = reason === "completed" || reason === "timer-expired";
  const isGuest = sessionData?.guest?.id === user?.id;

  useEffect(() => {
    if (!isCompleted || !sessionId || ratingChecked || !isGuest) return;

    fetch(`/api/user/skill-sessions/${sessionId}/rating`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.existingRating) {
          setShowRating(true);
        } else {
          setRatingDone(true);
        }
      })
      .catch((err) => console.error("Rating check failed:", err))
      .finally(() => setRatingChecked(true));
  }, [isCompleted, sessionId, ratingChecked, isGuest]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background px-6">
        <Spinner size={30} />
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  if (isCompleted && isGuest && !ratingChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-surface/50 shadow-xl p-8 animate-pulse">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-text-primary/10" />

          <div className="mx-auto h-7 w-48 rounded-md bg-text-primary/10" />
          <div className="mx-auto mt-3 h-4 w-64 rounded-md bg-text-primary/10" />

          <div className="mt-8 rounded-xl border border-border bg-background p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded bg-text-primary/10" />
              <div className="h-4 w-24 rounded bg-text-primary/10" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-text-primary/10" />
              <div className="h-4 w-14 rounded bg-text-primary/10" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-14 rounded bg-text-primary/10" />
              <div className="h-4 w-16 rounded bg-text-primary/10" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="h-12 w-full rounded-lg bg-text-primary/10" />
            <div className="h-12 w-full rounded-lg bg-text-primary/10" />
          </div>
        </div>
      </main>
    );
  }

  const title = isCompleted ? "Session Completed" : "Session Ended";
  const Icon = isCompleted ? CheckCircle : Cancel;

  const statusStyles = isCompleted
    ? {
        icon: "text-green-500",
        badgeBg: "bg-green-500/10",
        pillBg: "bg-green-100 text-green-700",
      }
    : {
        icon: "text-red-500",
        badgeBg: "bg-red-500/10",
        pillBg: "bg-red-100 text-red-700",
      };

  const description = isCompleted
    ? "This learning session has successfully finished."
    : "The host ended this session before the scheduled time.";

  const partnerName =
    sessionData?.host?.id === user?.id
      ? sessionData?.guest?.name
      : sessionData?.host?.name;

  const canNavigateAway = !showRating || ratingDone || !isGuest;
  const pendingRating = showRating && !ratingDone && isGuest;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-surface/50 shadow-xl p-8">
        {pendingRating && sessionId ? (
          <RatingSection
            sessionId={sessionId}
            partnerName={partnerName}
            onSubmitted={() => setRatingDone(true)}
          />
        ) : (
          <>
            <div
              className={`mx-auto mb-6 w-fit p-4 rounded-full ${statusStyles.badgeBg}`}
            >
              <Icon className={`w-12 h-12 ${statusStyles.icon}`} />
            </div>

            <h1 className="text-3xl font-bold text-center text-text-primary">
              {title}
            </h1>

            <p className="mt-3 text-center text-text-secondary">
              {description}
            </p>

            <div className="mt-8 rounded-xl border border-border bg-background p-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Title</span>
                <span className="font-semibold truncate">
                  {sessionData?.title}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-text-secondary">Duration</span>
                <span className="font-medium">
                  {sessionData?.duration} mins
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-text-secondary">Status</span>
                <span className="font-medium capitalize">
                  {sessionData?.status?.toLowerCase()}
                </span>
              </div>
            </div>
          </>
        )}

        {canNavigateAway && (
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`/workspace/${sessionData?.workspaceId}`}
              className="w-full rounded-lg bg-primary text-text-primary py-3 text-center font-medium hover:opacity-90 transition"
            >
              Back to Workspace
            </Link>

            <Link
              href="/dashboard"
              className="w-full py-3 text-center text-text-secondary transition-colors hover:text-text-primary"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
