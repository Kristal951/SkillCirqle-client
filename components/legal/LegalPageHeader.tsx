import { Download } from "lucide-react";
import React from "react";

interface LegalPageHeaderProps {
  title: string;
  lastUpdatedAt: string;
}

const LegalPageHeader = ({ title, lastUpdatedAt }: LegalPageHeaderProps) => {
  return (
    <div className="flex items-start justify-between w-full mb-10">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-xs uppercase text-text-secondary tracking-wider mt-1">
         {lastUpdatedAt}
        </p>
      </div>

      <button className="gap-2 bg-surface/80 hover:bg-surface rounded-md flex items-center px-3 py-2">
        <Download size={15} />
        <span className="text-xs text-text-primary">PDF</span>
      </button>
    </div>
  );
};

export default LegalPageHeader;
