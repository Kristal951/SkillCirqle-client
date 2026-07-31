"use client";

import React, { useState } from "react";
import { Sun, Moon, Monitor, CheckCircle2, Paintbrush } from "lucide-react";
import { useTheme } from "next-themes";
import { useFontSize } from "@/hooks/useFontSize";

type FontSizeOption = "small" | "medium" | "large";

export default function AppearancePanel() {
  const { theme, setTheme, systemTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const steps: FontSizeOption[] = ["small", "medium", "large"];

  const currentTheme = theme === "system" ? systemTheme : theme;
  const currentIndex = steps.indexOf(fontSize);

  return (
    <div className="flex-1 p-6 md:p-10 bg-surface/50 rounded-2xl border border-border/50">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Paintbrush className="text-primary" size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
          <p className="text-sm text-text-secondary">
            Customize your visual interface.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 mt-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            Preferred Theme
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col group items-center gap-2 rounded-2xl transition-all
             `}
            >
              <div
                className={`w-11 h-11 ${theme === "light" ? "bg-primary" : "bg-background"} group-hover:bg-primary group-hover:text-text-primary rounded-xl flex items-center justify-center`}
              >
                <Sun size={18} />
              </div>
              <p
                className={`text-[11px] ${theme === "light" ? "font-bold" : "font-medium"}`}
              >
                Light
              </p>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center group gap-2 rounded-2xl transition-all
             `}
            >
              <div
                className={`w-11 h-11 ${theme === "dark" ? "bg-primary" : "bg-background"} rounded-xl group-hover:bg-primary group-hover:text-text-primary flex items-center justify-center`}
              >
                <Moon size={18} />
              </div>
              <p
                className={`text-[11px] ${theme === "dark" ? "font-bold" : "font-medium"}`}
              >
                Dark
              </p>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center group gap-2 rounded-2xl transition-all
             `}
            >
              <div
                className={`w-11 h-11 rounded-xl ${theme === "system" ? "bg-primary" : "bg-background"} flex items-center group-hover:bg-primary group-hover:text-text-primary justify-center`}
              >
                <Monitor size={18} />
              </div>
              <p
                className={`text-[11px] ${theme === "system" ? "font-semibold" : "font-medium"}`}
              >
                System
              </p>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            Font Size
          </h2>

          <div className="relative w-full px-2">
            <div className="h-1 bg-surface-container-high rounded-full relative">
              <div
                className="h-1 bg-primary rounded-full transition-all duration-300"
                style={{
                  width: `${(currentIndex / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            <div className="absolute -top-1.5 left-0 right-0 flex justify-between">
              {steps.map((step) => {
                const isActive = fontSize === step;

                return (
                  <button
                    key={step}
                    onClick={() => setFontSize(step)}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      isActive
                        ? "bg-primary border-primary scale-110"
                        : "bg-surface border-border"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-text-secondary px-1">
            <span
              className={`${fontSize === "small" ? "font-bold text-text-primary" : "font-medium"}`}
            >
              Small
            </span>
            <span
              className={`${fontSize === "medium" ? "font-bold text-text-primary" : "font-medium"}`}
            >
              Medium
            </span>
            <span
              className={`${fontSize === "large" ? "font-bold text-text-primary" : "font-medium"}`}
            >
              Large
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
