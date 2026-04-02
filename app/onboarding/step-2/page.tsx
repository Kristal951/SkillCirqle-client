"use client";

import React, { useState, KeyboardEvent, useEffect } from "react";
import {
  UserCircle,
  Cpu,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLocation } from "@/hooks/useLocation";
import { useAuthStore } from "@/store/useAuthStore";
import Spinner from "@/components/ui/Spinner";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const About = () => {
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");

  const { location: userLocation, loading } = useLocation();
  const { updateUser, isUpdatingUser } = useAuthStore();
  const { updateUserOnboardingStepInDB } = useOnboardingStore();

  useEffect(() => {
    if (userLocation) {
      setLocation(`${userLocation.state}, ${userLocation.country}`);
    }
  }, [userLocation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateUser({
        bio,
        role,
        location,
      });
      await updateUserOnboardingStepInDB(3);
    } catch (error) {
      console.error(error);
    }
  };

  const isFormValid = bio.trim().length >= 10 && location.trim() && role.trim();

  return (
    <div className="min-h-[90vh] md:h-full w-full flex items-center md:overflow-hidden justify-center bg-background md:px-6 px-4 py-12 selection:bg-primary/30">
      <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-16 md:items-start place-items-center">
        <div className="space-y-8 text-center col-span-3 md:col-span-2 lg:text-left lg:sticky lg:top-12">
          <div className="space-y-4">
            <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
              Step 02 • Identity
            </div>

            <h1 className="text-5xl font-black tracking-tighter leading-tight">
              Tell us your <br />
              <span className="text-primary">Story.</span>
            </h1>

            <p className="text-text-secondary text-lg max-w-md leading-relaxed">
              Your profile is your digital handshake. Let the Cirqle know what
              drives you and what you're currently building.
            </p>
          </div>

          <div className="space-y-4 max-w-sm">
            {[
              "Highlight your core expertise",
              "Mention your current location",
              "Keep it professional yet personal",
            ].map((tip, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-text-secondary font-medium"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {tip}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-2 rounded-xl col-span-3 p-4 md:p-10 shadow-2xl space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-text-primary" /> Professional
                Role
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-xl bg-background border border-white/10 px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary flex items-center gap-2">
                <MapPin className="w-5 h-5 text-text-primary" /> Location
              </label>

              <input
                disabled={loading}
                value={loading ? "Detecting location..." : location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full rounded-xl bg-background border border-white/10 px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-text-primary" /> Short Bio
              </label>
              <span
                className={`text-[10px] font-mono ${bio.length > 500 ? "text-red-500" : "text-text-secondary"}`}
              >
                <span className="text-white">{bio.length}</span>/500
              </span>
            </div>
            <textarea
              value={bio}
              rows={8}
              cols={80}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              placeholder="Tell the Cirqle about your journey..."
              className="w-full rounded-xl bg-background border border-white/10 px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all "
            />
          </div>

          <div className="w-full flex justify-between items-center p-2">
            <Link
              href="/dashboard"
              className="flex-1 text-text-secondary hover:text-text-primary"
            >
              Skip for now
            </Link>
            <button
              type="submit"
              disabled={!isFormValid || isUpdatingUser}
              className={`
              flex-1 md:py-3 py-2 rounded-md text-lg group flex disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center md:gap-3 gap-2 transition-all duration-300
              ${
                isFormValid
                  ? "bg-primary text-white hover:scale-[1.01]"
                  : "bg-white/5 text-white/80 cursor-not-allowed border border-white/5"
              }
            `}
            >
              {isUpdatingUser ? (
                <>
                  <Spinner />
                  Updating Profile
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight
                    className={`w-5 h-5 transition-transform ${isFormValid ? "group-hover:translate-x-1" : ""}`}
                  />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default About;
