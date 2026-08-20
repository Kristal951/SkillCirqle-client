import React from "react";
import NumberRow from "./NumberRow";

type Props = {
  goal: string;
  sendingProposal: boolean;
  setGoal: (value: string) => void;
};

const GoalSection = ({ goal, sendingProposal, setGoal }: Props) => {
  return (
    <section className="space-y-3">
      <NumberRow number={4} title="Your Goal" />
      <input
        value={goal}
        disabled={sendingProposal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Build a SaaS app, improve skills..."
        className="w-full p-4 rounded-2xl border border-border bg-surface/50 focus:bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
      />
    </section>
  );
};

export default React.memo(GoalSection);
