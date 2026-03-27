import { UserPlus } from "lucide-react";
import React from "react";

const SecondSection = () => {
  const cardDetails = [
    {
      iconText: "person_add",
      number: "01",
      title: " Create Your Profile",
      description:
        "list the skills you've mastered and the one's your'e hungry to learn. Our system indexes your expertise for precision matching.",
    },
    {
      iconText: "hub",
      number: "02",
      title: " Find Your Match",
      description:
        "Our algorithmic engine connects you with mentors who have what you need and need what you have. Symmetric value exchange.",
    },
    {
      iconText: "auto_awesome",
      number: "03",
      title: " Exchange & Grow",
      description:
        "Schedule digital sessions within our high-fidelity workspace. Track progress with Skill Gauges and build your reputation.",
    },
  ];
  return (
    <div className="w-full h-full px-8 bg-surface-1">
      <div className="max-w-7xl mx-auto flex flex-col gap-20 items-center justify-center h-full">
        <div className="flex w-full flex-col text-left">
          <h1 className="text-text-primary tracking-tight font-bold text-5xl">
            How the Cirqle Works
          </h1>
          <p className="text-text-secondary max-w-xl">
            Designed for focus and efficiency. Three steps to mastering any
            skill through peer-to-peer exchange
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cardDetails.map((card, i) => (
            <div
              className="group bg-surface-container p-10 rounded-2xl transition-all duration-500 hover:bg-surface-container-high hover:shadow-[0_0_40px_rgba(211,187,255,0.06)] relative overflow-hidden"
              key={i}
            >
              <div className="mb-2">
                <span className="text-text-primary/20 font-headline text-7xl font-black absolute top-4 right-8 group-hover:text-text-primary/40 transition-colors">
                  {card.number}
                </span>
                <div className="w-16 h-16 bg-text-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <span
                    className="material-symbols-outlined text-4xl"
                    data-icon={`${card.iconText}`}
                  >
                    {card.iconText}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="leading-relaxed text-text-surface capitalize">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecondSection;