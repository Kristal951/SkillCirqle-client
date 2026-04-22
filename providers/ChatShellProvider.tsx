"use client";
import Header from "@/components/chat/Header";
import Sidebar from "@/components/chat/Sidebar";
import Input from "@/components/chat/Input";
import { useChatStore } from "@/store/useChatStore";

export default function ChatShell({ children }: { children: React.ReactNode }) {
  const { activeChat } = useChatStore();

  return (
    <main className="flex h-screen w-full bg-background overflow-hidden">
      <aside
        className={`
          ${activeChat ? "hidden" : "flex"} 
          md:flex md:w-80 lg:w-84 h-full border-r border-border shrink-0 flex-col relative
        `}
      >
        <Sidebar />
      </aside>

      <section
        className={`
          ${activeChat ? "flex" : "hidden"} 
          md:flex flex-1 relative flex-col h-full min-w-0 bg-background
        `}
      >
        {activeChat ? (
          <>
            <Header />
            <div className="flex-1 overflow-y-auto w-full bg-surface/5">
              {children}
            </div>
            <Input />
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-surface/5">
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">
                  chat
                </span>
              </div>
              <h2 className="text-xl font-semibold">SkillCirqle Chat</h2>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm mt-2">
                Select a conversation to start exchanging skills and knowledge.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
