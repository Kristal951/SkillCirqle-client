import Header from "@/components/chat/Header";
import Sidebar from "@/components/chat/Sidebar";
import { ChatProvider } from "@/providers/chatContextProvider";
import ChatShell from "@/providers/ChatShellProvider";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <ChatShell>{children}</ChatShell>
    </ChatProvider>
  );
}
