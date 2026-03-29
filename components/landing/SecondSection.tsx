import React from "react";

const SecondSection = () => {
  const cardDetails = [
    {
      iconText: "person_add",
      number: "01",
      title: "Create Your Profile",
      description:
        "List the skills you've mastered and the ones you're eager to learn. Our system indexes your expertise for precision matching.",
    },
    {
      iconText: "hub",
      number: "02",
      title: "Find Your Match",
      description:
        "Our algorithm connects you with mentors who have what you need—and need what you have. True value exchange.",
    },
    {
      iconText: "auto_awesome",
      number: "03",
      title: "Exchange & Grow",
      description:
        "Schedule sessions in a seamless workspace, track progress, and build your reputation as you grow.",
    },
  ];

  return (
    <section className="w-full py-20 px-4 sm:px-6 md:px-10 bg-surface-1">
      <div className="max-w-7xl mx-auto flex flex-col gap-16 md:gap-20">
        
        <div className="flex flex-col gap-4 text-center md:text-left">
          <h1 className="text-text-white tracking-tight font-bold text-3xl sm:text-4xl md:text-5xl">
            How the Cirqle Works
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto md:mx-0 text-sm sm:text-base md:text-lg">
            Designed for focus and efficiency. Three simple steps to mastering
            any skill through peer-to-peer exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cardDetails.map((card, i) => (
            <div
              key={i}
              className="group relative overflow-hidden bg-surface-2 p-6 sm:p-8 md:p-10 rounded-2xl transition-all duration-300 hover:shadow-lg"
            >
              <span className="absolute top-4 right-6 text-5xl sm:text-6xl font-black text-text-primary/10 group-hover:text-text-primary/20 transition">
                {card.number}
              </span>

              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-text-primary/10 rounded-xl flex items-center justify-center text-primary mb-5">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">
                  {card.iconText}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-text-white mb-3">
                {card.title}
              </h3>

              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SecondSection;