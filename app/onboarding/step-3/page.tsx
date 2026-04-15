"use client";

import React, { useState, KeyboardEvent, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { useTokenStore } from "@/store/useTokenStore";

const UploadSkills = () => {
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");

  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);

  const [teachSuggestions, setTeachSuggestions] = useState<string[]>([]);
  const [learnSuggestions, setLearnSuggestions] = useState<string[]>([]);

  const [showTeachDropdown, setShowTeachDropdown] = useState(false);
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);

  const suggestedTeach = ["React", "UI Design", "TypeScript", "Next.js"];
  const suggestedLearn = ["AI", "DevOps", "Docker", "System Design"];

  const { updateUser, isUpdatingUser } = useAuthStore();
  const { awardUserOnboardingTokens } = useTokenStore();
  const router = useRouter();

  const handleAddSkill = (
    value: string,
    skills: string[],
    setSkills: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const val = value.trim().replace(/,/g, "");

    if (!val) return;

    if (skills.includes(val)) return;

    if (skills.length >= 5) {
      toast.warning("You can only add up to 5 skills.");
      return;
    }

    setSkills([...skills, val]);
    setInput("");
  };
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    value: string,
    skills: string[],
    setSkills: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill(value, skills, setSkills, setInput);
    }
  };

  const removeSkill = (
    index: number,
    skills: string[],
    setSkills: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!teachInput) {
      setTeachSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/skills?q=${teachInput}`);
        const data = await res.json();
        setTeachSuggestions(
          (data.skills || []).filter((s: string) => !teachSkills.includes(s)),
        );
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [teachInput]);

  useEffect(() => {
    if (!learnInput) {
      setLearnSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/skills?q=${learnInput}`);
        const data = await res.json();
        setLearnSuggestions(
          (data.skills || []).filter((s: string) => !learnSkills.includes(s)),
        );
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [learnInput]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const success = await updateUser({
        skills_to_teach: teachSkills,
        skills_to_learn: learnSkills,
        has_onboarded: true,
      });

      if (!success) {
        toast.error("Failed to complete onboarding");
        return;
      }

      const res = await awardUserOnboardingTokens();

      if (res?.tokens !== undefined) {
        toast.success(`🎉 +3 tokens awarded!`);
      } else if (res?.message === "Already rewarded") {
        toast.info("Tokens already awarded");
      }

      // setTimeout(() => {
      router.replace("/onboarding/onboardingCompleted");
      // }, 200);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col px-6 py-10 bg-background">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Define Your <span className="text-primary">Expertise</span>
        </h1>
        <p className="text-text-secondary text-base md:text-lg">
          Tell us what you can teach and what you want to learn. This helps us
          match you with the right people.
        </p>
      </div>

      {/* Form */}
      <form
        id="skills-form"
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TEACH */}
          <div className="bg-surface-2 rounded-2xl p-6 space-y-5 border border-white/5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  🧠 Skills you can teach
                </h2>
                <p className="text-sm text-text-secondary">
                  What are you confident in?
                </p>
              </div>
              <span className="text-xs text-text-secondary">
                {teachSkills.length}/5
              </span>
            </div>

            {/* Input */}
            <div className="relative">
              <input
                value={teachInput}
                disabled={teachSkills.length >= 5 || isUpdatingUser}
                onChange={(e) => {
                  setTeachInput(e.target.value);
                  setShowTeachDropdown(true);
                }}
                onFocus={() => setShowTeachDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowTeachDropdown(false), 150)
                }
                onKeyDown={(e) =>
                  handleKeyDown(
                    e,
                    teachInput,
                    teachSkills,
                    setTeachSkills,
                    setTeachInput,
                  )
                }
                placeholder="Type and press Enter..."
                className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />

              <div className="flex items-center gap-2 py-4">
                <span className="material-symbols-outlined text-text-secondary text-lg cursor-help">
                  info
                </span>
                <p className="text-xs text-text-secondary">
                  Press Enter or comma to add a skill
                </p>
              </div>

              {showTeachDropdown &&
                teachSuggestions.length > 0 &&
                teachSkills.length < 5 && (
                  <div className="absolute z-20 mt-2 w-full bg-surface-2 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {teachSuggestions.map((skill, index) => (
                      <div
                        key={index}
                        onMouseDown={() =>
                          handleAddSkill(
                            skill,
                            teachSkills,
                            setTeachSkills,
                            setTeachInput,
                          )
                        }
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/20 transition"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
              {teachSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-sm"
                >
                  {skill}
                  <button
                    onClick={() =>
                      removeSkill(index, teachSkills, setTeachSkills)
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-text-secondary uppercase">Suggested</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTeach.map((skill) => (
                  <span
                    key={skill}
                    onClick={() =>
                      handleAddSkill(
                        skill,
                        teachSkills,
                        setTeachSkills,
                        setTeachInput,
                      )
                    }
                    className="px-3 py-1 rounded-full text-xs bg-white/5 hover:bg-primary/20 hover:text-primary cursor-pointer transition"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-2 rounded-2xl p-6 space-y-5 border border-white/5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  🎓 Skills you want to learn
                </h2>
                <p className="text-sm text-text-secondary">
                  What do you want to improve?
                </p>
              </div>
              <span className="text-xs text-text-secondary">
                {learnSkills.length}/5
              </span>
            </div>

            <div className="relative">
              <input
                value={learnInput}
                disabled={learnSkills.length >= 5 || isUpdatingUser}
                onChange={(e) => {
                  setLearnInput(e.target.value);
                  setShowLearnDropdown(true);
                }}
                onFocus={() => setShowLearnDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowLearnDropdown(false), 150)
                }
                onKeyDown={(e) =>
                  handleKeyDown(
                    e,
                    learnInput,
                    learnSkills,
                    setLearnSkills,
                    setLearnInput,
                  )
                }
                placeholder="Type and press Enter..."
                className="w-full px-4 py-3 rounded-lg bg-background border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />

              <div className="flex items-center gap-2 py-4">
                <span className="material-symbols-outlined text-text-secondary text-lg cursor-help">
                  info
                </span>
                <p className="text-xs text-text-secondary">
                  Press Enter or comma to add a skill
                </p>
              </div>

              {showLearnDropdown &&
                learnSuggestions.length > 0 &&
                learnSkills.length < 5 && (
                  <div className="absolute z-20 mt-2 w-full bg-surface-2 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {learnSuggestions.map((skill, index) => (
                      <div
                        key={index}
                        onMouseDown={() =>
                          handleAddSkill(
                            skill,
                            learnSkills,
                            setLearnSkills,
                            setLearnInput,
                          )
                        }
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/20 transition"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {learnSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-sm"
                >
                  {skill}
                  <button
                    onClick={() =>
                      removeSkill(index, learnSkills, setLearnSkills)
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-text-secondary uppercase">Suggested</p>
              <div className="flex flex-wrap gap-2">
                {suggestedLearn.map((skill) => (
                  <span
                    key={skill}
                    onClick={() =>
                      handleAddSkill(
                        skill,
                        learnSkills,
                        setLearnSkills,
                        setLearnInput,
                      )
                    }
                    className="px-3 py-1 rounded-full text-xs bg-white/5 hover:bg-primary/20 hover:text-primary cursor-pointer transition"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="max-w-6xl mx-auto w-full flex items-center justify-between mt-10 py-4">
        <Link
          href="/dashboard"
          className="text-text-secondary hover:text-text-primary text-sm"
        >
          Skip for now
        </Link>

        <button
          disabled={
            isUpdatingUser ||
            teachSkills.length === 0 ||
            learnSkills.length === 0
          }
          type="submit"
          form="skills-form"
          className="px-6 py-3 rounded-lg bg-primary text-white text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {isUpdatingUser ? (
            <>
              <Spinner />
              Updating...
            </>
          ) : (
            "Complete Profile"
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadSkills;
