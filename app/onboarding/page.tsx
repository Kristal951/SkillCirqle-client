"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ArrowRight, ShieldCheck, Globe, User, Coins } from "lucide-react";
import { useOnboardingNavigation } from "@/lib/onboarding";
import Spinner from "@/components/ui/Spinner";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { KeyboardEvent, MouseEvent, useState } from "react";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { addUserSkillsToRequiredTables } from "@/lib/addUserSkillsToRequiredTables";

const Onboarding = () => {
  const { user } = useAuthStore();
  const displayName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.name ||
    "Member";
  const firstName = displayName.split(" ")[0];
  const { updateUser } = useAuthStore();
  const router = useRouter();

  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await addUserSkillsToRequiredTables(teachSkills, learnSkills);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      const success = await updateUser({
        skills_to_teach: teachSkills,
        skills_to_learn: learnSkills,
        has_onboarded: true,
      });

      if (!success) {
        toast.error("Failed to complete onboarding");
        return;
      }

      router.replace("/onboarding/onboardingCompleted");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="relative w-full h-full flex py-4 md:py-0 items-center flex-col bg-background md:px-6 px-4 overflow-y-scroll md:overflow-hidden">
    //   <div className="relative w-full md:h-full justify-center items-center md:max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-4 transition-all duration-700 ease-out">
    //     <div className=" md:col-span-8 bg-background backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-24 md:flex flex-col justify-between overflow-hidden relative">
    //       <div className="relative z-10">
    //         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
    //           <User className="w-3 h-3 text-blue-400 fill-blue-400" />
    //           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
    //             Account Created
    //           </span>
    //         </div>

    //         <h1 className="text-5xl md:text-6xl font-semibold  text-white tracking-tighter leading-[0.9] mb-6">
    //           WELCOME TO <br />
    //           <span className=" mt-2 text-text-primary">THE CIRQLE.</span>
    //         </h1>

    //         <p className="text-gray-400 text-lg max-w-md leading-relaxed">
    //           Hello{" "}
    //           <span className="text-white font-medium">{firstName}, </span>
    //           Your account is ready. Set up your profile to help you find the
    //           perfect skill exchange matches in our global community.
    //         </p>
    //       </div>

    //       <ShieldCheck className="absolute -bottom-10 -right-10 w-64 h-64 text-text-secondary/10 -rotate-12" />
    //     </div>

    //     <div className="md:col-span-4 flex flex-col gap-6">
    //       <div className="flex-1 bg-accent/10 rounded-[40px] p-8 flex flex-col justify-center items-center text-center group">
    //         <div className="w-16 h-16 bg-background backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-500">
    //           <Coins className="w-8 h-8 text-text-accent" />
    //         </div>
    //         <h3 className="text-text-primary text-2xl font-bold mb-1">
    //           +3 Skill Tokens
    //         </h3>
    //         <p className="text-text-secondary text-sm ">
    //           Get 3 skill tokens as a welcome gift after completing profile to
    //           kickstart your learning journey!
    //         </p>
    //       </div>

    //       <div className="flex-1 bg-surface-2 border border-border rounded-[36px] p-6 flex flex-col items-center gap-4 hover:border-text-secondary transition">
    //         <div className="p-3 bg-white/5 rounded-full">
    //           <Globe className="w-5 h-5 text-muted" />
    //         </div>

    //         <div className="flex -space-x-3">
    //           {[
    //             "https://lh3.googleusercontent.com/aida-public/AB6AXuCnUd2vE18EpSpgpaDoPUG0CfYaFit4X6dKslsgf9GxmMkCr_bAWaizW18fjF3wv3tewWBP5-zKfrCNo6FQ4Q9d_pwp1lQV53QE_BdgsH7mI-Mcd7QXppmHUbIFYLgE3rVb5TTZndQ8wP1fhBJL50EWHl4Up5zHaHhotjDzFUW0QfzCd5-poEQcs-4UlLEUZFAgXegk9uyJQhHKR9eUVoJkIVgyeVRuexJmohP5dR53yJ7VRqdshFmpoSJbwJBRr3ZkjdhNQDBQpuQ3",
    //             "https://lh3.googleusercontent.com/aida-public/AB6AXuBcUQK53xnJMiyrm425hOpieys_dsoAwtpmQR3ksZDnQWLg8pDSkuibF8bkPDAxUhnfjdPqoQdOr3J5JayBtFnsh5U-hc63IpxDiw2abj-OenmqsiyS7OG_-K0OHom7hvIkVl0ACGw7MS7dTlzQytB5DkKxmqUOmhmc8_Yu--Zle0ZN-KsLO_XFfft3lyZfrVZqFzBMA1IsARJHAYwdTRi7wBEEFP6y0bV6HbhFJKx-VrFzclrH0Uc2KflY3UeDMiP02jcofGhJDlfR",
    //             "https://lh3.googleusercontent.com/aida-public/AB6AXuCvuQay5nC-Pnlvr7wNJa03eCGk9PR-uuQXFEoBi92F3n12siGbtxJmSQWR9lTKZw9JoqU0-za8RX5pvHe6qzlBaAdNuH2zUWeX_85GsfXPWIUr1onkUREJyPgFiz0S5FKKzczzds8IRCXFeQf4IXxc87LOj3tQRcHI_H0RO9bGg0H_t4B2ZujA1q_NQXNUpFo0-mgg5LjiKHL4wSaGDaCAqCqP3lUGk_vd6Ug7Uux4-s5dNmA5HWkclazkAoBWqOZ0H1yNmzVtJnB3",
    //           ].map((src, i) => (
    //             <img
    //               key={i}
    //               src={src}
    //               alt=""
    //               className="h-10 w-10 rounded-full object-cover ring-2 ring-surface transition-transform hover:scale-110"
    //             />
    //           ))}
    //           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 ring-2 ring-text-surface text-[10px] font-bold text-primary">
    //             +12k
    //           </div>
    //         </div>

    //         <div className="text-center">
    //           <p className="text-text font-medium">
    //             Join 12k+ other cirqlers around the globe.
    //           </p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   <div className="w-full h-max flex justify-end items-center py-4 mb-2 md:mb-6 mt-6 md:mt-0">
    //     <button
    //       disabled={loading}
    //       className="flex text-base gap-1 disabled:bg-opacity-50 cursor-not-allowed font-semibold rounded-md items-center justify-center p-3 bg-primary"
    //       onClick={() => {
    //         handleMoveToNextOnboardingStep(1);
    //         updateUserOnboardingStepInDB(1);
    //       }}
    //     >
    //       {loading ? (
    //         <Spinner />
    //       ) : (
    //         <>
    //           <p> Complete Profile</p>
    //           <ArrowRight className="w-5 h-5 ml-1" />
    //         </>
    //       )}
    //     </button>
    //   </div>
    // </div>
    <div className="w-full h-full p-6 flex flex-col gap-10">
      <div className="flex flex-col gap-1 mb-4 items-center justify-center">
        <h1 className="text-4xl font-bold text-text-primary">
          Define your curriculum
        </h1>
        <p className="text-text-secondary text-sm">
          Connect your experience with your learning goals.
        </p>
      </div>

      <div className="w-full flex items-start justify-center gap-8 flex-col lg:flex-row">
        <div className="max-w-xl w-full bg-surface/50 p-6 border border-border/50 rounded-xl">
          <div className="w-full">
            <div className="w-full flex items-end justify-between">
              <div className="flex w-full flex-col gap-1">
                <h2 className="text-xl font-bold text-text-primary">
                  What skills can you teach?
                </h2>
                <p className="text-text-secondary text-sm">
                  Add up to 5 skills you're proficient in.
                </p>
              </div>
              <div>
                <p className="uppercase text-xs font-semibold text-text-secondary tracking-wide">
                  {teachSkills.length}/5
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col mt-6">
              <div className="w-full flex bg-surface/50 items-center rounded-xl pl-3 pr-1 py-1 border border-transparent focus-within:border-primary/50 transition-all overflow-hidden">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-muted text-xl">
                    psychology
                  </span>
                </div>

                <input
                  value={teachInput}
                  onChange={(e) => setTeachInput(e.target.value)}
                  onKeyDown={(e) =>
                    handleKeyDown(
                      e,
                      teachInput,
                      teachSkills,
                      setTeachSkills,
                      setTeachInput,
                    )
                  }
                  type="text"
                  placeholder="e.g: React, Public Speaking...."
                  aria-label="Search teaching skills"
                  className="w-full px-3 py-2 bg-transparent outline-none text-sm placeholder:text-muted"
                />

                <button
                  type="button"
                  disabled={
                    !teachSkills ||
                    teachSkills.length >= 5 ||
                    !teachInput.trim()
                  }
                  onClick={() =>
                    handleAddSkill(
                      teachInput,
                      teachSkills,
                      setTeachSkills,
                      setTeachInput,
                    )
                  }
                  className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                >
                  Add Skill
                </button>
              </div>

              <div className="w-full flex flex-col gap-2.5 px-1 pt-6">
                {teachSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 bg-primary/10 w-full border border-primary/30 text-text-primary text-sm font-medium pl-4 pr-2 py-2.5 rounded-lg transition-all hover:border-primary/50 hover:bg-primary/15"
                  >
                    <span className="truncate">{skill}</span>

                    <div className="w-max flex gap-3 items-center shrink-0">
                      <button
                        type="button"
                        className="text-xs flex items-center gap-1.5 bg-background border border-border hover:bg-muted/10 text-text-primary px-2.5 py-1 rounded-md font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined icon-filled text-[14px]!">
                          verified
                        </span>
                        Verify
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(i, teachSkills, setTeachSkills)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-full group hover:bg-rose-500/10 text-muted transition-colors"
                        aria-label={`Remove ${skill}`}
                      >
                        <span className="material-symbols-outlined text-base group-hover:text-rose-500 transition-colors">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-xl w-full bg-surface/50 p-6 border border-border/50 rounded-xl">
          <div className="w-full">
            <div className="w-full flex items-end justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-text-primary">
                  What skills do you want to learn?
                </h2>
                <p className="text-text-secondary text-sm">
                  Add up to 5 skills you want to master.
                </p>
              </div>
              <div>
                <p className="uppercase text-xs font-semibold text-text-secondary tracking-wide">
                  {learnSkills.length}/5
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col mt-6">
              <div className="w-full flex bg-surface/50 items-center rounded-xl pl-3 pr-1 py-1 border border-transparent focus-within:border-accent/50 transition-all overflow-hidden">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-muted text-xl">
                    school
                  </span>
                </div>

                <input
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  onKeyDown={(e) =>
                    handleKeyDown(
                      e,
                      learnInput,
                      learnSkills,
                      setLearnSkills,
                      setLearnInput,
                    )
                  }
                  type="text"
                  placeholder="e.g: Photography, Cybersecurity...."
                  aria-label="Search target learning skills"
                  className="w-full px-3 py-2 bg-transparent outline-none text-sm placeholder:text-muted"
                />

                <button
                  type="button"
                  disabled={
                    !learnSkills ||
                    learnSkills.length >= 5 ||
                    !learnInput.trim()
                  }
                  onClick={() =>
                    handleAddSkill(
                      learnInput,
                      learnSkills,
                      setLearnSkills,
                      setLearnInput,
                    )
                  }
                  className="bg-accent text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap hover:bg-accent/90 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                >
                  Add Skill
                </button>
              </div>

              <div className="w-full flex flex-col gap-2.5 px-1 pt-6">
                {learnSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 bg-accent/10 w-full border border-accent/30 text-text-primary text-sm font-medium pl-4 pr-2 py-2.5 rounded-lg transition-all hover:border-accent/50 hover:bg-accent/15"
                  >
                    <span className="truncate">{skill}</span>

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(i, learnSkills, setLearnSkills)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-full group hover:bg-rose-500/10 text-muted transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <span className="material-symbols-outlined text-base group-hover:text-rose-500 transition-colors">
                        close
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-end mt-auto pt-4 border-t border-border/30">
        <button
          type="button"
          onClick={(e) => handleSubmit(e)}
          disabled={loading}
          className="bg-primary disable:opacity-50 text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          {loading ? <Spinner size={20} /> : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
