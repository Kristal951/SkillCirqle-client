"use client";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuthStore } from "@/store/useAuthStore";
import Spinner from "@/components/ui/Spinner";
import Sidebar from "@/components/workspace/Sidebar";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  workspaceId: string;
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { workspace, members, skillTracks, loading } = useWorkspace(id);

  const isSwap = workspace?.proposal?.engagement_type === "swap";

  if (loading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={30} />
          <p className="text-sm text-text-secondary">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">Workspace not found.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {members.map((m, i) => (
              <div
                key={m.user_id}
                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-emerald-100 flex items-center justify-center"
                style={{ marginLeft: i > 0 ? "-8px" : "0" }}
              >
                {m.profiles.avatar_url ? (
                  <Image
                    src={m.profiles.avatar_url}
                    alt={m.profiles.name}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-emerald-700">
                    {m.profiles.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {members.map((m) => m.profiles.name).join(" & ")}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {skillTracks.map((t) => t.skills?.title).join(" × ")}
            </p>
          </div>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isSwap
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-violet-50 text-violet-700 border border-violet-200"
            }`}
          >
            {isSwap ? "Skill swap" : "Learning"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {workspace.proposal?.goal && (
            <p className="text-xs text-gray-400 hidden md:block max-w-xs truncate">
              Goal: {workspace.proposal.goal}
            </p>
          )}
        </div>
      </header> */}

      <div className="flex flex-1">
        <Sidebar
          skillTracks={skillTracks}
          members={members}
          id={id}
          userId={user?.id}
        />

        <main className="flex-1 md:p-6 md:ml-72 px-4 py-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
