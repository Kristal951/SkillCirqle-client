import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-background-base border-t border-divider py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <span className="text-lg font-bold text-primary">
            Skill Cirqle
          </span>
          <p className="text-text-secondary text-sm max-w-xs">
            © 2026 Skill Cirqle. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {["Privacy Policy", "Terms of Service", "Help Center", "Guidelines"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-text-secondary hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex gap-4">
          
          <button className="w-9 h-9 rounded-lg bg-surface-1 flex items-center justify-center text-text-secondary hover:text-primary transition">
            <span className="material-symbols-outlined text-lg">
              language
            </span>
          </button>

          <button className="w-9 h-9 rounded-lg bg-surface-1 flex items-center justify-center text-text-secondary hover:text-primary transition">
            <span className="material-symbols-outlined text-lg">
              hub
            </span>
          </button>

        </div>

      </div>
    </footer>
  );
};

export default Footer;