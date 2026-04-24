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

  const getSafeSocket = () => getSocket();

  useEffect(() => {
    const el = document.querySelector("textarea");
    if (!el) return;

    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [message]);

  useEffect(() => {
    return () => {
      const socket = getSafeSocket();

      if (!socket || !conversationId) return;

      socket.emit("stop_typing", {
        conversationId,
      });
    };
  }, [conversationId]);

  const handleTyping = () => {
    const socket = getSafeSocket();

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
    }, 800);
  };

  const handleSend = () => {
    if (!message.trim() || !conversationId) return;

    sendMessage({
      conversationId,
      senderId: user?.id || "",
      senderAvatar: user?.avatar_url || "",
      content: message,
      type: "text",
      name: user?.name || "",
    });

    setMessage("");

    const socket = getSafeSocket();

    socket?.emit("stop_typing", {
      conversationId,
      userId: user?.id,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full sticky bottom-0 p-3 bg-surface/60 backdrop-blur-md flex items-center gap-2 border-t border-border">
      <button className="p-2 rounded-lg hover:bg-surface">
        <CirclePlus className="w-5 h-5" />
      </button>

      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Type a message..."
      />

      <button>
        <Smile className="w-5 h-5" />
      </button>

      {message.trim() ? (
        <button onClick={handleSend} className="p-2 bg-primary rounded-lg">
          <Send className="w-5 h-5" />
        </button>
      ) : (
        <button className="p-2">
          <Mic className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Input;
