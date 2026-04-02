import { Bell, Coins } from "lucide-react";
import React from "react";
import ThemeToggle from "../ToggleThemeButton";
import { useTokenStore } from "@/store/useTokenStore";
import { useAuthStore } from "@/store/useAuthStore";

const Navbar = () => {
  const { tokens } = useTokenStore();
  const {user} = useAuthStore()

  console.log(tokens, user);
  return (
    <div className="w-full bg-background h-17.5 flex border-0 items-center justify-between border-b border-b-text-text-secondary/10 p-4">
      <div>
        <h1>SkillCirqle</h1>
      </div>

      <div>
        <Coins/>
        <Bell />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
