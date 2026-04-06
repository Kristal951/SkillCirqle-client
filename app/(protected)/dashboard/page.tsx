"use client";

import SkillCard from "@/components/dashboard/SkillCard";
import Spinner from "@/components/ui/Spinner";
import { logout } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import {
  Search,
  MapPin,
  History,
  ChevronRight,
  Gift,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const { step, totalSteps } = useOnboardingStore();

  const safeStep = step ?? 0;

  const progressPercentage =
    totalSteps > 0 ? Math.round((safeStep / totalSteps) * 100) : 0;

  const isCompleted = progressPercentage >= 100;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const dummySkillData = [
    {
      title: "AI Foundations",
      desc: "Master the architecture of Large Language Models and prompt engineering.",
      usersAmount: 20,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBGMFAHSdzx8DpwAH9rD83E7Lavm2MDGMlEbKfZztWHiqyysLGc6rQppTE8Dz2oO7CLua4XUQoGiQIi2MLgtujP0GsvnZFqE-b5VEFa8e7mFcJ2NnRhbFdmhGup3TtuA0HfIO5T4FxOnTDUjaRsutRNrPEdbQYPGQ0fZaqjgp0xeIj-FCu-pS6_JrSNHGKL0v55jFeKyjgUDpiV8oqZ-ayZdsjdcNxvqmk0b7u-JFdLjF5qEH7m5XOJwlLjmY5qib6NPnwsnv0-SrWy",
    },
    {
      title: "Docker Mastery",
      desc: "Streamline your development lifecycle by containerizing applications.",
      usersAmount: 15,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuArdRJU5voU-IOhtvXiwCNU-dG05mB1fFN4e-lLsGK_LDHo1mJPZMIXJ5ZG371nGhJBb1YN6FlIxS0PKuzQ0ymwyA76Qlo73u3vv0UZsFpJywYG5GUfqZGaqaSFhj5bkjCD0xa2wVBIj1FYCuJ-Cr-CZgoJF1VQNY66XHeSI4SGu5SyIrXCqs0HLHwaPwqpVymUFEYYIqgzSLeO7meBG99MGi2hLrn4RVZsF2C1xwpDyRLhLpOFe0GUKJT1_xldM5BmSkB2al_AnBIt",
    },
    {
      title: "Node.js Backend",
      desc: "Master scalable backend architecture and real-time applications.",
      usersAmount: 8,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBGMFAHSdzx8DpwAH9rD83E7Lavm2MDGMlEbKfZztWHiqyysLGc6rQppTE8Dz2oO7CLua4XUQoGiQIi2MLgtujP0GsvnZFqE-b5VEFa8e7mFcJ2NnRhbFdmhGup3TtuA0HfIO5T4FxOnTDUjaRsutRNrPEdbQYPGQ0fZaqjgp0xeIj-FCu-pS6_JrSNHGKL0v55jFeKyjgUDpiV8oqZ-ayZdsjdcNxvqmk0b7u-JFdLjF5qEH7m5XOJwlLjmY5qib6NPnwsnv0-SrWy",
    },
  ];

  const dummyAroundYouData = [
    { title: "Financial Strategy", icon: "data_exploration", members: 42 },
    { title: "Product Management", icon: "architecture", members: 30 },
    { title: "Digital Photography", icon: "camera", members: 50 },
  ];

  const dummyEventsData = [
    { message: "Aisha completed an exchange with Carlos", icon: "swap_horiz" },
    { message: "Carlos received a 5-star rating", icon: "star" },
    { message: "New user John joined the cirqle", icon: "person_add" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-6 py-8 flex flex-col gap-12">
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
          <h2 className="md:text-2xl text-lg font-semibold text-foreground">
            Suggested for you
          </h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-5">
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

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <History className="text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Recent Activity
            </h2>
          </div>

          {dummyEventsData.map((event, i) => (
            <ActivityRow
              key={i}
              title={event.message}
              sub="Recently"
              icon={event.icon}
              hideChevron
            />
          ))}
        </div>
      </div>

      {loggingOut && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <Spinner size={48} />
        </div>
      )}
    </div>
  );
}

function ActivityRow({ title, sub, icon, hideChevron = false }: any) {
    const {theme} = useTheme()
  return (
    <div className={`p-4 rounded-xl bg-surface ${theme === 'light' ? 'border border-border' : ''} flex justify-between items-center hover:border hover:border-border transition`}>
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-lg">
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        <div>
          <h3 className="text-sm text-text-primary font-medium">{title}</h3>
          <p className="text-xs text-text-secondary">{sub}</p>
        </div>
      </div>

      {!hideChevron && <ChevronRight size={18} />}
    </div>
  );
}
