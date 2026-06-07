import React from "react";
import {
  ChevronRight,
  Star,
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
  if (!user) return null;

  return (
    <div
      onClick={() => onViewProfile(user.id)}
    
      className="group relative flex flex-col h-full min-h-95 bg-surface/40 border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
    >
      {/* Top content wrapper */}
      <div className="flex flex-col justify-center items-center mb-4">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-background shadow-lg">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name || "User avatar"}
              className="w-full h-full object-cover bg-background"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
              <UserIcon size={40} />
            </div>
          )}
        </div>
        
        <div className="py-2 text-center">
          <h1 className="text-2xl font-bold text-text-primary">{user.name}</h1>
        </div>

        {user.rating !== undefined && (
          <div className="mt-3 flex items-center gap-2">
          <Star
            size={16}
            fill="currentColor"
            className="text-yellow-500"
          />

          <span className="font-semibold text-sm">
            {user.rating?.toFixed(1) || "0.0"}
          </span>

          <span className="text-text-secondary text-sm">
            rating
          </span>
        </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-center py-5">
        {user.skills_to_teach?.map((skill) => (
          <span
            key={skill}
            className="text-[10px] font-bold px-3 py-1.5 bg-background border border-border rounded-xl text-text-primary group-hover:bg-primary/5 transition-all"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 pt-5 border-t border-border/50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(user.id);
          }}
          className="flex flex-1 items-center justify-center gap-2 bg-surface/50 text-base text-text-primary hover:bg-surface transition-all px-4 py-3 rounded-lg font-medium"
        >
          View Profile
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPropose(user.id);
          }}
          className="flex bg-primary flex-1 px-4 py-3 justify-center items-center gap-1 text-text-primary rounded-xl text-base font-medium group-hover:gap-2 transition-all"
        >
          Propose
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};