// components/proposal/SessionDurationSelector.tsx
"use client";

import React from "react";
import NumberRow from "./NumberRow";
import { IconType } from "@/utils/SvgType";

type SessionType = "quick" | "standard";

type Tab = {
  id: string;
  label: string;
  info: string;
  icon: IconType;
};

type Props = {
  value: SessionType;
  tabs: Tab[];
  disabled: boolean;
  onChange: (type: SessionType) => void;
};

const SessionDurationSelector = ({
  value,
  tabs,
  disabled,
  onChange,
}: Props) => {
  return (
    <section className="space-y-4 pt-6 border-t border-border/50">
      <NumberRow number={2} title="Session Duration" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tabs.map((tab) => {
          const isActive = value === tab.id;
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              disabled={disabled}
              onClick={() => onChange(tab.id as SessionType)}
              className={`flex items-start bg-surface/50 gap-4 p-4 rounded-2xl transition-all text-left ${
                isActive
                  ? "border-primary/50 border-2 text-text-primary shadow-lg shadow-primary/5"
                  : "text-text-secondary hover:border-text-secondary/30"
              }`}
            >
              <div
                className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-surface border border-border"
                }`}
              >
                <Icon className="text-xl"/>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base">
                  {tab.label}
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  {tab.info}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default React.memo(SessionDurationSelector);