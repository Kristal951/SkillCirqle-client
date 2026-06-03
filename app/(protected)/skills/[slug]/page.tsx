"use client";

import { SearchCard } from "@/components/search/SearchResultCard";
import { useRouter } from "next/navigation";

export default function SkillSlugPage({ data }: any) {
  const router = useRouter();

  const handlePropose = (id: string | number) => {
    router.push(`/proposals/new/${id}`);
  };

  const handleViewProfile = (id: string | number) => {
    router.push(`/profile/${id}`);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">
          Learn <span className="text-primary">{data.skill?.title}</span>
        </h1>

        <p className="text-text-secondary text-base">
          <span className="text-text-primary font-bold">{data.total}</span> 
          {' '}
          {`${data.total > 1 ? 'users' : 'user'} can teach you this skill`}
        </p>

        <div className="w-24 h-0.5 bg-primary/40 rounded-full mt-3" />
      </div>

      {data.users?.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.users.map((user: any) => (
            <SearchCard
              key={user?.id}
              user={user}
              onViewProfile={handleViewProfile}
              onPropose={handlePropose}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>

          <h2 className="text-xl font-semibold text-text-primary">
            No mentors found
          </h2>

          <p className="text-text-secondary text-sm mt-2 max-w-md">
            There are currently no users who can teach this skill. Check back
            later or explore other skills.
          </p>

          <button
            onClick={() => router.push("/search")}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
          >
            Explore Skills
          </button>
        </div>
      )}
    </div>
  );
}