"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleHelp,
  Coins,
  MessageCircle,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    title: "Getting Started",
    description: "Set up your profile and discover SkillCirqle.",
    articles: 8,
    icon: Rocket,
    iconClass: "text-violet-600 bg-violet-50",
    borderClass: "hover:border-violet-300",
  },
  {
    title: "Skill Exchanges",
    description: "Learn how proposals, swaps and exchanges work.",
    articles: 10,
    icon: ArrowRight,
    iconClass: "text-pink-600 bg-pink-50",
    borderClass: "hover:border-pink-300",
  },
  {
    title: "SkillCredits",
    description: "Understand earning, spending and managing credits.",
    articles: 7,
    icon: Coins,
    iconClass: "text-amber-600 bg-amber-50",
    borderClass: "hover:border-amber-300",
  },
  {
    title: "Sessions",
    description: "Schedule, manage and join learning sessions.",
    articles: 9,
    icon: CalendarDays,
    iconClass: "text-blue-600 bg-blue-50",
    borderClass: "hover:border-blue-300",
  },
];

const popularArticles = [
  {
    title: "How SkillCredits work",
    description: "Learn how you earn, use and manage SkillCredits.",
    readTime: "3 min read",
    icon: Coins,
    iconClass: "text-violet-600 bg-violet-50",
  },
  {
    title: "Sending your first proposal",
    description: "Connect with someone and start your learning journey.",
    readTime: "2 min read",
    icon: Send,
    iconClass: "text-pink-600 bg-pink-50",
  },
  {
    title: "How skill exchanges work",
    description: "Teach something. Learn something. Grow together.",
    readTime: "4 min read",
    icon: Users,
    iconClass: "text-amber-600 bg-amber-50",
  },
];

const allTopics = [
  { title: "Getting Started", articles: 8, icon: Rocket },
  { title: "Skills & Matching", articles: 12, icon: Sparkles },
  { title: "Proposals", articles: 10, icon: ArrowRight },
  { title: "SkillCredits", articles: 7, icon: Coins },
  { title: "Sessions", articles: 9, icon: CalendarDays },
  { title: "Messaging", articles: 11, icon: MessageCircle },
  { title: "Account & Security", articles: 8, icon: ShieldCheck },
  { title: "Troubleshooting", articles: 10, icon: CircleHelp },
];

const HelpCenter = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-text-primary relative">
      <Link href="/" className="p-2 rounded-full hover:bg-surface/50 absolute top-4 right-4 sm:top-6 sm:right-6 z-50"> 
        <X className="w-5 h-5 text-text-secondary"/>
      </Link>
      <div className="">
        <section className="px-6 pb-20 pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mt-7 text-5xl font-bold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
              How can we help{" "}
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                you today?
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Find answers, guides and everything you need to make the most of
              SkillCirqle.
            </p>

            <div className="relative mx-auto mt-10 max-w-3xl">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />

              <input
                type="text"
                placeholder="Search for answers, guides and everything SkillCirqle..."
                className="h-16 w-full rounded-2xl bg-surface/50 pl-14 pr-20 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
              />

              <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-text-secondary sm:block">
                Ctrl /
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="mr-1 text-text-secondary">Popular searches:</span>

              {["SkillCredits", "Send proposal", "Join session", "Cancel exchange"].map(
                (item) => (
                  <button
                    key={item}
                    className="rounded-lg border border-primary/20 bg-surface/50 px-3 py-1.5 text-xs text-text-secondary transition hover:border-primary hover:text-text-primary hover:bg-primary"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                What do you need help with?
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Explore guides for every part of SkillCirqle.
              </p>
            </div>

            <button className="hidden items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 sm:flex">
              View all topics
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.title}
                  className={`group min-h-50 rounded-2xl border border-primary/20 bg-surface/50 p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 ${category.borderClass}`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${category.iconClass}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-semibold">{category.title}</h3>

                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {category.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-text-secondary group-hover:text-text-primary">
                      {category.articles} articles
                    </span>

                    <ArrowRight className="h-4 w-4 text-text-secondary transition group-hover:translate-x-1 group-hover:text-text-primary" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-7xl px-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />

              <h2 className="text-xl font-semibold">Popular right now</h2>
            </div>

            <p className="mt-1 text-sm text-text-secondary">
              Answers to the things members ask about most.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {popularArticles.map((article) => {
              const Icon = article.icon;

              return (
                <button
                  key={article.title}
                  className="group flex items-start gap-4 rounded-2xl border border-primary/20 bg-surface/50 p-5 text-left transition-all hover:border-primary"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${article.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold transition">
                      {article.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {article.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-text-secondary group-hover:text-text-primary">
                        ◷ {article.readTime}
                      </span>

                      <ArrowRight className="h-4 w-4 text-text-secondary transition group-hover:translate-x-1 group-hover:text-text-primary" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-7xl px-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Browse all topics</h2>

            <p className="mt-1 text-sm text-text-secondary">
              Find detailed guides and answers across SkillCirqle.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-2xl border border-primary/20 bg-surface/50 sm:grid-cols-2 lg:grid-cols-4">
            {allTopics.map((topic) => {
              const Icon = topic.icon;

              return (
                <button
                  key={topic.title}
                  className="group flex items-center gap-3 border-b border-r border-primary/20 p-5 text-left transition hover:bg-surface"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-text-primary transition group-hover:bg-text-primary group-hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">{topic.title}</p>

                    <p className="mt-1 text-xs text-slate-400">
                      {topic.articles} articles
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-surface px-6 py-10 sm:px-10">
            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-text-primary">
                  <MessageCircle className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold">
                    Still need help?
                  </h2>

                  <p className="mt-2 text-sm text-text-text-secondary">
                    Our support team is here to help you get back on track.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-text-primary transition hover:bg-primary/80">
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </button>

                <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-text-primary px-5 text-sm font-medium text-primary transition hover:bg-text-primary/90">
                  <CircleHelp className="h-4 w-4" />
                  Report a Problem
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HelpCenter;