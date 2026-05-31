"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-background-base/80 backdrop-blur-md border-b border-divider">
      <div className="w-full mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-1 cursor-pointer">
          <Image
            src="/SkillCirqle.webp"
            alt="SkillCirqle"
            width={24}
            height={27}
            priority
          />
          <h1 className="text-xl text-transparent font-bold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text truncate">
            SkillCirqle
          </h1>
        </div>

        <div className=" flex items-center md:gap-3">
          <Link
            href="/auth/signin"
            className="text-text-primary text-base font-medium px-4 py-2 rounded-lg hover:bg-surface-1 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="bg-primary text-base cursor-pointer text-white md:px-5 md:py-2.5 px-3 py-2 rounded-md font-semibold shadow-md"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
