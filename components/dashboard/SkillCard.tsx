import { useTheme } from "next-themes";
import React from "react";

interface info {
  title: string;
  image: string;
  desc: string;
  usersAmount: number;
}

const SkillCard = ({ info }: { info: info }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-surface ${theme === 'light' ? 'border border-border ' : ''} min-w-50 max-w-90 lg:min-w-75 lg:max-w-100 shrink-0 group rounded-xl overflow-hidden flex flex-col justify-between`}>
      <div className="h-72 relative">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          data-alt="Abstract code on dark screen with purple and blue syntax highlighting, glowing tech background"
          src={info.image}
        />
      </div>
      <div className="p-4">
        <h1
          className={`${theme === "light" ? "" : "text-white"} text-xl mb-2 font-semibold`}
        >
          {info.title}
        </h1>
        <p className="text-text-secondary text-sm md:text-lg md:line-clamp-3 leading-relaxed mb-6">
          {info.desc}
        </p>
      </div>

      <div className="w-full flex items-center justify-between p-4">
        <div className="flex -space-x-2">
          <img
            className="w-8 h-8 rounded-full border-2 border-surface-container-low"
            data-alt="Portrait of a creative professional"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC53r0Ufyb764__4Q52fB4VfaGdfXJ5ilSMZPpYqoraP2mT8UeXMnxuK1TwZbqUcbzdqcj-c2PghrvOzVpAyaBSuDHX31tGZjHQL7p4Xbgu5J93icaVN_Op0ezvF7s9m2yWQ-MGlWBulP5-BG_Y9fi2vDmKHxd3Cu1-mJ-lKV9x2O_LDlxcweqI-9q6zvVF2SEf6V3C3lyWjyYxAFupZmtouDvD5bhL0Z2XFMNHGI8itZboS1aY6QhW3vBXJGbKTGwpUijjkgI-VJVb"
          />
          <img
            className="w-8 h-8 rounded-full border-2 border-surface-container-low"
            data-alt="Portrait of a smiling designer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYnqs64z-W6-C3nm4QTHCdUb2xygDU4Dyk545vAYvjfxeyjjVvuzXeLYMw20-R5_tiFawSXAUj0hw20ErplL1MNfR2j4LZWmO0HKGde1i97d45IbbrsZeBLOVP0vYTiXkJ3bJLUqHlm4IMEJXZezUSX3gW2TUOH3fBolsPIzACZk1KBsmCJSnKKiDXlo2q3AvNOleb_cFry10wmldnJJQff6baNOn8OcdPFT4Sv-YjGb9fdcRTpxiRDkU1zT0CwNhvNQbVgL-RTI3X"
          />
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-[10px] font-bold border-2 border-surface-container-low">
            +{info.usersAmount}
          </div>
        </div>

        <button className="bg-primary/20 text-text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all active:scale-95">
          View Profiles
        </button>
      </div>
    </div>
  );
};

export default SkillCard;
