"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ArrowRight, ShieldCheck, Globe, User, Coins } from "lucide-react";
import { useOnboardingNavigation } from "@/lib/onboarding";
import Spinner from "@/components/ui/Spinner";

const Onboarding = () => {
  const { user } = useAuthStore();
  const displayName =
    user?.user_metadata?.username || user?.user_metadata?.full_name || "Member";
  const firstName = displayName.split(" ")[0];
  const { handleMoveToNextOnboardingStep, loading } = useOnboardingNavigation();

  return (
    <div className="relative w-full h-full flex py-4 md:py-0 items-center flex-col bg-background md:px-6 px-4 overflow-y-scroll md:overflow-hidden">
      <div className="relative w-full md:h-full justify-center items-center md:max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-4 transition-all duration-700 ease-out">
        <div className=" md:col-span-8 bg-background backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-24 md:flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <User className="w-3 h-3 text-blue-400 fill-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                Account Created
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-semibold  text-white tracking-tighter leading-[0.9] mb-6">
              WELCOME TO <br />
              <span className=" mt-2 text-text-primary">THE CIRCLE.</span>
            </h1>

            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Hello,{" "}
              <span className="text-white font-medium">{firstName} </span>
              Your account is ready. Set up your profile to help you find the
              perfect skill exchange matches in our global community.
            </p>
          </div>

          <ShieldCheck className="absolute -bottom-10 -right-10 w-64 h-64 text-text-secondary/10 -rotate-12" />
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex-1 bg-text-accent/5 rounded-[40px] p-8 flex flex-col justify-center items-center text-center shadow-2xl shadow-blue-900/20 group">
            <div className="w-16 h-16 bg-background backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-500">
              <Coins className="w-8 h-8 text-text-accent" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-1">
              +3 Skill Tokens
            </h3>
            <p className="text-blue-100 text-xs opacity-80">
              Get 3 skill tokens as a welcome gift after completing profile to
              kickstart your learning journey!
            </p>
          </div>

          <div className="flex-1 bg-surface-2 border border-border rounded-[36px] p-6 flex flex-col items-center gap-4 hover:border-text-secondary transition">
            <div className="p-3 bg-white/5 rounded-full">
              <Globe className="w-5 h-5 text-muted" />
            </div>

            <div className="flex -space-x-3">
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCnUd2vE18EpSpgpaDoPUG0CfYaFit4X6dKslsgf9GxmMkCr_bAWaizW18fjF3wv3tewWBP5-zKfrCNo6FQ4Q9d_pwp1lQV53QE_BdgsH7mI-Mcd7QXppmHUbIFYLgE3rVb5TTZndQ8wP1fhBJL50EWHl4Up5zHaHhotjDzFUW0QfzCd5-poEQcs-4UlLEUZFAgXegk9uyJQhHKR9eUVoJkIVgyeVRuexJmohP5dR53yJ7VRqdshFmpoSJbwJBRr3ZkjdhNQDBQpuQ3",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBcUQK53xnJMiyrm425hOpieys_dsoAwtpmQR3ksZDnQWLg8pDSkuibF8bkPDAxUhnfjdPqoQdOr3J5JayBtFnsh5U-hc63IpxDiw2abj-OenmqsiyS7OG_-K0OHom7hvIkVl0ACGw7MS7dTlzQytB5DkKxmqUOmhmc8_Yu--Zle0ZN-KsLO_XFfft3lyZfrVZqFzBMA1IsARJHAYwdTRi7wBEEFP6y0bV6HbhFJKx-VrFzclrH0Uc2KflY3UeDMiP02jcofGhJDlfR",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCvuQay5nC-Pnlvr7wNJa03eCGk9PR-uuQXFEoBi92F3n12siGbtxJmSQWR9lTKZw9JoqU0-za8RX5pvHe6qzlBaAdNuH2zUWeX_85GsfXPWIUr1onkUREJyPgFiz0S5FKKzczzds8IRCXFeQf4IXxc87LOj3tQRcHI_H0RO9bGg0H_t4B2ZujA1q_NQXNUpFo0-mgg5LjiKHL4wSaGDaCAqCqP3lUGk_vd6Ug7Uux4-s5dNmA5HWkclazkAoBWqOZ0H1yNmzVtJnB3",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-surface transition-transform hover:scale-110"
                />
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 ring-2 ring-text-surface text-[10px] font-bold text-primary">
                +12k
              </div>
            </div>

            <div className="text-center">
              <p className="text-text font-medium">
                Join 12k+ other creators around the globe.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-max flex justify-end items-center py-4 mb-2 md:mb-6 mt-6 md:mt-0">
        <button
          disabled={loading}
          className="flex text-base gap-1 disabled:bg-opacity-50 cursor-not-allowed font-semibold rounded-md items-center justify-center p-3 bg-primary"
          onClick={() => handleMoveToNextOnboardingStep(1)}
        >
          {loading ? (
            <Spinner />
          ) : (
            <>
              <p> Complete Profile</p>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
