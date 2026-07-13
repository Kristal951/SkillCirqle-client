"use client";
import ProfileQR from "@/components/profile/ProfileQR";
import SharePopoverModal from "@/components/profile/SharePopOverModal";
import SkillsCard from "@/components/profile/SkillsCard";
// import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { Coins } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useState } from "react";
import SwapHoriz from "@material-symbols/svg-400/outlined/swap_horiz-fill.svg";
import Settings from "@material-symbols/svg-400/outlined/settings.svg";
import Share from "@material-symbols/svg-400/outlined/share.svg";
import KeyboardArrowUp from "@material-symbols/svg-400/outlined/keyboard_arrow_up.svg";
import KeyboardArrowDown from "@material-symbols/svg-400/outlined/keyboard_arrow_down.svg";
// import StarFill from "@material-symbols/svg-400/outlined/star-fill.svg";
import Star from "@material-symbols/svg-400/outlined/star.svg";
import Psychology from "@material-symbols/svg-400/outlined/psychology.svg";
import School from "@material-symbols/svg-400/outlined/school.svg";
import Reviews from "@material-symbols/svg-400/outlined/reviews.svg";
// import LocalFireDepartment from "@material-symbols/svg-400/outlined/local_fire_department.svg";
// import LocalFireDepartmentFill from "@material-symbols/svg-400/outlined/local_fire_department-fill.svg";
// import Check from "@material-symbols/svg-400/outlined/check.svg";
// import History from "@material-symbols/svg-400/outlined/history.svg";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const statCardData = [
    {
      title: "Exchanges",
      icon: SwapHoriz,
      value: user?.exchanges,
    },
    {
      title: "Rating",
      icon: Star,
      value: user?.rating,
    },
  ];

  return (
    <section className="relative w-full md:px-4 h-full flex flex-col py-6 px-4">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
        <div className="w-full flex flex-col">
          <div className="lg:flex flex flex-col lg:flex-row h-max md:items-end md:justify-between">
            <div className="flex flex-col lg:flex-row lg:flex items-center w-full justify-center md:justify-start gap-5">
              <div className="w-35 z-10 h-35 group rounded-full border-primary border-2 bg-primary/20 overflow-hidden flex items-center justify-center text-primary font-semibold">
                {user?.avatar_url ? (
                  <img
                    src={user?.avatar_url}
                    alt="Profile Image"
                    className="w-full z-10 group-hover:scale-110 transition-all h-full object-cover"
                  />
                ) : (
                  <div>
                    {user?.avatar_url || user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="h-full flex flex-col items-center md:items-center lg:items-start md:w-max justify-between gap-2">
                <h2
                  className={`text-4xl font-bold  lg:text-left  ${theme === "light" ? "text-primary" : "text-white"}`}
                >
                  {user?.name}
                </h2>
                <p className="max-w-lg text-base text-center md:text-center lg:text-left leading-relaxed text-text-secondary line-clamp-3">
                  {user?.bio}
                </p>
              </div>
            </div>

            <div className="flex relative gap-8 w-full pt-4 justify-center lg:justify-end">
              <Link
                href="/settings"
                className="md:px-4 px-2 flex items-center justify-center gap-2 py-2 md:py-3 bg-primary dark:text-white rounded-md border-border border text-primary font-bold shadow-lg hover:scale-105 transition-transform"
              >
                <Settings />
                Profile Settings
              </Link>
              <button
                onClick={() => setShowShareModal(!showShareModal)}
                className="md:px-4 px-2 md:py-3 py-2 rounded-md border gap-2 border-border flex items-center justify-center text-text-primary font-bold hover:bg-primary/10 transition-colors"
              >
                <Share />
                Share
                {showShareModal ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </button>

              {showShareModal && (
                <SharePopoverModal
                  setShowQrModal={setShowQrModal}
                  setShowShareModal={setShowShareModal}
                  showShareModal={showShareModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden w-full grid-cols-3 md:grid py-10 gap-8">
        {statCardData.map((info, i) => (
          <div
            key={i}
            className="col-span-1 p-6 rounded-md flex items-center gap-6 hover:bg-surface transition-colors bg-surface/50"
          >
            <div className="bg-background w-12 h-12 flex items-center justify-center rounded-xl">
              {/* <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                {info.icon}
              </span> */}
              <info.icon className="text-2xl" />
            </div>
            <div>
              <h2
                className={`text-3xl font-bold ${theme === "light" ? "" : "text-text-primary"}`}
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
        <div className="col-span-1 p-6 rounded-md flex items-center gap-6 hover:bg-surface transition-colors bg-surface/50">
          <div className="bg-background w-12 h-12 flex items-center justify-center rounded-xl">
            <Coins />
          </div>
          <div>
            <h2
              className={`text-3xl font-bold ${theme === "light" ? "" : "text-white"}`}
            >
              {user?.skill_tokens || 0}
            </h2>
            <h3 className="text-sm uppercase tracking-wider font-semibold">
              Credits
            </h3>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:hidden">
        <div className=" p-4 grid grid-cols-3 rounded-md bg-surface/40 mt-6 mb-6 place-content-center">
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
                Credits
              </h3>
              <p className="text-xl font-bold"> {user?.skill_tokens || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className=" w-full grid lg:grid-cols-3 gap-8">
        <div className="col-span-2 grid gap-8">
          <SkillsCard
            title="Skills i can teach"
            skills={user?.skills_to_teach || []}
            icon={Psychology}
            color="primary"
          />
          <SkillsCard
            title="Skills i want to learn"
            skills={user?.skills_to_learn || []}
            icon={School}
            color="accent"
          />
        </div>

        <div className="col-span-2 md:col-span-1 lg:col-span-1 bg-surface/50 p-4 h-90 rounded-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center bg-background rounded-xl justify-center border border-border shadow-inner">
              <Reviews className="text-text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Reviews</h1>
          </div>

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

      {/* <div className="w-full grid lg:grid-cols-2 md:grid-cols-2 gap-8 py-8">
        <div className="col-span-1 md:p-6 p-4 bg-surface/50 rounded-md flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center bg-background rounded-xl justify-center border border-border shadow-inner">
             <LocalFireDepartment className="text-text-primary text-xl"/>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Streak History</h1>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex items-center">
              <LocalFireDepartmentFill className="text-accent animate-pulse text-[3rem]"/>
              <span className="text-5xl font-black tracking-tighter">
                {user?.streaks || 0}
              </span>
            </div>
            <div className="pb-1.5">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] leading-none">
                Week(s)
              </p>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] leading-none">
                Streak
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-border/50">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => {
                const today = new Date().getDay();
                const isToday = today === i;

                const isSpecialDay = i === 1 || i === 2;
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span
                      className={`text-[10px] font-bold ${isToday ? "text-accent" : "text-text-secondary"}`}
                    >
                      {day}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-500 border ${
                        isToday ? "border-accent " : "border-border"
                      } ${
                        isToday && (i === 1 || i === 2) ? "animate-pulse" : ""
                      } ${
                        i === 1 || i === 2
                          ? "bg-accent text-white shadow-lg shadow-accent/20 border-accent"
                          : "bg-surface text-text-secondary/40"
                      }`}
                    >
                      {i === 1 || i === 2 ? (
                        <Check className="text-sm"/>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-1">
              {user?.streaks > 0 ? (
                <p className="text-sm text-text-secondary">
                  <span className="text-accent font-medium">Keep it up!</span>{" "}
                  You haven't missed a beat this week.
                </p>
              ) : (
                <p className="text-sm text-text-secondary">
                  Start a swap today to kickstart your streak!
                </p>
              )}
              <p className="text-sm font-medium text-text-secondary">
                <span className="text-text-accent font-bold">+0</span> credits
                today
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:p-6 p-4 bg-surface/50 rounded-md flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center bg-background rounded-xl justify-center border border-border shadow-inner">
                <History className="text-xl text-text-primary"/>
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Exchange History
              </h1>
            </div>
            <button className="text-xs font-bold text-accent hover:underline uppercase tracking-wider transition-colors">
              View All
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/50 hover:border-border transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-semibold truncate text-text-primary transition-colors">
                      UI Design with Aisha
                    </p>
                    <p className="text-[10px] text-text-secondary uppercase font-medium">
                      24 May, 2026
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, index) => {
                    const rating = 4;
                    return (
                      <>
                        {
                          index < rating ? (
                            <StarFill key={index}/>
                          ) : (
                            <Star key={}/>
                          )
                        }
                      </>
                      <span
                        key={index}
                        className="material-symbols-outlined text-lg!"
                        style={{
                          fontVariationSettings: `'FILL' ${index < rating ? 1 : 0}`,
                        }}
                      >
                        star
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {showQrModal && (
        <ProfileQR id={user?.id || ""} setShowQrModal={setShowQrModal} />
      )}
    </section>
  );
};

export default ProfilePage;
