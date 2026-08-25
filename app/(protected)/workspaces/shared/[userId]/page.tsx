"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useUserWorkspaces } from "@/hooks/useUserWorkspaces";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Workspaces from "@material-symbols/svg-400/outlined/workspaces.svg";
import SwapHoriz from "@material-symbols/svg-400/outlined/swap_horiz.svg";

const PAGE_SIZE = 200;

export default function WorkspacesWithUserPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const counterpartUserId = params.userId;

  const authUser = useAuthStore((s) => s.user);

  const {
    workspaces,
    totalCount,
    loading,
    fetchMembersData,
  } = useUserWorkspaces(authUser?.id || null, {
    pageSize: PAGE_SIZE,
    counterpartUserId,
  });

  useEffect(() => {
    if (!authUser?.id || !counterpartUserId) return;
    fetchMembersData();
  }, [authUser?.id, counterpartUserId]);

  return (
    <div className="max-w-3xl w-full px-3 md:px-10 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="p-2 -ml-2 rounded-full hover:bg-surface transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-semibold">Shared workspaces</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            {loading ? "Loading…" : `${totalCount} workspace${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>

        <button
          onClick={() => router.push("/workspaces")}
          className="ml-auto text-xs font-medium text-text-secondary hover:text-text-primary transition"
        >
          View all workspaces
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-border">
              <div className="relative w-11 h-11 shrink-0">
                <div className="absolute left-0 top-0 w-8 h-8 rounded-lg bg-surface animate-pulse" />
                <div className="absolute right-0 bottom-0 w-8 h-8 rounded-lg bg-surface border-2 border-background animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3.5 w-3/4 rounded-md bg-surface animate-pulse" />
                <div className="h-2.5 w-20 rounded-md bg-surface animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="py-16 px-5 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
            <Workspaces className="w-6 h-6 text-text-secondary" />
          </div>
          <p className="text-sm font-medium mt-4">No shared workspaces yet</p>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            You don't have any active skill exchanges with this person yet.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {workspaces.map((item) => {
            const workspace = item.workspace;
            if (!workspace) return null;
            const proposal = workspace.proposal;
            if (!proposal) return null;

            const teachSkill = proposal.teach_skill;
            const learnSkill = proposal.learn_skill;

            return (
              <button
                key={workspace.id}
                onClick={() => router.push(`/workspaces/${workspace.id}`)}
                className="w-full flex items-center gap-3 group p-3 rounded-xl text-left hover:bg-surface transition-colors border border-transparent hover:border-border"
              >
                <div className="relative w-11 h-11 shrink-0 flex items-center">
                  {teachSkill?.image_url && (
                    <Image
                      src={teachSkill.image_url}
                      alt={teachSkill.title}
                      width={32}
                      height={32}
                      className="absolute left-0 top-0 w-8 h-8 rounded-lg object-cover border-2 border-surface"
                    />
                  )
                  }

                  {learnSkill?.image_url && (
                    <Image
                      src={learnSkill.image_url}
                      alt={learnSkill.title}
                      width={32}
                      height={32}
                      className={`absolute ${teachSkill?.image_url ? "right-0 bottom-0" : "left-0"} w-8 h-8 rounded-lg object-cover border-2 border-surface`}
                    />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <div className={`flex items-center ${proposal?.engagement_type === "swap" && "gap-1.5"} min-w-0`}>
                    <p className="text-sm font-semibold truncate">
                      {teachSkill?.title}
                    </p>

                    {
                      proposal?.engagement_type === "swap" && (
                        <SwapHoriz className="text-text-secondary text-xs shrink-0" />
                      )
                    }
                    <p className="text-sm font-semibold truncate">
                      {learnSkill?.title}
                    </p>
                  </div>

                  <p className="text-xs text-accent mt-1">
                    {proposal.engagement_type === "swap"
                      ? "Skill Swap"
                      : "Learn"}
                  </p>
                </div>

                <ChevronRight
                  className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}