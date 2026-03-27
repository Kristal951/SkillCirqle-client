import React from "react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-20 z-50 bg-background-base/80 backdrop-blur-md border-b border-divider">
      <div className="max-w-360 mx-auto h-full px-6 flex items-center justify-between">

        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-primary rounded-lg rotate-12 group-hover:rotate-0 transition-transform duration-300" />
          <p className="text-text-primary font-bold text-2xl tracking-tight">
            Skill<span className="text-primary italic">Cirqle</span>
          </p>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Mentors", "Courses", "Community", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-text-secondary hover:text-primary font-medium transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="text-text-primary font-medium px-4 py-2 rounded-lg hover:bg-surface-1 transition-all">
            Login
          </button>

          <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md">
            Join Now
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;