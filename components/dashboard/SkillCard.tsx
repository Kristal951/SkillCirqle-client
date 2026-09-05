"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import { Users2 } from "lucide-react";

interface SkillInfo {
  title: string;
  image: string;
  desc: string;
  usersAmount: number;
  avatars?: string[];
  slug?: string;
}

interface SkillCardProps {
  info: SkillInfo;
}

const SkillCard = ({ info }: SkillCardProps) => {
  const router = useRouter();

  return (
    <div className="bg-surface/50 hover:bg-surface border border-border/50 w-64 sm:min-w-75 sm:max-w-85 lg:w-100 shrink-0 group rounded-2xl overflow-hidden flex flex-col justify-between hover:border-border hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_12px_30px_rgba(var(--primary-rgb),0.04)] transition-all duration-300">
      <div className="h-52 relative overflow-hidden bg-muted">
        <Image
          src={info.image}
          alt={info.title}
          fill
          sizes="(max-w-768px) 100vw, 200px"
          priority
          className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface/20 to-transparent pointer-events-none" />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-text-primary text-lg font-bold capitalize tracking-tight mb-1 transition-colors duration-300">
            {info.title}
          </h3>
          <p className="text-text-secondary text-xs md:text-sm line-clamp-3 leading-relaxed">
            {info.desc}
          </p>
        </div>
      </div>

      <div className="w-full flex items-center justify-between p-5 pt-0 mt-2">
        <div className="flex items-center">
          {info.avatars && info.avatars.length > 0 ? (
            <div className="flex items-center -space-x-2 overflow-hidden transition-transform duration-300 group-hover:translate-x-0.5">
              {info.avatars.slice(0, 2).map((url, i) => (
                <img
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-surface object-cover shrink-0 ring-1 ring-border/10"
                  src={url}
                  alt="User avatar reference"
                />
              ))}

              {info.usersAmount > 2 && (
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-background border-2 border-surface text-[12px] font-bold text-text-primary shrink-0 select-none tracking-tighter">
                  +{info.usersAmount - 2}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-text-secondary text-xs font-medium">
              <Users2 size={14} className="opacity-70" />
              <span>{info.usersAmount || 0} active</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => info.slug && router.push(`/skills/${info.slug}`)}
          className="md:bg-primary/10 lg:bg-primary/10 xl:bg-primary/10 bg-primary text-text-primary group-hover:bg-primary group-hover:text-text-primary px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 shadow-sm shadow-primary/5"
        >
          View Profiles
        </button>
      </div>
    </div>
  );
};

export default SkillCard;