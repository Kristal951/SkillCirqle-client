import Link from "next/link";
import { UserX } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border/50">
        <UserX className="h-7 w-7 text-text-secondary" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-text-primary">
          Profile not found
        </h1>
        <p className="max-w-sm text-sm text-text-secondary">
          This user doesn't exist, or their profile isn't available right
          now.
        </p>
      </div>

      <Link
        href="/search"
        className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
      >
        Explore skills
      </Link>
    </div>
  );
}