import React from "react";

interface DataCardProps {
  icon: string;
  label: string;
  value: string | number;
  subValue?:string | number | null;
  compact?: boolean;
}

const DataCard = ({
  icon,
  label,
  value,
  subValue,
  compact,
}: DataCardProps) => {
  return (
    <div className="bg-surface/50 p-8 rounded-2xl transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group cursor-pointer">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "60px" }}
        >
          {icon}
        </span>
      </div>

      <p className="font-label text-xs uppercase tracking-widest text-text-secondary mb-2">
        {label}
      </p>

      <h2
        className={`${compact ? "text-2xl font-semibold" : "text-4xl font-black"} text-text-primary`}
      >
        {value}

        {!compact && subValue != null && (
          <span className="text-lg font-normal text-text-secondary">
            {" "}
            / {subValue}
          </span>
        )}
      </h2>

      {compact && subValue != null && (
        <p className="mt-1 text-sm text-text-secondary">{subValue}</p>
      )}

      {!compact && <div className="mt-4 h-1 w-12 bg-primary rounded-full" />}
    </div>
  );
};

export default DataCard;
