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
        skillsToTeach: teachSkills,
        skillsToLearn: learnSkills,
        hasOnboarded: true,
      });

      if (!success) {
        toast.error("Failed to complete onboarding");
        return;
      }

      const res = await awardUserOnboardingTokens();

      if (res?.tokens !== undefined) {
        toast.success(`🎉 +10 tokens awarded!`);
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
    <div className="w-full h-full flex flex-col justify-between px-6 py-10">
      <div className="w-full flex flex-col gap-8 items-center">
        <div className="space-y-3 max-w-xl text-center">
          <h1 className="text-5xl font-semibold">
            Define Your <span className="text-text-primary">Expertise</span>.
          </h1>

          <p className="text-lg text-text-secondary">
            SkillCirqle is built on mutual exchange. Tell us what you can offer
            the community and what you're looking to master next.
          </p>
        </div>

        <form
          id="skills-form"
          onSubmit={handleSubmit}
          className="w-full flex mt-10 justify-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full">
            <div className="bg-surface-2 p-5 rounded-xl space-y-4">
              <div className="w-full flex items-center gap-4 pb-2">
                <div className="p-3 bg-primary/20 rounded-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl leading-none">
                    psychology
                  </span>
                </div>

                <div className="flex items-center  justify-between w-full">
                  <div className="flex flex-col ">
                    <h2 className="text-xl font-bold">Skills you can teach</h2>
                    <p className="text-text-secondary text-sm mt-1">
                      What are you an expert in?
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary">
                      {teachSkills.length} / 5
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
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
                  placeholder="e.g. React, UI Design"
                  className="w-full rounded-lg bg-background relative outline-0 px-4 py-3 text-sm"
                />
                <div className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-text-secondary text-lg leading-none">
                    info
                  </span>

                  <p className="text-text-secondary text-xs">
                    Press Enter or comma to add a skill. Click suggested skills
                    below to auto-add.
                  </p>
                </div>
              </div>

              {showTeachDropdown &&
                teachSuggestions.length > 0 &&
                teachSkills.length < 5 && (
                  <div className="">
                    <div className="absolute z-10 w-40 mt-1 bg-surface-2 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                  </div>
                )}

              <div className="flex flex-wrap gap-2">
                {teachSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-primary text-white text-sm"
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

              <div className="flex flex-col gap-2">
                <div className="pb-2  pt-2 border-0 border-b border-text-secondary/20">
                  <h2 className="uppercase text-xs text-text-secondary/50">
                    Suggested for you
                  </h2>
                </div>
              </div>

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
                    className="px-3 py-1 rounded-md bg-text-secondary/20 text-xs cursor-pointer hover:bg-primary/20 hover:text-primary transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface-2 p-5 rounded-xl space-y-4">
              <div className="w-full flex items-center gap-4 pb-2">
                <div className="p-3 bg-primary/20 rounded-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl leading-none">
                    school
                  </span>
                </div>

                <div className="flex items-center  justify-between w-full">
                  <div className="flex flex-col ">
                    <h2 className="text-xl font-bold">
                      Skills you want to learn.
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">
                      What Knowledge do you seek?
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary">
                      {learnSkills.length} / 5
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
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
                  placeholder="e.g. AI, DevOps"
                  className="w-full rounded-lg relative bg-background outline-0 px-4 py-3 text-sm"
                />

                <div className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-text-secondary text-lg leading-none">
                    info
                  </span>

                  <p className="text-text-secondary text-xs">
                    Press Enter or comma to add a skill. Click suggested skills
                    below to auto-add.
                  </p>
                </div>
              </div>

              {showLearnDropdown &&
                learnSuggestions.length > 0 &&
                learnSkills.length < 5 && (
                  <div className="">
                    <div className="absolute z-10 w-40 mt-1 bg-surface-2 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                  </div>
                )}

              <div className="flex flex-wrap gap-2">
                {learnSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-primary text-white text-sm"
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

              <div className="flex flex-col gap-2">
                <div className="pb-2 border-0 border-b border-text-secondary/20">
                  <h2 className="uppercase text-xs text-text-secondary/50">
                    Suggested for you
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 pt-3">
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
                      className="px-3 py-1 rounded-md bg-text-secondary/20 text-xs cursor-pointer hover:bg-primary/20 hover:text-primary transition-all"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="w-full flex items-center gap-6 justify-end">
        <Link
          href="/dashboard"
          className="text-text-secondary hover:text-text-primary py-3"
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
          className="py-3 rounded-md gap-2 bg-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-white px-6"
        >
          {isUpdatingUser ? (
            <>
              <Spinner />
              <p>Updating Profile</p>
            </>
          ) : (
            <p>Complete Profile</p>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadSkills;
