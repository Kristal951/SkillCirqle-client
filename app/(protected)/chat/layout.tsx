import Header from "@/components/chat/Header";
import Sidebar from "@/components/chat/Sidebar";
import ChatShell from "@/providers/ChatShellProvider";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <ChatShell>{children}</ChatShell>
  );
}
