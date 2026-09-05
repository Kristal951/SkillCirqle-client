"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useUserWorkspaces } from "@/hooks/useUserWorkspaces";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Workspaces from "@material-symbols/svg-400/outlined/workspaces.svg";
import SwapHoriz from "@material-symbols/svg-400/outlined/swap_horiz.svg";

const PAGE_SIZE = 20;

type FilterTab = "all" | "swap" | "learn";

export default function WorkspacesPage() {
  const router = useRouter();

  const authUser = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const {
    workspaces,
    totalCount,
    loading,
    loadingMore,
    hasMore,
    fetchMembersData,
    fetchMore,
  } = useUserWorkspaces(authUser?.id || null, {
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (!authUser?.id) return;
    fetchMembersData();
  }, [authUser?.id]);

  const validWorkspaces = useMemo(
    () => workspaces.filter((item) => item.workspace?.proposal),
    [workspaces],
  );

  const swapCount = useMemo(
    () =>
      validWorkspaces.filter(
        (item) => item.workspace.proposal.engagement_type === "swap",
      ).length,
    [validWorkspaces],
  );

  const learnCount = validWorkspaces.length - swapCount;

  const filteredWorkspaces = useMemo(() => {
    if (activeTab === "all") return validWorkspaces;
    return validWorkspaces.filter((item) =>
      activeTab === "swap"
        ? item.workspace.proposal.engagement_type === "swap"
        : item.workspace.proposal.engagement_type !== "swap",
    );
  }, [validWorkspaces, activeTab]);

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: validWorkspaces.length },
    { id: "swap", label: "Skill Swaps", count: swapCount },
    { id: "learn", label: "Learn", count: learnCount },
  ];

  const heading = "All your workspaces";

  return (
    <div className="max-w-3xl w-full px-4 md:px-8 py-6 md:py-8">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition mb-5 md:mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">{heading}</h1>
          <p className="text-xs text-text-secondary mt-1">
            {loading ? "Loading…" : `${totalCount} workspace${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>

        {!loading && validWorkspaces.length > 0 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface/60 border border-border/50 overflow-x-auto max-w-full shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center flex-1 justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-white/20"
                      : "bg-background text-text-secondary"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="divide-y divide-border/60 border-t border-border/60">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-4">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0">
                <div className="absolute left-0 top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface animate-pulse" />
                <div className="absolute right-0 bottom-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface border-2 border-background animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3.5 w-3/4 rounded-md bg-surface animate-pulse" />
                <div className="h-2.5 w-20 rounded-md bg-surface animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : validWorkspaces.length === 0 ? (
        <div className="py-16 sm:py-20 px-5 text-center rounded-2xl border border-dashed border-border">
          <div className="mx-auto w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
            <Workspaces className="w-6 h-6 text-text-secondary" />
          </div>
          <p className="text-sm font-semibold mt-4">No workspaces yet</p>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Your skill exchange workspaces will appear here.
          </p>
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="py-14 sm:py-16 px-5 text-center rounded-2xl border border-dashed border-border">
          <p className="text-sm font-semibold">
            No {activeTab === "swap" ? "skill swaps" : "learn"} workspaces
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Try a different filter above.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/60 border-t border-border/60">
            {filteredWorkspaces.map((item) => {
              const workspace = item.workspace;
              const proposal = workspace.proposal;

              const teachSkill = proposal.teach_skill;
              const learnSkill = proposal.learn_skill;

              return (
                <button
                  key={workspace.id}
                  onClick={() => router.push(`/workspaces/${workspace.id}`)}
                  className="w-full flex items-center gap-3 group py-3.5 sm:py-4 text-left hover:bg-surface/40 transition-colors -mx-2 px-2 rounded-lg"
                >
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center">
                    {teachSkill?.image_url && (
                      <Image
                        src={teachSkill.image_url}
                        alt={teachSkill.title}
                        width={32}
                        height={32}
                        className="absolute left-0 top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border-2 border-surface ring-1 ring-border/10"
                      />
                    )}

                    {learnSkill?.image_url && (
                      <Image
                        src={learnSkill.image_url}
                        alt={learnSkill.title}
                        width={32}
                        height={32}
                        className={`absolute ${teachSkill?.image_url ? "right-0 bottom-0" : "left-0"} w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border-2 border-surface ring-1 ring-border/10`}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`flex items-center flex-wrap ${proposal?.engagement_type === "swap" ? "gap-1.5" : ""} min-w-0`}
                    >
                      <p className="text-sm font-semibold truncate">
                        {teachSkill?.title}
                      </p>

                      {proposal?.engagement_type === "swap" && (
                        <SwapHoriz className="text-text-secondary text-xs shrink-0" />
                      )}

                      <p className="text-sm font-semibold truncate">
                        {learnSkill?.title}
                      </p>
                    </div>

                    <span
                      className={`inline-block text-[11px] font-medium mt-1.5 py-0.5 rounded-full text-accent`}
                    >
                      {proposal.engagement_type === "swap" ? "Skill Swap" : "Learn"}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-text-secondary opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              );
            })}
          </div>

          {activeTab === "all" && hasMore && (
            <div className="flex justify-center mt-5">
              <button
                onClick={() => fetchMore()}
                disabled={loadingMore}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition disabled:opacity-60"
              >
                {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loadingMore ? "Loading more…" : "Load more"}
              </button>
            </div>
          )}

          {activeTab !== "all" && hasMore && (
            <p className="text-center text-[11px] text-text-secondary mt-4">
              Showing results from what's loaded — switch to "All" and load more to see additional {activeTab === "swap" ? "swaps" : "learn"} workspaces.
            </p>
          )}
        </>
      )}
    </div>
  );
}