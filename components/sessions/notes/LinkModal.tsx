import { X } from "lucide-react";
import React from "react";

const LinkModal = ({
  setShowLinkModal,
  linkUrlInput,
  setLinkUrlInput,
  removeLink,
  applyLink,
}: {
  setShowLinkModal: (show: boolean) => void;
  linkUrlInput: string;
  setLinkUrlInput: (value: string) => void;
  removeLink: () => void;
  applyLink: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setShowLinkModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold tracking-tight">Insert Link</h3>
          <button
            onClick={() => setShowLinkModal(false)}
            className="p-1.5 rounded-full hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-secondary">URL</label>
          <input
            autoFocus
            type="url"
            placeholder="https://example.com"
            value={linkUrlInput}
            onChange={(e) => setLinkUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") setShowLinkModal(false);
            }}
            className="w-full rounded-lg bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-text-secondary"
          />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={removeLink}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            Remove link
          </button>
          <button
            onClick={applyLink}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white shadow-sm transition-all active:scale-[0.97]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;
