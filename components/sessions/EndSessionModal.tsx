"use client";

import { useState } from "react";
import TaskAlt from "@material-symbols/svg-400/outlined/task_alt.svg";
import Build from "@material-symbols/svg-400/outlined/build.svg";
import WifiOff from "@material-symbols/svg-400/outlined/wifi_off.svg";
import GroupOff from "@material-symbols/svg-400/outlined/group_off.svg";
import Emergency from "@material-symbols/svg-400/outlined/emergency.svg";
import Report from "@material-symbols/svg-400/outlined/report.svg";
import EditNote from "@material-symbols/svg-400/outlined/edit_note.svg";
import PowerSettingsNew from "@material-symbols/svg-400/outlined/power_settings_new.svg";

const reasons = [
  {
    value: "completed-early",
    label: "Objectives completed early",
    Icon: TaskAlt,
  },
  { value: "technical-issue", label: "Technical issues", Icon: Build },
  {
    value: "poor-network",
    label: "Poor internet connection",
    Icon: WifiOff,
  },
  {
    value: "participants-unavailable",
    label: "Participants unavailable",
    Icon: GroupOff,
  },
  {
    value: "emergency",
    label: "Emergency / Personal reason",
    Icon: Emergency,
  },
  {
    value: "inappropriate-behaviour",
    label: "Inappropriate behaviour",
    Icon: Report,
  },
  { value: "other", label: "Other", Icon: EditNote },
];

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, details?: string) => void;
}

const EndSessionModal = ({
  isOpen,
  onClose,
  onConfirm,
}: EndSessionModalProps) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 text-red-600 rounded-xl">
              <PowerSettingsNew />
            </div>
            <h2 className="text-xl font-bold text-text-primary">End Session</h2>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            This will disconnect all participants. Please choose a reason for
            ending the session early.
          </p>
        </div>

        <div className="p-6 pt-4 space-y-2">
          {reasons.map((item) => {
            const Icon = item.Icon;

            return (
              <label
                key={item.value}
                className={`flex items-center gap-4 p-3 rounded-xl group border transition-all cursor-pointer ${
                  reason === item.value
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={item.value}
                  checked={reason === item.value}
                  onChange={(e) => setReason(e.target.value)}
                  className="accent-primary w-4 h-4"
                />
                <Icon className="text-text-secondary group-hover:text-text-primary text-lg" />
                <span className="text-sm font-medium">{item.label}</span>
              </label>
            );
          })}

          {reason === "other" && (
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              placeholder="Please provide more details..."
              className="w-full mt-2 rounded-xl border border-border bg-background p-4 outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-2 bg-muted/30">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition"
          >
            Cancel
          </button>
          <button
            disabled={!reason}
            onClick={() => onConfirm(reason, details)}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-text-primary text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition active:scale-[0.98]"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSessionModal;
