"use client";

import { User } from "@/types/AuthStore";
import { createContext, useContext } from "react";

const UserProfileContext = createContext<{ user: User | null }>({
  user: null,
});

export const UserProfileProvider = ({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) => {
  return (
    <UserProfileContext.Provider value={{ user }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);