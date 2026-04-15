"use client";

import { useChat } from "@/providers/chatContextProvider";
import Header from "@/components/chat/Header";
import Sidebar from "@/components/chat/Sidebar";
import Input from "@/components/chat/Input";

export default function ChatShell({ children }: { children: React.ReactNode }) {
  const { activeChat } = useChat();

  return (
    <main className="flex h-screen w-full bg-background overflow-hidden">
      <div
        className={`
        ${activeChat ? "hidden" : "flex"} 
        md:flex md:w-80 lg:w-80 w-full h-full border-r border-border shrink-0 flex-col
      `}
      >
        <Sidebar />
      </div>
      <div
        className={`
        ${activeChat ? "flex" : "hidden"} 
        md:flex flex-1 relative flex-col h-full min-w-0 bg-background
      `}
      >
        {activeChat ? (
          <>
            <Header />
            <div className="flex-1 overflow-y-auto w-full">{children}</div>
            <Input />
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-surface/5">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-4xl">
                  chat
                </span>
              </div>
              <h2 className="text-xl font-semibold">SkillCirqle Chat</h2>
              <p className="text-text-secondary max-w-xs mx-auto text-sm">
                Select a conversation to start exchanging skills and knowledge.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
