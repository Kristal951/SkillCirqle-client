"use client";

import { User } from "@/types/AuthStore";
import { createContext, useContext } from "react";

type UserSkill = {
  skill_id: string;
  skills: {
    id: string;
    title: string;
  };
};

type UserProfile = {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  skills_to_teach: string[];
  user_skills: UserSkill[];
};

const UserProfileContext = createContext<{ user: any }>({
  user: null,
});

export const UserProfileProvider = ({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) => {
  return (
    <UserProfileContext.Provider value={{ user }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);