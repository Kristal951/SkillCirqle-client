"use client";

import { createContext, useContext, useState } from "react";

type LogoutModalContextType = {
  showLogoutModal: boolean;
  setShowLogoutModal: (v: boolean) => void;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
};

const LogoutModalContext = createContext<LogoutModalContextType | null>(null);

export const LogoutModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  return (
    <LogoutModalContext.Provider
      value={{
        showLogoutModal,
        setShowLogoutModal,
        openLogoutModal,
        closeLogoutModal,
      }}
    >
      {children}
    </LogoutModalContext.Provider>
  );
};

export const useLogoutModal = () => {
  const ctx = useContext(LogoutModalContext);
  if (!ctx) throw new Error("useLogoutModal must be used inside provider");
  return ctx;
};
