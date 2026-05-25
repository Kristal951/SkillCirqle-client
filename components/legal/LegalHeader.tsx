"use client";

import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LegalHeader() {
  const router = useRouter();

  return (
    <div className="w-full flex items-start justify-between md:px-8 py-6">
      <div className="w-full flex flex-col gap-2">
        <div className="w-full h-max flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">Legal Documents</h1>
          <button
            onClick={() => router.push('/')}
            className="flex items-center g gap-2 text-sm text-text-secondary hover:bg-text-secondary/10 rounded-full p-1 transition-colors mb-4"
          >
           <X/>
          </button>
        </div>

        <p className="text-sm max-w-2xl md:text-base text-text-secondary leading-relaxed">
          Your trust is the foundation of SkillCirqle. We are committed to
          maintaining a secure, fair, and transparent environment for all
          Cirqlers.
        </p>
      </div>
    </div>
  );
}
