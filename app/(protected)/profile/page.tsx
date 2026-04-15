"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { Coins } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { theme } = useTheme();

  const statCardData = [
    {
      title: "Exchanges",
      icon: "swap_horiz",
      value: user?.exchanges,
    },
    {
      title: "Rating",
      icon: "star",
      value: user?.rating,
    },
  ];

  const SkillsCard = ({
    title,
    skills,
    icon,
    color,
  }: {
    title: string;
    skills: string[];
    icon: string;
    color: string;
  }) => {
    return (
      <div className="col-span-2 p-6 h-max rounded-md bg-surface">
        <div className="h-full flex flex-col w-full gap-8">
          <div className="w-full flex gap-2 items-center justify-between">
            <div className="w-max h-max flex items-center gap-2">
              <div className="w-10 h-10 flex items-center bg-background rounded-md justify-center">
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>

            <p className="text-text-secondary">{skills.length}/5</p>
          </div>

          <div className="flex flex-wrap gap-4">
            {(skills?.length ?? 0) > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={index}
                  className={`py-1 rounded-full px-4 bg-${color}/20 border border-${color}/30`}
                >
                  <p className={`text-${color}`}>{skill}</p>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl">No skill yet.</h2>
                <p className="text-text-secondary text-sm">
                  Complete Profile Setup to add skil
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative mb-12 w-full md:px-4  h-full flex flex-col py-6">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
        <div className="w-full flex flex-col">
          <div className="lg:flex flex flex-col lg:flex-row h-max md:items-end md:justify-between">
            <div className="flex flex-col lg:flex-row lg:flex items-center w-full justify-center md:justify-start gap-5">
              <div className="w-40 h-40 group rounded-full border-primary border-2 bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-semibold">
                {user?.avatar_url ? (
                  <img
                    src={user?.avatar_url}
                    alt="Profile Image"
                    className="w-full group-hover:scale-110 transition-all h-full object-cover"
                  />
                ) : (
                  <div>
                    {user?.avatar_url || user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="h-full flex flex-col items-center md:items-center lg:items-start md:w-max justify-between gap-2">
                <h2
                  className={`text-5xl font-bold  lg:text-left  ${theme === "light" ? "text-primary" : "text-white"}`}
                >
                  {user?.name}
                </h2>
                <p className="max-w-lg text-lg text-center md:text-center lg:text-left leading-relaxed text-text-secondary">
                  {user?.bio}
                </p>
              </div>
            </div>

            <div className="flex gap-8 w-full pt-10 justify-center lg:justify-end">
              <button className="px-4 flex items-center justify-center gap-2 py-3 bg-primary dark:text-white rounded-md border-border border text-primary font-bold shadow-lg hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">person_edit</span>
                Edit Profile
              </button>
              <button className="px-4 py-3 rounded-md border gap-2 border-border flex items-center justify-center text-text-primary font-bold hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined">share</span>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden w-full grid-cols-3 md:grid py-10 gap-8">
        {statCardData.map((info, i) => (
          <div
            key={i}
            className="col-span-1 p-6 rounded-md flex items-center gap-6 hover:bg-surface-container-high transition-colors bg-surface"
          >
            <div className="bg-background w-12 h-12 flex items-center justify-center rounded-xl">
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                {info.icon}
              </span>
            </div>
            <div>
              <h2
                className={`text-3xl font-bold ${theme === "light" ? "" : "text-white"}`}
              >
                {info.title === "Rating"
                  ? (info?.value ?? 0).toFixed(2)
                  : (info.value ?? 0)}
              </h2>
              <h3 className="text-sm uppercase tracking-wider font-semibold">
                {info.title}
              </h3>
            </div>
          </div>
        ))}
        <div className="col-span-1 p-6 rounded-md flex items-center gap-6 hover:bg-surface-container-high transition-colors bg-surface">
          <div className="bg-background w-12 h-12 flex items-center justify-center rounded-xl">
            <Coins />
          </div>
          <div>
            <h2
              className={`text-3xl font-bold ${theme === "light" ? "" : "text-white"}`}
            >
              {user?.wallet?.skillTokens || 0}
            </h2>
            <h3 className="text-sm uppercase tracking-wider font-semibold">
              Credits
            </h3>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:hidden">
        <div className=" p-4 grid grid-cols-3 rounded-md bg-surface mt-6 mb-6 place-content-center">
          {statCardData.map((info, i) => (
            <div className="colo-span-1 border-r border-border" key={i}>
              <div className="flex w-full flex-col items-center justify-center">
                <h2 className="text-[10px] uppercase tracking-wider font-semibold">
                  {info.title}
                </h2>
                <p className="text-xl font-bold">
                  {" "}
                  {info.title === "Rating"
                    ? (info?.value ?? 0).toFixed(2)
                    : (info.value ?? 0)}
                </p>
              </div>
            </div>
          ))}
          <div className="col-span-1">
            <div className="w-full flex items-center flex-col justify-center">
              <h3 className="text-[10px] uppercase tracking-wider font-semibold">
                Tokens
              </h3>
              <p className="text-xl font-bold">
                {" "}
                {user?.wallet?.skillTokens || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className=" w-full grid lg:grid-cols-3 gap-8">
        <div className="col-span-2 grid gap-8">
          <SkillsCard
            title="Skills i can teach"
            skills={user?.skills_to_teach || []}
            icon="psychology"
            color="primary"
          />
          <SkillsCard
            title="Skills i want to learn"
            skills={user?.skills_to_learn || []}
            icon="school"
            color="accent"
          />
        </div>

        <div className="col-span-1 bg-surface p-4 h-90 rounded-md">
          {(user?.rating || 0) > 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold">{user?.rating.toFixed(1)}</h1>
              <p className="text-sm text-muted-foreground mt-2">Your Reviews</p>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col gap-2 items-center justify-center">
              <h1
                className={`text-2xl font-bold ${theme === "light" ? "" : "text-white"}`}
              >
                No Reviews Yet.
              </h1>
              <h3 className="text-sm text-text-secondary">
                Cirqlise more to gain reviews.
              </h3>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
