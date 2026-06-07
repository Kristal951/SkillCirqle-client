"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Code2,
  Palette,
  Megaphone,
  Languages,
  Music2,
  Briefcase,
  LayoutGrid,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { User } from "@/types/AuthStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import ProfileGridSkeleton from "@/components/search/SkeletonLoader";
import { SearchCard } from "@/components/search/SearchResultCard";

type CategoryId =
  | "All"
  | "Development"
  | "Design"
  | "Marketing"
  | "Language"
  | "Music"
  | "Business";

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
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();
  const { user } = useAuthStore();
  const router = useRouter();

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

    return profiles
      .filter(
        (profile) =>
          Array.isArray(profile.skills_to_teach) &&
          profile.skills_to_teach.length > 0,
      )
      .filter((profile) => {
        const matchesCategory =
          selectedCategory === "All" || profile.category === selectedCategory;

        if (!matchesCategory) return false;

        if (!searchLower) return true;

        return (
          profile.name?.toLowerCase().includes(searchLower) ||
          profile.role?.toLowerCase().includes(searchLower) ||
          profile.skills_to_teach.some((skill: string) =>
            searchTerms.some((term) => skill.toLowerCase().includes(term)),
          )
        );
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

  const handlePropose = (id: string | number) => {
    router.push(`/proposals/new/${id}`);
  };

  const handleViewProfile = (id: string | number) => {
    router.push(`/profile/${id}`);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background md:py-10 gap-10 md:px-8 pb-6 px-3 selection:bg-primary selection:text-white">
      <section className="w-full py-6 border-b border-border bg-background backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className=" hidden md:flex flex-col space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
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
        {!loading && filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
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
        ) : loading && filteredProfiles.length === 0 ? (
          <ProfileGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProfiles.map((mentor) => (
              <SearchCard
                key={mentor?.id}
                user={mentor}
                onViewProfile={handleViewProfile}
                onPropose={handlePropose}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
