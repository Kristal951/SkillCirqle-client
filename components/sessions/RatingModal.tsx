"use client";
import { useState } from "react";
import StarIcon from "@material-symbols/svg-400/outlined/star-fill.svg";
import StarOutlineIcon from "@material-symbols/svg-400/outlined/star.svg";
import { toast } from "@/lib/toast";

interface RatingSectionProps {
  sessionId: string;
  partnerName?: string;
  onSubmitted: () => void;
}

export default function RatingSection({
  sessionId,
  partnerName,
  onSubmitted,
}: RatingSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating", "Tap a star to rate this session.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/user/skill-sessions/${sessionId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, reason: reason.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Unable to submit rating", data?.error);
        return;
      }

      toast.success("Thanks for your feedback!", "");
      onSubmitted();
    } catch (err) {
      console.error("Rating submit error:", err);
      toast.error("Something went wrong", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="">
      <h2 className="text-xl font-bold text-text-primary text-center">
        How was your session{partnerName ? ` with ${partnerName}` : ""}?
      </h2>
      <p className="text-sm text-text-secondary text-center mt-1">
        Please rate your session before continuing.
      </p>

      <div className="flex items-center justify-center gap-2 mt-6">
        {[1, 2, 3, 4, 5].map((star) => {
          const Icon = star <= displayRating ? StarIcon : StarOutlineIcon;
          return (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className="p-1"
            >
              <Icon
                className={`w-9 h-9 transition-colors ${
                  star <= displayRating
                    ? "text-yellow-400"
                    : "text-text-secondary/40"
                }`}
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Tell us more (optional)"
        rows={3}
        maxLength={500}
        className="mt-5 w-full rounded-xl border border-border bg-background p-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 w-full rounded-lg bg-primary text-white py-3 text-center font-medium hover:opacity-90 disabled:opacity-50 transition"
      >
        {submitting ? "Submitting…" : "Submit Rating"}
      </button>
    </div>
  );
}