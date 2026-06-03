import React from "react";
import {
  ChevronRight,
  Star,
  ArrowLeftRight,
  User as UserIcon,
} from "lucide-react";
import { User } from "@/types/AuthStore";

interface MentorCardProps {
  user: User;
  onViewProfile: (id: string | number) => void;
  onPropose: (id: string | number) => void;
}

export const SearchCard: React.FC<MentorCardProps> = ({
  user,
  onViewProfile,
  onPropose,
}) => {
  return (
    <div
      onClick={() => onViewProfile(user?.id)}
      key={user.id}
      className="group relative bg-surface/40 border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden border-2 border-background shadow-lg">
          <img
            src={user?.avatar_url || ""}
            alt={user.name}
            className="w-full h-full object-cover bg-background"
          />
        </div>
        <div className="bg-accent/10 text-accent px-2 py-1.5 rounded-lg flex items-center gap-1.5 font-display font-extrabold text-sm border border-accent/20">
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings: "'FILL' 1",
              fontSize: "18px",
            }}
          >
            star
          </span>
          <span className="text-[12px]">
            {user.rating ? user.rating.toFixed(2) : "0.00"}
          </span>
        </div>
        {/* <span className="px-3 py-1.5 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-wider text-text-secondary group-hover:border-primary/20 transition-colors">
                      {user.category}
                    </span> */}
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {user?.skills_to_teach?.map((skill) => (
          <span
            key={skill}
            className="text-[10px] font-bold px-3 py-1.5 bg-background border border-border rounded-xl text-text-primary group-hover:bg-primary/5 transition-all"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/50">
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="material-symbols-outlined">swap_horiz</span>
          <span className="text-xl font-bold">{user.exchanges}</span>
          <p className="text-sm">exchanges</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPropose(user?.id);
          }}
          className="flex bg-primary px-4 py-3 items-center gap-1 text-text-primary rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:gap-2 group-hover:text-text-primary transition-all"
        >
          Propose
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
