import { CirclePlus, Paperclip, Send, Smile, Mic } from "lucide-react";
import React, { useState } from "react";

const Input = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("send message:", message);
    setMessage("");
  };

  return (
    <div className="w-full sticky bottom-0 right-0 p-3 bg-surface/60 backdrop-blur-md flex items-center gap-2 border-t border-border">
      <button
        type="button"
        aria-label="More options"
        className="p-2 rounded-lg hover:bg-surface transition"
      >
        <CirclePlus className="w-5 h-5" />
      </button>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Type a message..."
      />

      <button
        type="button"
        aria-label="Emoji picker"
        className="hover:opacity-70 transition"
      >
        <Smile className="w-5 h-5" />
      </button>

      {message.trim() ? (
        <button
          onClick={handleSend}
          type="button"
          aria-label="Send message"
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <Send className="w-5 h-5" />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Voice message"
          className="p-2 rounded-lg hover:bg-surface transition"
        >
          <Mic className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Input;
