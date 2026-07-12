"use client";

import React from "react";
import NumberRow from "./NumberRow";
import { IconType } from "@/utils/SvgType";

type EngagementType = "learn" | "swap";

type Option = {
  id: string;
  title: string;
  icon: IconType;
  desc: string;
};

type Props = {
  activeTab: EngagementType;
  options: Option[];
  disabled: boolean;
  onChange: (tab: EngagementType) => void;
};

const ProposalTypeSelector = ({
  activeTab,
  options,
  disabled,
  onChange,}: Props) => {

  return (
    <section className="space-y-4 flex flex-col">
      <NumberRow number={1} title="Proposal Type" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {options.map((item) => {
          const active = activeTab === item.id;
          const Icon = item.icon

          return (
            <button
              key={item.id}
              disabled={disabled}
              onClick={() => onChange(item.id as EngagementType)}
              className={`p-5 rounded-xl ${active ? "border-3" : "border-0"} transition-all relative text-left border-primary/50 bg-surface/50`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 absolute right-4 top-4 flex items-center justify-center ${
                  active ? "border-primary" : "border-border"
                }`}
              >
                {active && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <Icon className="text-3xl"/>
              <h4 className="font-bold mt-3">{item.title}</h4>
              <p className="text-sm text-text-secondary mt-2">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default React.memo(ProposalTypeSelector);