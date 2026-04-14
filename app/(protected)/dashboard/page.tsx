"use client";

import SkillCard from "@/components/dashboard/SkillCard";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useTokenStore } from "@/store/useTokenStore";
import {
  Search,
  MapPin,
  History,
  ChevronRight,
  Gift,
  ArrowRight,
  Trophy,
  ChevronLeft,
  Coins,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function Dashboard({ loggingOut }: { loggingOut: boolean }) {
  const router = useRouter();
  const { step, totalSteps } = useOnboardingStore();
  const { theme } = useTheme();

  const safeStep = step ?? 0;

  const progressPercentage =
    totalSteps > 0 ? Math.round((safeStep / totalSteps) * 100) : 0;

  const isCompleted = progressPercentage >= 100;

  const dummySkillData = [
    {
      title: "AI Foundations",
      desc: "Master the architecture of Large Language Models and prompt engineering.",
      usersAmount: 20,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA9rtp8rZIDXM1BhnUNoy4gi6DrYCxK3IpsKPWdmh5idIHMuc75RbFsV5fi0ehAaB-PxGbefmg3rqtbNIS5uZzuvzApOu6q1XG5JuMu51E0yPxa3p5hgEBWjPpRsWmcDBXgC2ZszP5V3i1IoA57CLwoAZMk7le3ZSz4A9mEXThs_0RSnAGAPi0NGw1EStGClLqmFWDzYz8JOy8PPyB9-O2aaoOqAQxogIOUoGuYwlwsdLTGHpNfAXEa0e_gFSMGPnllYQ3A1sFN8zGk",
    },
    {
      title: "Docker Mastery",
      desc: "Streamline your development lifecycle by containerizing applications.",
      usersAmount: 15,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDhy_Yi6uPcUNeCI_M-taS6jtv16jqeu5Izak1CzyO7t9HRniAO_mUaczmzZK9x775b8AuWtF4JiirPCbzra5Bcw82XLkiycqJlKmdf2j9rt3i8YBorXAJBz6PwxGBxmX3IqUKeOIY_3hxMdVDvN5TX8vJSLeVJpO1kugwVl5MhfClxRrG50PSc4ss0mlSNtycIUZ6fFNIX6lEUtZiXGQRdWnEXZ12bolrG5eZqylNSY2r_wuau1_GQun4_sxVoFR3q2omy0AYWnQ7U",
    },
    {
      title: "Node.js Backend",
      desc: "Master scalable backend architecture and real-time applications.",
      usersAmount: 8,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCx2ndQVl97L3y-9Jje87cpXh3sXzB0sqHNwYQCy92BH4nouwJag0rEUNrYJjxmUcL51oomza-4G1yeCpb7odjGcL77XCX9nQRqwz-3OMkpxI3En500JUGAj7jOjqJ24otZzk3gnFJcjzhzKaErouT5f99k7YeAVlq-1k5e8NVGBwyIfnjGGrqnBcXS3gSsgYRkriCAmTr-EYhNx644Pn8wW4T_7DQCOBE7v8CcYATxYd236YDF8ZUmh0fjwjghTLoP6ukwQ6rfiaYK",
    },
  ];

  const dummyAroundYouData = [
    { title: "Financial Strategy", icon: "data_exploration", members: 42 },
    { title: "Product Management", icon: "architecture", members: 30 },
    { title: "Digital Photography", icon: "camera", members: 50 },
  ];

  const dummyEventsData = [
    {
      userName: "Aisha",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBmjuv_nVm-lCMbnW8LyoF02GXMzcLPC7PT691u93WcgaLiEuiNr_m5ZTEDIP6wN1ubrONQ2QaQyC0uIEa91tFCmFnC5QrpiqnQvURwxxmwWKLhyTbmTx04FwJ_o7HAiqgsgjNcgXSISwR9uWe_v9uYz2pmV9QeTPkGgsixSUkvNCr3njZEDu2erLgCiLRgkfWcJ3BYM_25UQiOtsjp0ulrnpM8NiZb6XyL8dhhsMZ-qrYIWrL5tojkyVk9R6IShYjvlRj6pyhOU-jD",
      event: "completed a skill exchange",
      skill: "Mastered Docker Mastery",
      timeStamp: "2h ago",
    },
    {
      userName: "Carlos",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCnrC_hIgkD5lG0GYlvz_Gd9u5ri4SQCExCzndhqmmSXmrnviPV0alsomAD8UxXPCA72ckoR-E4BoGuhutvQMC1mbyKVmuyE80ZYs0hbeivkhW9FBCn8SwcRkNZjahkVw4aCf77c4ImCPkauIN6XfbQTmRcyQfj2ZTt2Zlg5CYNDpwBxKhC_6UvWf5pMBkd7XsUEFBCy8PGWpdHYwThevBA2KP1DcdKyo4hMi4yO31iSg9lLD67jC3x_1SgDdreKUTi8abIG6YdEDDw",
      event: "received 5-star rating",
      skill: "From a mentorship Session",
      timeStamp: "5h ago",
    },
    {
      userName: "John Doe",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBmjuv_nVm-lCMbnW8LyoF02GXMzcLPC7PT691u93WcgaLiEuiNr_m5ZTEDIP6wN1ubrONQ2QaQyC0uIEa91tFCmFnC5QrpiqnQvURwxxmwWKLhyTbmTx04FwJ_o7HAiqgsgjNcgXSISwR9uWe_v9uYz2pmV9QeTPkGgsixSUkvNCr3njZEDu2erLgCiLRgkfWcJ3BYM_25UQiOtsjp0ulrnpM8NiZb6XyL8dhhsMZ-qrYIWrL5tojkyVk9R6IShYjvlRj6pyhOU-jD",
      event: "completed a skill exchange",
      skill: "Mastered Docker Mastery",
      timeStamp: "2h ago",
    },
  ];

  const dummyChallengesData = [
    {
      title: "30-day Coding Challenge",
      desc: "Sharpen your coding skills with daily challenges and peer feedback.",
      image:
        "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTxFlB2OU2jordpneCaxfW8WNAWVIlr9m3WEoyjiWg5p4kooUORXQ-Ta5DYhrDH",
      reward: 15,
      daysLeft: 10,
      numberOfParticipants: 120,
    },
    {
      title: "Design a logo in 30 minutes",
      desc: "Put your design skills to the test with a time-bound logo creation challenge.",
      image:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT-FxCnZ9-D9D7Jn4meCnqNdrnMeq8uj8grZNAS7kQrCXyvoq6dJj0F3nFHojpm",
      reward: 30,
      daysLeft: 15,
      numberOfParticipants: 120,
    },
    {
      title: "Write a short story in 1 hour",
      desc: "Challenge your creativity with a one-hour short story writing sprint.",
      image:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRYvGl9kvwXKnmC6clmSieiKKZc_MdXPKrJ2lbB8VlFifkt8EXPDsw2O-ovEhDx",
      reward: 20,
      daysLeft: 5,
      numberOfParticipants: 120,
    },
  ];
  return (
    <div className="w-full mx-auto px-2 md:px-6 py-8 flex flex-col gap-12">
      {!isCompleted && (
        <div className="w-full p-6 md:p-8 rounded-3xl border border-accent/20 bg-linear-to-br from-accent/6 to-transparent flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="p-3 rounded-xl bg-accent/15 text-accent">
              <Gift size={28} />
            </div>

            <div>
              <h3 className="text-lg text-foreground font-semibold">
                Get 3 Skill Tokens
              </h3>
              <p className="text-sm text-text-secondary">
                Complete your profile to unlock your rewards.
              </p>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-foreground">Progress</span>
              <span className="text-accent font-semibold">
                {progressPercentage}%
              </span>
            </div>

            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <button
              disabled={isCompleted}
              onClick={() => router.push("/onboarding")}
              className="w-full py-2.5 bg-accent disabled:cursor-not-allowed disabled:bg-accent/30 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
            >
              Continue Setup
            </button>
          </div>
        </div>
      )}

      <section className="relative w-full p-4 md:p-10 bg-primary rounded-md overflow-hidden">
        <div className="relative z-10 flex flex-col gap-8 text-primary-foreground">
          <div>
            <h1 className="text-3xl md:text-4xl text-white font-bold">
              What will you master today?
            </h1>
            <p className="text-white/70 max-w-lg">
              Learn from people. Teach what you know. Grow faster.
            </p>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-background text-foreground outline-none focus:ring-4 focus:ring-white/20"
              placeholder="Search skills..."
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between">
          <div className="w-max flex flex-col gap-2">
            <p className="uppercase text-sm text-text-secondary">
              Curated for you
            </p>
            <div className="flex items-center gap-3">
              <h2 className="md:text-2xl text-xl font-semibold text-foreground">
                Suggested Skills
              </h2>
            </div>
          </div>
          <button className="text-primary flex gap-1 items-center text-sm hover:underline">
            See all
            <ArrowRight className="text-sm" />
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {dummySkillData.map((info, i) => (
            <div key={i} className="min-w-75 transition">
              <SkillCard info={info} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-5 bg-surface px-4 py-8 rounded-xl">
          <div className="flex items-center gap-3">
            <MapPin className="text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Popular Around You
            </h2>
          </div>

          {dummyAroundYouData.map((item, i) => (
            <ActivityRow
              key={i}
              title={item.title}
              sub={`${item.members} members`}
              icon={item.icon}
            />
          ))}
        </div>

        <div className="space-y-5 bg-surface px-8 py-8 rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <History className="text-primary" size={20} />
            <h2 className="text-xl font-semibold text-foreground">
              Recent Activities
            </h2>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-8.5 top-2 bottom-2 w-0.5 bg-border -translate-x-1/2"></div>

            {dummyEventsData.map((event, i) => (
              <div key={i} className="flex gap-4 relative z-10 items-center">
                <div className="w-18 h-18 border-border border-3 rounded-full ring-4 ring-surface overflow-hidden shrink-0 shadow-sm">
                  <img
                    alt={event.userName}
                    className="w-full h-full object-cover"
                    src={event.image}
                  />
                </div>

                <div className="flex flex-col gap-0.5 pt-1">
                  <p className="text-sm leading-snug">
                    <span className="font-bold text-lg text-text-primary">
                      {event.userName}
                    </span>{" "}
                    <span className="text-white/80 text-sm">{event.event}</span>
                  </p>
                  <p className="text-xs text-text-secondary font-medium">
                    {event.skill} <span className="mx-1">•</span>{" "}
                    {event.timeStamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="w-full flex">
        <div className="space-y-8 w-full">
          <div className="w-full flex items-center justify-between">
            <div className="w-max flex flex-col gap-2">
              <p className="uppercase text-sm text-text-secondary">
                Time limited events
              </p>
              <div className="flex items-center gap-3">
                <Trophy className="text-primary" />
                <h2 className="md:text-2xl text-xl font-semibold text-foreground">
                  Active Challenges
                </h2>
              </div>
            </div>

            <div className="w-max ">
              <div className="w-full md:flex hidden gap-6 ">
                <button className="p-2 rounded-full bg-surface hover:bg-primary">
                  <ChevronLeft />
                </button>
                <button className="p-2 rounded-full bg-surface hover:bg-primary">
                  <ChevronRight />
                </button>
              </div>

              <p className="md:hidden">View all</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dummyChallengesData.map((challenge, i) => (
              <article
                key={i}
                className={`bg-surface p-2 pb-6 rounded-xl overflow-hidden group flex flex-col h-full transition-all ${
                  theme === "light"
                    ? "border border-border shadow-sm"
                    : "border border-white/5"
                }`}
              >
                {/* Image Container */}
                <div className="relative h-64 w-full rounded-lg overflow-hidden shrink-0">
                  <img
                    alt={challenge.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src={challenge.image}
                  />
                  {/* Gradient Overlay - ensuring text is readable */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
                    <div className="w-full">
                      <h4 className="text-white text-xl font-bold leading-tight line-clamp-1">
                        {challenge.title}
                      </h4>
                      <p className="text-sm text-white/80 line-clamp-2 mt-1">
                        {challenge.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between py-6 px-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                      Ends in {challenge.daysLeft} days
                    </p>
                    <p className="text-[13px] text-foreground/60">
                      {challenge.numberOfParticipants} participants
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-full">
                    <Coins className="text-accent" size={14} />
                    <span className="text-sm text-accent font-bold">
                      +{challenge.reward}
                    </span>
                  </div>
                </div>

                <div className="w-full px-3 mt-auto">
                  <button className="button-primary">Participate Now</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {loggingOut && (
        <div className="fixed inset-0 z-100 bg-black/70 flex items-center justify-center">
          <Spinner size={48} />
        </div>
      )}
    </div>
  );
}

function ActivityRow({ title, sub, icon }: any) {
  return (
    <div
      className={`p-4 rounded-xl group bg-surface flex justify-between items-center `}
    >
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 bg-background flex items-center justify-center rounded-lg">
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        <div>
          <h3 className="text-lg text-text-primary font-medium">{title}</h3>
          <p className="text-sm text-text-secondary">{sub}</p>
        </div>
      </div>

      <button className="button-secondary">Join</button>
    </div>
  );
}
