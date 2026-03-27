import React from "react";

const FirstSection = () => {
  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-surface flex items-center justify-center px-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-200 h-100 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full text-center z-10 space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] text-on-surface">
            Teach what <span className="text-primary italic">you know.</span>
            <br />
            Learn what <span className="text-secondary">you don't.</span>
          </h1>

          <p className="text-lg md:text-2xl text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed">
            Join the <span className="font-medium text-on-surface">Cirqle</span>
            . A premium workspace for high-tech knowledge sharing where human
            connection fuels collective growth.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
          <button className="w-full sm:w-auto bg-linear-to-br from-primary to-primary-container text-on-primary px-12 py-5 rounded-2xl font-bold text-xl active:scale-95 transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/20">
            Get Started
          </button>

          <button className="w-full sm:w-auto px-12 py-5 rounded-2xl font-bold text-xl border border-outline-variant/30 text-on-surface hover:bg-on-surface/5 transition-all duration-300">
            How it Works
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstSection;
