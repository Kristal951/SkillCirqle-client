// components/proposal/ExpectedSessionsCounter.tsx
"use client";

import React from "react";
import NumberRow from "./NumberRow";

type Props = {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

const ExpectedSessionsCounter = ({
  value,
  disabled,
  onChange,
}: Props) => {
  return (
    <section className="space-y-4 pt-6 border-t border-border/50">
      <NumberRow number={3} title="Expected Sessions" />

      <div className="bg-surface/50 border border-border rounded-2xl p-5 flex items-center justify-between">
        <button
          disabled={disabled}
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-10 h-10 rounded-xl border bg-background border-border flex items-center justify-center hover:bg-surface transition"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <div className="text-center">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-text-secondary">
            {value === 1 ? "Session" : "Sessions"}
          </p>
        </div>
        <button
          disabled={disabled}
          onClick={() => onChange(Math.min(52, value + 1))}
          className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-surface transition"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
      <p className="text-xs text-text-secondary">
        This determines how many structured sessions will be created after
        acceptance.
      </p>
    </section>
  );
}

export default React.memo(ExpectedSessionsCounter);