import { Lock, Users, Wifi, WifiOff } from "lucide-react";
import React from "react";

const Bottombar = ({
  toggleCollab,
  collabLoading,
  collabEnabled,
  isConnected,
  saveStatus,
  editorStats,
  awarenessUsers,
}: {
  toggleCollab: () => void;
  collabLoading: boolean;
  collabEnabled: boolean;
  isConnected: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  editorStats: { characters: number; words: number } | null;
  awarenessUsers: { id: string; name: string; avatar: string; color: string }[];
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 text-xs font-medium bg-surface/20">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleCollab}
          disabled={collabLoading}
          title={
            collabEnabled
              ? "Switch to private notes"
              : "Switch to collaborative notes"
          }
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
            collabEnabled
              ? "text-blue-500 hover:bg-blue-500/10"
              : "text-text-secondary hover:bg-surface"
          } ${collabLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {collabEnabled ? (
            <>
              <Users className="w-3 h-3" /> Collaborative
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" /> Private
            </>
          )}
        </button>

        {collabEnabled && (
          <span
            className={`flex items-center gap-1 ${isConnected ? "text-emerald-500" : "text-amber-500"}`}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" /> Live
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" /> Connecting…
              </>
            )}
          </span>
        )}

        {!collabEnabled && saveStatus !== "idle" && (
          <span
            className={
              saveStatus === "saved"
                ? "text-emerald-500"
                : saveStatus === "error"
                  ? "text-red-500"
                  : "text-amber-500"
            }
          >
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "Saved"
                : "Failed to save"}
          </span>
        )}

        {collabEnabled && awarenessUsers.length > 0 && (
          <div className="flex items-center -space-x-2">
            {awarenessUsers.slice(0, 3).map((u) => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                title={u.name}
                className="w-6 h-6 rounded-full border border-border object-cover"
              />
            ))}
            {awarenessUsers.length > 3 && (
              <span className="text-text-secondary">
                +{awarenessUsers.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="text-text-secondary">
        <span>{editorStats?.characters ?? 0} characters · </span>
        <span>{editorStats?.words ?? 0} words</span>
      </div>
    </div>
  );
};

export default Bottombar;
