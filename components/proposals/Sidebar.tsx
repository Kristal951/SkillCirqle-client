import { Info } from "lucide-react";
import React from "react";

type ProposalCounts = {
  pending: number;
  accepted: number;
  declined: number;
  withdrawn: number;
  expired: number;
  negotiating: number;
  completed: number;
};

type SidebarProps = {
  counts: ProposalCounts;
};

const Sidebar = ({ counts }: SidebarProps) => {
  return (
    <aside className="lg:col-span-1 space-y-6 order-1 lg:order-2">
      <div className="bg-surface/50 rounded-3xl p-6 border border-border">
        <h3 className="font-bold mb-4 text-lg">Activity Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {[
            {
              label: "Active",
              value: counts.accepted,
              color: "text-blue-500",
            },
            {
              label: "Pending",
              value: counts.pending,
              color: "text-amber-500",
            },
            {
              label: "Completed",
              value: counts.completed,
              color: "text-emerald-500",
            },
            {
              label: "Rejected",
              value: counts.declined,
              color: "text-red-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-3 bg-background rounded-xl border border-border"
            >
              <span className="text-xs text-text-secondary font-medium">
                {stat.label}
              </span>
              <span className={`font-bold text-sm ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:block bg-primary/5 rounded-3xl p-6 border border-primary/10">
        <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
          <Info size={16} /> Pro-Tip
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Proposals expire after 7 days. Quick responses increase your matching
          score!
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
