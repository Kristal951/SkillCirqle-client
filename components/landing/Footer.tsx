import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#161021] border-t border-[#d3bbff]/15 w-full py-12 px-8 font-['Inter'] text-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-[#d3bbff]">Cirqle</span>
          <p className="text-[#eadef7]/50 max-w-xs text-center md:text-left">
            © 2026 Skill Cirqle. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a
            className="text-[#eadef7]/50 hover:text-[#d3bbff] transition-colors"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-[#eadef7]/50 hover:text-[#d3bbff] transition-colors"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-[#eadef7]/50 hover:text-[#d3bbff] transition-colors"
            href="#"
          >
            Help Center
          </a>
          <a
            className="text-[#eadef7]/50 hover:text-[#d3bbff] transition-colors"
            href="#"
          >
            Guidelines
          </a>
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:text-[#d3bbff] cursor-pointer transition-colors">
            <span
              className="material-symbols-outlined text-lg"
              data-icon="language"
            >
              language
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:text-[#d3bbff] cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-lg" data-icon="hub">
              hub
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
