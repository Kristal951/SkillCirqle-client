import { IconType } from "@/utils/SvgType";
import React from "react";

interface DataCardProps {
  icon: IconType;
  label: string;
  value: string | number;
  compact?: boolean;
  loading: boolean;
}

const DataCard = ({ icon: Icon, label, value, compact, loading }: DataCardProps) => {
  if (loading) {
    return (
      <div className="bg-surface/50 p-8 rounded-2xl relative overflow-hidden animate-pulse">
        <div className="absolute top-0 right-0 p-4">
          <div className="w-15 h-15 rounded-xl bg-text-secondary/10" />
        </div>

        <div className="h-3 bg-text-secondary/15 rounded-md w-20 mb-4" />
        <div className={`bg-text-secondary/15 rounded-md ${compact ? "h-6 w-16" : "h-9 w-24"}`} />
      </div>
    );
  }

  return (
    <div className="bg-surface/50 p-8 rounded-2xl transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group cursor-pointer">
      <div className="absolute top-0 right-0 p-4 opacity-60 group-hover:opacity-100 transition-opacity">
        <Icon
          className={`text-[60px] ${label === "PENDING" ? "text-amber-500" : label === "APPROVED" ? "text-green-500" : label === "REJECTED" ? "text-red-500" : "text-primary"}`}
        />
      </div>

      <p className="font-label text-xs uppercase tracking-widest text-text-secondary mb-2">
        {label}
      </p>

      <h2
        className={`${compact ? "text-2xl font-semibold" : "text-4xl font-black"} text-text-primary`}
      >
        {value}
      </h2>
    </div>
  );
};

export default DataCard;