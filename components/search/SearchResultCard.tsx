import React from "react";
import { ChevronRight, Star, User as UserIcon } from "lucide-react";
import { User } from "@/types/AuthStore";

interface MentorCardProps {
  user: User;
  onViewProfile: (id: string | number) => void;
  onPropose: (id: string | number) => void;
}

export const SearchCard: React.FC<MentorCardProps> = ({ user, onViewProfile, onPropose }) => {
  if (!user) return null;

  return (
    <div
      onClick={() => onViewProfile(user.id)}
      className="group relative flex flex-col h-full bg-surface/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-border cursor-pointer overflow-hidden"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="relative p-1 rounded-full border border-border bg-background shadow-sm">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-background text-text-secondary">
                <UserIcon size={40} />
              </div>
            )}
          </div>
        </div>
        
        <h2 className="mt-4 text-xl font-bold text-text-primary tracking-tight">{user.name}</h2>
        
        {user.rating !== undefined && (
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-background rounded-full">
            <Star size={14} className="text-accent fill-accent" />
            <span className="text-sm font-bold text-text-primary">{user.rating?.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-auto">
        {user.skills_to_teach?.slice(0, 4).map((skill) => (
          <span key={skill} className="text-[10px] uppercase tracking-wider font-semibold px-3 py-2 bg-background text-text-primary rounded-lg border border-border">
            {skill}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-border">
        <button
          onClick={(e) => { e.stopPropagation(); onViewProfile(user.id); }}
          className="px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-text-secondary/10 rounded-xl transition-colors"
        >
          View Profile
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onPropose(user.id); }}
          className="flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-semibold text-text-primary bg-primary rounded-xl transition-all hover:gap-2 shadow-lg shadow-primary/20"
        >
          Send Proposal
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};