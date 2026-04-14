"use client";

import { useChat } from "@/providers/chatContextProvider";
import { EllipsisVertical, Phone, Video, ChevronLeft } from "lucide-react";

const Header = () => {
  const { activeChat, setActiveChat } = useChat();

  if (!activeChat) return null;

  return (
    <div className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-between p-3 border-b border-border">
      <div className="flex gap-2 md:gap-3 items-center min-w-0">
        <button 
          onClick={() => setActiveChat(null)}
          className="md:hidden p-1 -ml-1 hover:bg-surface rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-border">
            <img
              src={activeChat.image || "/default-avatar.png"}
              alt={activeChat.name}
              className="w-full h-full object-cover"
            />
          </div>
          {activeChat.isOnline && (
            <span className="w-3 h-3 rounded-full bg-green-500 absolute bottom-0 right-0 border-2 border-background" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-semibold truncate">
            {activeChat.name}
          </h2>
          <p className="text-[10px] md:text-xs text-green-500 font-medium">
            {activeChat.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex gap-1 md:gap-2 items-center">
        <button className="p-2 rounded-lg hover:bg-surface transition">
          <Video className="w-5 h-5 text-text-secondary" />
        </button>
        <button className="p-2 rounded-lg hover:bg-surface transition">
          <Phone className="w-5 h-5 text-text-secondary" />
        </button>
        <button className="p-2 rounded-lg hover:bg-surface transition">
          <EllipsisVertical className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </div>
  );
};

export default Header;