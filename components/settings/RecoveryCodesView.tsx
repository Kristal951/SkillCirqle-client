"use client";

import React, { SetStateAction } from "react";
// Added 'Lock' to the lucide-react imports to fix the missing component reference
import { Copy, Download, AlertTriangle, Lock, Key } from "lucide-react";
import { Step } from "./TwoFAModal";

interface RecoveryCodesViewProps {
  step: string;
  recoveryCodes: string[];
  setStep: React.Dispatch<SetStateAction<Step>>;
  handleCopyCodes: () => void;
}

export default function RecoveryCodesView({
  step,
  recoveryCodes = [],
  setStep,
  handleCopyCodes,
}: RecoveryCodesViewProps) {
  const handleDownloadCodes = () => {
    if (!recoveryCodes.length) return;

    const textContent =
      `SkillCirlqe - TWO-FACTOR SECURITY BACKUP RECOVERY CODES\n` +
      `Generated on: ${new Date().toLocaleDateString()}\n` +
      `--------------------------------------------------\n\n` +
      recoveryCodes.join("\n") +
      `\n\n--------------------------------------------------\n` +
      `Keep this file safe. Each recovery code can only be used once.`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = `skillCirqle-backup-codes-${new Date().toISOString().split("T")[0]}.txt`;

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (step !== "show_recovery_codes") return null;

  return (
    <div className="w-full px-6 bg-surface/30 backdrop-blur-md border border-border/10 rounded-2xl pb-4 space-y-6">
      <div className="w-full flex flex-col items-center justify-center text-center ">
        <h3 className="text-2xl font-bold text-text-primary tracking-tight">
          Save Your Recovery Keys
        </h3>
      </div>

      <div className="flex items-start justify-between gap-4 pt-2 border-t border-border/10">
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-primary">
            Backup Codes
          </h2>
          <p className="text-xs text-text-secondary/80 leading-relaxed">
            Keep these in a safe place for account recovery if you lose access
            to your authenticator.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 bg-background/40 p-1 rounded-xl border border-border/5">
          <button
            type="button"
            onClick={handleCopyCodes}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface/60 rounded-lg transition-colors active:scale-95"
            title="Copy codes to clipboard"
          >
            <Copy size={16} />
          </button>

          <button
            type="button"
            onClick={handleDownloadCodes}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface/60 rounded-lg transition-colors active:scale-95"
            title="Download codes file (.txt)"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2.5 items-start bg-red-500/5 border border-red-500/10 text-red-400 text-xs p-3.5 rounded-xl leading-relaxed">
        <AlertTriangle size={16} className="shrink-0 text-red-400 mt-0.5" />
        <p>
          These codes will{" "}
          <span className="font-bold underline">only be shown once</span>. Save
          them immediately. Each code can only be used once to access your
          account.
        </p>
      </div>

      <div className="w-full">
        <div className="w-full bg-background/50 border border-border/40 p-4 rounded-xl grid grid-cols-2 gap-2.5">
          {recoveryCodes.map((code, i) => (
            <div
              key={i}
              className="font-mono text-xs md:text-sm bg-surface/80 border border-border/10 py-2.5 px-3 rounded-lg text-center font-bold text-text-primary tracking-wider shadow-sm select-all"
            >
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full pt-2">
        <button
          type="button"
          onClick={() => setStep("enabled")}
          className="w-full py-3.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          I have saved my backup codes
        </button>
      </div>
    </div>
  );
}
