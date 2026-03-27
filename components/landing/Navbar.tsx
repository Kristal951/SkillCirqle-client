"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full h-20 z-50 bg-background-base/80 backdrop-blur-md border-b border-divider">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-primary rounded-lg rotate-12 transition-transform duration-300" />
          <p className="text-text-primary font-bold text-xl sm:text-2xl tracking-tight">
            Skill<span className="text-primary italic">Cirqle</span>
          </p>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Mentors", "Courses", "Community", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-text-secondary hover:text-primary font-medium transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="text-text-primary font-medium px-4 py-2 rounded-lg hover:bg-surface-1 transition">
            Login
          </button>
          <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-md">
            Join Now
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg border border-divider"
        >
          {open ? (
            <X className="w-5 h-5 text-text-primary" />
          ) : (
            <Menu className="w-5 h-5 text-text-primary" />
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background-base border-t border-divider px-6 py-8 flex flex-col gap-6">
          
          {["Mentors", "Courses", "Community", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-text-primary text-lg font-medium"
              onClick={() => setOpen(false)}
            >
              {item}
            </a>
          ))}

          <div className="flex flex-col gap-3 pt-4 border-t border-divider">
            <button className="w-full text-text-primary font-medium py-2 rounded-lg hover:bg-surface-1">
              Login
            </button>

            <button className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold">
              Join Now
            </button>
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;