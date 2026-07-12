const ChatSkeleton = () => {
  const rows = [
    { isMe: false, width: "w-48" },
    { isMe: false, width: "w-32" },
    { isMe: true, width: "w-40" },
    { isMe: true, width: "w-56" },
    { isMe: false, width: "w-64" },
    { isMe: true, width: "w-28" },
    { isMe: false, width: "w-44" },
  ];

  return (
    <div className="flex-1 overflow-hidden p-4">
      <div className="flex flex-col space-y-5 animate-pulse">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              row.isMe ? "justify-end" : "justify-start"
            }`}
          >
            {!row.isMe && (
              <div className="w-8 h-8 rounded-full bg-surface shrink-0" />
            )}

            <div
              className={`flex flex-col gap-1.5 ${row.isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`h-10 ${row.width} rounded-t-3xl ${
                  row.isMe
                    ? "rounded-bl-3xl bg-primary/20"
                    : "rounded-br-3xl bg-surface"
                }`}
              />
              <div className="h-2.5 w-10 rounded-full bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSkeleton