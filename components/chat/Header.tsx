"use client";

import { useChat } from "@/providers/chatContextProvider";
import { EllipsisVertical, Phone, Video } from "lucide-react";

const Header = () => {
  const { activeChat } = useChat();

  if (!activeChat) return null;

  return (
    <div className="w-full sticky top-0 z-100 bg-background flex items-center justify-between p-2 border-b border-border">
      <div className="flex gap-3 items-center">
        <div className="relative">
          <div className=" w-14 h-14 rounded-full overflow-hidden">
            <img
              src={activeChat.image || "/default-avatar.png"}
              alt={activeChat.name}
              className="w-full h-full object-cover"
            />
          </div>

          {activeChat.isOnline && (
            <span className="w-3 h-3 rounded-full bg-green-500 absolute bottom-0 right-0" />
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium">{activeChat.name}</h2>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <button className="p-2 srounded-lg hover:bg-surface transition">
          <Video />
        </button>

        <button className="p-2 rounded-lg hover:bg-surface transition">
          <Phone />
        </button>

        <button className="p-2 rounded-lg hover:bg-surface transition">
          <EllipsisVertical />
        </button>
      </div>
    </div>
  );
};

export default Header;
