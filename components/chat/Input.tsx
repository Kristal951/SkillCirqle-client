"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { CirclePlus, Send, Smile, Mic } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";

const Input = () => {
  const [message, setMessage] = useState("");

  const { sendMessage, activeChat } = useChatStore();
  const { user } = useAuthStore();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversationId = activeChat?.id;

  useEffect(() => {
    return () => {
      const socket = getSocket();
      if (!socket || !conversationId || !user?.id) return;

      socket.emit("stop_typing", {
        conversationId,
        userId: user.id,
      });
    };
  }, [conversationId, user?.id]);

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !conversationId || !user?.id) return;

    socket.emit("typing", {
      conversationId,
      userId: user.id,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId,
        userId: user.id,
      });
    }, 1200);
  };

  const handleSend = () => {
    if (!message.trim() || !conversationId) return;

    sendMessage({
      conversationId,
      senderId: user?.id || "",
      senderAvatar: user?.avatar_url || '',
      content: message,
      type: "text",
    });

    setMessage("");

    // stop typing immediately when sending
    const socket = getSocket();
    socket?.emit("stop_typing", {
      conversationId,
      userId: user?.id,
    });
  };

  return (
    <div className="w-full sticky bottom-0 right-0 p-3 bg-surface/60 backdrop-blur-md flex items-center gap-2 border-t border-border">
      <button className="p-2 rounded-lg hover:bg-surface transition">
        <CirclePlus className="w-5 h-5" />
      </button>

      <input
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Type a message..."
      />

      <button className="hover:opacity-70 transition">
        <Smile className="w-5 h-5" />
      </button>

      {message.trim() ? (
        <button
          onClick={handleSend}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <Send className="w-5 h-5" />
        </button>
      ) : (
        <button className="p-2 rounded-lg hover:bg-surface transition">
          <Mic className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Input;