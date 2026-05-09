"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Star,
  Code2,
  Palette,
  Megaphone,
  Languages,
  Music2,
  Briefcase,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { User } from "@/types/AuthStore";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";

// --- Types ---
type CategoryId =
  | "All"
  | "Development"
  | "Design"
  | "Marketing"
  | "Language"
  | "Music"
  | "Business";

interface Mentor {
  id: number;
  name: string;
  role: string;
  category: Exclude<CategoryId, "All">;
  skills: string[];
  rating: number;
  location: string;
  online: boolean;
}

const extractSkills = (query: string): string[] => {
  return query
    .toLowerCase()
    .split(/[, ]+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("All");
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();
  const { user } = useAuthStore();
  const router = useRouter()

  const inputRef = useRef<HTMLInputElement | null>(null);

 useEffect(() => {
  const timer = setTimeout(() => {
    inputRef.current?.focus();
  }, 100);

  return () => clearTimeout(timer);
}, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);

      let query = supabase.from("profiles").select("*");

      if (user) {
        query = query.neq("id", user.id);
      }

      const { data, error } = await query;

      if (!error) {
        setProfiles(data || []);
      }

      setLoading(false);
    };

    fetchProfiles();
  }, [user, supabase]);

  const filteredProfiles = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    const searchTerms = extractSkills(searchQuery);

    return profiles.filter((profile) => {
      const matchesCategory =
        selectedCategory === "All" || profile.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchLower) return true;

      const nameMatch = profile.name?.toLowerCase().includes(searchLower);
      const roleMatch = profile.role?.toLowerCase().includes(searchLower);

      const skillMatch = profile.skills_to_teach?.some((skill: string) =>
        searchTerms.some((term) => skill.toLowerCase().includes(term)),
      );

      return nameMatch || roleMatch || skillMatch;
    });
  }, [profiles, searchQuery, selectedCategory]);

  const CATEGORY_DATA = [
    { id: "All", icon: <LayoutGrid size={18} /> },
    { id: "Development", icon: <Code2 size={18} /> },
    { id: "Design", icon: <Palette size={18} /> },
    { id: "Marketing", icon: <Megaphone size={18} /> },
    { id: "Language", icon: <Languages size={18} /> },
    { id: "Music", icon: <Music2 size={18} /> },
    { id: "Business", icon: <Briefcase size={18} /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-background md:py-10 gap-10 md:px-8 pb-6 px-3 selection:bg-primary selection:text-white">
      <section className="w-full py-6 border-b border-border bg-background backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className=" hidden md:flex flex-col space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Explore
              </h1>
              <p className="text-xs text-text-secondary font-medium">
                Find the perfect partner to level up your skills.
              </p>
            </div>

            <div className="relative w-full md:max-w-md group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                value={searchQuery}
                ref={inputRef}
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a skill or user..."
                className="w-full bg-background/50 border border-border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORY_DATA.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryId)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all duration-300
                  ${
                    active
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                      : "bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
                  }`}
                >
                  <span className={active ? "text-white" : "text-primary"}>
                    {cat.icon}
                  </span>
                  {cat.id}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="w-full max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredProfiles.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 bg-surface rounded-[2.5rem] flex items-center justify-center border border-border mb-6 shadow-inner">
                <Search size={40} className="text-text-secondary/20" />
              </div>
              <h2 className="text-2xl font-bold">No matches found</h2>
              <p className="text-text-secondary text-sm max-w-xs mt-2 leading-relaxed">
                We couldn't find any mentors matching "{searchQuery}". Try a
                different keyword.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-8 px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProfiles.map((mentor) => (
                <div
                  onClick={()=> router.push(`/profile/${mentor?.id}`)}
                  key={mentor.id}
                  className="group relative bg-surface border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden border-2 border-background shadow-lg">
                      <img
                        src={mentor?.avatar_url || ""}
                        alt={mentor.name}
                        className="w-full h-full object-cover bg-background"
                      />
                    </div>
                    <div className="bg-accent/10 text-accent px-2 py-1.5 rounded-lg flex items-center gap-1.5 font-display font-extrabold text-sm border border-accent/20">
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings: "'FILL' 1",
                          fontSize: "18px",
                        }}
                      >
                        star
                      </span>
                      <span className="text-[12px]">
                        {mentor.rating ? mentor.rating.toFixed(2) : "0.00"}
                      </span>
                    </div>
                    {/* <span className="px-3 py-1.5 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-wider text-text-secondary group-hover:border-primary/20 transition-colors">
                      {mentor.category}
                    </span> */}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xl tracking-tight text-text-primary">
                        {mentor.name}
                      </h3>
                    </div>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                      {mentor.role}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6">
                    {mentor?.skills_to_teach?.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-bold px-3 py-1.5 bg-background border border-border rounded-xl text-text-primary group-hover:bg-primary/5 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/50">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <span className="material-symbols-outlined">
                        swap_horiz
                      </span>
                      <span className="text-xl font-bold">
                        {mentor.exchanges}
                      </span>
                      <p className="text-sm">exchanges</p>
                    </div>

                    <Link
                      href={`/proposals/new/${mentor?.id}`}
                      className="flex bg-primary px-4 py-3 items-center gap-1 text-text-primary rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:gap-2 group-hover:text-text-primary transition-all"
                    >
                      Propose
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SearchPage;
