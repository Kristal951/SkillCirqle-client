"use client";

import { ChatContextType, ChatUser } from "@/types/AuthStore";
import { createContext, useContext, useState } from "react";

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }

  return ctx;
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);

  return (
    <ChatContext.Provider value={{ activeChat, setActiveChat }}>
      {children}
    </ChatContext.Provider>
  );
};
