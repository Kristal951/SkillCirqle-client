import Image from "next/image";
import React from "react";

const Footer = () => {
  const footerLinks = [
    {
      label: "Privacy Policy",
      link: "/legal/privacy_policy",
    },
    {
      label: "Terms of Service",
      link: "/legal/terms_of_service",
    },
    {
      label: "Help Center",
      link: "/legal/help_center",
    },
    {
      label: "Community Guidelines",
      link: "/legal/community_guidelines",
    },
  ];

  return (
    <footer className="w-full bg-background-base border-t border-divider py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className=" w-max h-max flex items-center gap-1">
            <Image
              src="/SkillCirqle.webp"
              alt="SkillCirqle"
              width={24}
              height={27}
              priority
            />

            <h1 className="text-lg font-bold text-transparent bg-linear-to-r from-primary to-accent bg-clip-text">
              SkillCirqle
            </h1>
          </div>

          <p className="text-text-secondary text-sm max-w-xs">
            © 2026 Skill Cirqle. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {footerLinks.map((item, i) => (
            <a
              key={i}
              href={item.link}
              className="text-text-secondary hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex gap-4">
          <button className="w-9 h-9 rounded-lg bg-surface-1 flex items-center justify-center text-text-secondary hover:text-primary transition">
            <span className="material-symbols-outlined text-lg">language</span>
          </button>

          <button className="w-9 h-9 rounded-lg bg-surface-1 flex items-center justify-center text-text-secondary hover:text-primary transition">
            <span className="material-symbols-outlined text-lg">hub</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
