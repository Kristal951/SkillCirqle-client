import React from "react";

const ThirdSection = () => {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 min-h-150">
      <div className="md:col-span-2 md:row-span-2 bg-black/80 p-12 rounded-2xl flex flex-col justify-end relative overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img
            alt="Cybersecurity expert"
            className="w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-700"
            data-alt="professional cybersecurity specialist working in a dark room with multiple monitors glowing in deep violet and blue hues"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2HoE-6WGv1QsWLKPnlr731sJpdoXkFKFIJ-mE0giMgCi_0stLsq4YlnCX3gPpyr49EXd9eXWVPpRMay0ntOMRHfsMz2tVEE9z3mW_OhCvZpvmHjyHPRgk8nI3aFwXEIAzkOVq11M7sy0WlpLYxm1sSF_joCRfgxHc4GxJLL6k_e1sY0IXZDYUzQBaVIj9oN-nl7L8x48XlWEu9562mAf05OaO0edNBsrQo-idqnXoRk_6Qvngk92KEjwBhvHN6nH5C6nyHSZ3RRWA"
          />
        </div>
        <div className="relative z-10">
          <span className="bg-primary/50 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-block">
            Featured Domain
          </span>
          <h4 className="text-4xl text-white font-headline font-extrabold mb-4">
            Cybersecurity Architecture
          </h4>
          <p className="text-text-secondary max-w-md">
            Master the art of digital defense through direct mentorship from
            senior security engineers.
          </p>
        </div>
      </div>
      <div className="md:col-span-2 bg-surface p-8 rounded-2xl flex items-center justify-between group">
        <div>
          <h4 className="text-2xl font-headline font-bold mb-2">
            Skill Gauges
          </h4>
          <p className="text-on-surface-variant">
            Visualize your growth with circular metrics.
          </p>
        </div>
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-text-secondary"
              cx="48"
              cy="48"
              fill="transparent"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
            ></circle>
            <circle
              className="text-primary"
              cx="48"
              cy="48"
              fill="transparent"
              r="40"
              stroke="currentColor"
              strokeDasharray="251.2"
              strokeDashoffset="50.24"
              strokeWidth="8"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-text-primary">
            80%
          </div>
        </div>
      </div>

      <div className="md:col-span-1 p-8 bg-surface rounded-2xl">
        <span
          className="material-symbols-outlined text-secondary text-4xl mb-4"
          data-icon="groups"
        >
          groups
        </span>
        <h5 className="font-bold text-xl mb-2">Community</h5>
        <p className="text-sm text-on-surface-variant">
          24/7 active hubs for rapid problem solving.
        </p>
      </div>
      <div className="md:col-span-1 bg-surface p-8 rounded-2xl flex flex-col justify-between">
        <span
          className="material-symbols-outlined text-secondary text-4xl"
          data-icon="verified"
        >
          verified
        </span>
        <div>
          <h5 className="font-bold text-xl mb-1">Verified</h5>
          <p className="text-sm text-on-surface-variant">
            Endorsed by industry leaders.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThirdSection;
