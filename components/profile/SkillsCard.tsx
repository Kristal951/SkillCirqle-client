import { IconType } from "@/utils/SvgType";
import { BadgeCheck } from "lucide-react";
import React from "react";

interface SkillItem {
  name: string;
  verified?: boolean;
}

const COLOR_CLASSES: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  primary: {
    bg: "bg-primary/20",
    border: "border-primary/30",
    text: "text-text-primary",
  },
  accent: {
    bg: "bg-accent/20",
    border: "border-accent/30",
    text: "text-accent",
  },
};

const SkillsCard = ({
  title,
  skills,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  skills: (string | SkillItem)[];
  icon: IconType;
  color: string;
  loading?: boolean;
}) => {
  const colorClasses = COLOR_CLASSES[color] ?? COLOR_CLASSES.primary;

  const normalizedSkills: SkillItem[] = skills.map((s) =>
    typeof s === "string" ? { name: s } : s,
  );

  if (loading) {
    return (
      <div className="col-span-2 md:p-6 p-4 h-max rounded-md bg-surface/50 animate-pulse">
        <div className="h-full flex flex-col w-full gap-8">
          <div className="w-full flex gap-2 items-center justify-between">
            <div className="w-max h-max flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-text-secondary/10" />
              <div className="h-6 bg-text-secondary/15 rounded-md w-40" />
            </div>
            <div className="h-4 bg-text-secondary/10 rounded-md w-8" />
          </div>

          <div className="flex flex-wrap gap-4">
            {[20, 28, 16, 24].map((w, i) => (
              <div
                key={i}
                className="h-7 rounded-full bg-text-secondary/10"
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-2 md:p-6 p-4 h-max rounded-md bg-surface/50">
      <div className="h-full flex flex-col w-full gap-8">
        <div className="w-full flex gap-2 items-center justify-between">
          <div className="w-max h-max flex items-center gap-2">
            <div className="w-10 h-10 flex items-center bg-background rounded-xl justify-center">
              <Icon className="text-text-primary text-xl" />
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <p className="text-text-secondary">{normalizedSkills.length}/5</p>
        </div>

        <div className="flex flex-wrap gap-4">
          {normalizedSkills.length > 0 ? (
            normalizedSkills.map((skill, index) => (
              <div
                key={index}
                className={`flex items-center gap-1.5 py-1 rounded-full px-4 ${colorClasses.bg} border ${colorClasses.border}`}
              >
                <p className={colorClasses.text}>{skill.name}</p>
                {skill.verified && (
                  <BadgeCheck size={14} className="text-emerald-500 shrink-0" />
                )}
              </div>
            ))
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <h2 className="text-2xl">No skill yet.</h2>
              <p className="text-text-secondary text-sm">
                Complete Profile Setup to add skill
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsCard;
