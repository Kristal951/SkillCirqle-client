"use client";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuthStore } from "@/store/useAuthStore";
import Spinner from "@/components/ui/Spinner";
import Sidebar from "@/components/workspace/Sidebar";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useContext, useEffect } from "react";
import FolderOff from "@material-symbols/svg-400/outlined/folder_off.svg";
import { getSocket } from "@/lib/socket";
import { SocketContext } from "@/providers/SocketContext";

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
  const workspaceId = params.id as string;
  const { user } = useAuthStore();
  const { workspace, members, skillTracks, loading } = useWorkspace(workspaceId);
  const { setCollapsed } = useSidebarStore();
  const { socketReady } = useContext(SocketContext);

  const isSwap = workspace?.proposal?.engagement_type === "swap";
  const userId = user?.id;

  useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  useEffect(() => {
    if (!socketReady || !workspaceId || !userId) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit(
      "workspace:join",
      {workspaceId },
      (response: { success: boolean; message?: string }) => {
        if (!response.success) {
          console.error(response.message);
        }
      },
    );

    return () => {
      socket.emit("workspace:leave", {
        workspaceId: workspaceId,
      });
    };
  }, [socketReady, workspaceId, userId]);

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
      <div className="h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full">
          <FolderOff className="text-8xl text-text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">
          Workspace not found
        </h2>
        <p className="mt-2 text-text-secondary max-w-sm">
          The workspace you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 px-6 py-3 bg-primary text-text-primary rounded-xl font-medium hover:opacity-90 transition"
        >
          Return to Dashboard
        </Link>
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
          id={workspaceId}
          userId={user?.id}
        />

        <main className="flex-1 md:p-6 md:ml-72 px-4 py-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
