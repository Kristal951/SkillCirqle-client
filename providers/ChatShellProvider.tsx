"use client";

import { useChat } from "@/providers/chatContextProvider";
import Header from "@/components/chat/Header";
import Sidebar from "@/components/chat/Sidebar";
import Input from "@/components/chat/Input";

export default function ChatShell({ children }: { children: React.ReactNode }) {
  const { activeChat } = useChat();

  return (
    <main className="flex h-full">
      <Sidebar />

      <div className="ml-90 flex-1 relative flex flex-col">
        {activeChat && <Header />}

        {children}

        {activeChat && <Input/>}
      </div>
    </main>
  );
}