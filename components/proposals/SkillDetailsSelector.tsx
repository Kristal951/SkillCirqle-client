// components/proposal/SkillDetailsSelector.tsx
"use client";

import React from "react";
import NumberRow from "./NumberRow";

type Skill = { id: string; title: string };

type Props = {
  isSwap: boolean;
  disabled: boolean;
  teachSkillId: string;
  learnSkillId: string;
  userSkills: Skill[];
  profileSkills: Skill[];
  onTeachChange: (id: string, name: string) => void;
  onLearnChange: (id: string, name: string) => void;
};

const SkillDetailsSelector = ({
  isSwap,
  disabled,
  teachSkillId,
  learnSkillId,
  userSkills,
  profileSkills,
  onTeachChange,
  onLearnChange,
}: Props) => {
  return (
    <section className="space-y-4 pt-6 border-t border-border/50">
      <NumberRow number={3} title="Skill Details" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isSwap && (
          <div className="space-y-2 flex flex-col">
            <label className="text-[10px] font-bold uppercase text-text-secondary ml-1">
              I will teach you
            </label>
            <select
              className="w-full p-4 bg-surface/50 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none"
              value={teachSkillId}
              disabled={disabled}
              onChange={(e) => {
                const selected = userSkills.find(
                  (s) => s.id === e.target.value,
                );
                onTeachChange(e.target.value, selected?.title || "");
              }}
            >
              <option value="">Select a skill...</option>
              {userSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2 flex flex-col">
          <label className="text-[10px] font-bold uppercase text-text-secondary ml-1">
            I want to learn
          </label>
          <select
            className="w-full p-4 bg-surface/50 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none"
            value={learnSkillId}
            disabled={disabled}
            onChange={(e) => {
              const selected = profileSkills.find(
                (s) => s.id === e.target.value,
              );
              onLearnChange(e.target.value, selected?.title || "");
            }}
          >
            <option value="">Select a skill...</option>
            {profileSkills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

export default React.memo(SkillDetailsSelector);