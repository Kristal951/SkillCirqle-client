import { Sparkle, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import React from "react";

const FirstSection = () => {
  return (
    <div className="w-full min-h-screen relative bg-background overflow-hidden flex items-center justify-center px-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-200 h-100 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full h-full text-center flex items-center justify-center flex-col z-10 space-y-12">
        <div className="space-y-10 flex items-center justify-center flex-col h-full">

           <div className="inline-flex items-center gap-2 px-3 py-2 border border-primary/10 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
             <Sparkles/> Skill Exchange Platform
            </div>
          <h1 className="text-4xl md:text-6xl text-foreground font-extrabold tracking-tighter leading-[0.9]">
            Teach what you know.
            <br />
           <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Learn what you don't.</span>
          </h1>

          <p className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto font-light leading-relaxed">
            A social platform where people trade skills instead of money. Teach
            what you know, learn what you don't — no cash required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
          <Link href="/auth/register" className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-3 rounded-2xl font-bold text-xl active:scale-95 transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/20">
            Get Started Free
          </Link>

          <a href="#how-it-works" className="w-full sm:w-auto px-10 py-3 rounded-2xl font-bold text-xl border border-primary/50 text-on-surface hover:bg-primary/10 transition-all duration-300">
            How it Works
          </a>
        </div>
      </div>
    </div>
  );
};

export default FirstSection;
