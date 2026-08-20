// MessageSection.tsx
import React from "react";
import NumberRow from "./NumberRow";

type Props = {
  message: string;
  sendingProposal: boolean;
  setMessage: (value: string) => void;
  setUserEditedMessage: (value: boolean) => void;
};

const MessageSection = ({
  message,
  sendingProposal,
  setMessage,
  setUserEditedMessage,
}: Props) => {
  return (
    <section className="space-y-4 pt-6 border-t border-border/50">
      <header className="flex items-center justify-between">
        <NumberRow number={5} title="Add Message" />
        <span
          className={`text-xs tracking-widest font-bold ${
            message.length >= 500
              ? "text-rose-500"
              : message.length >= 400
                ? "text-accent"
                : "text-text-secondary"
          }`}
        >
          <span className="text-text-primary">{message.length}</span>
          /500
        </span>
      </header>
      <textarea
        value={message}
        disabled={sendingProposal}
        onChange={(e) => {
          setMessage(e.target.value);
          setUserEditedMessage(true);
        }}
        className="w-full min-h-30 rounded-2xl bg-surface/50 focus:bg-background border border-border p-5 text-sm resize-none focus:ring-4 focus:ring-primary/10 outline-none transition-all"
        placeholder="Type your message..."
      />
    </section>
  );
};

export default React.memo(MessageSection);
