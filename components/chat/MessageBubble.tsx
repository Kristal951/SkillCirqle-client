import { UIMessage } from "@/app/(protected)/chat/page";
import { Check, CheckCheck, Clock, X } from "lucide-react";

const MessageBubble = ({ isMe, msg }: { isMe: boolean; msg: UIMessage }) => {
  const renderStatus = () => {
    if (!isMe) return null;

    switch (msg.status) {
      case "sending":
        return <Clock size={12} className="text-gray-300 animate-pulse" />;

      case "sent":
        return <Check size={14} className="text-gray-300" />;

      case "delivered":
        return <CheckCheck size={14} className="text-gray-400" />;

      case "read":
        return <CheckCheck size={14} className="text-blue-500" />;

      case "failed":
        return <X size={14} className="text-red-500" />;

      default:
        return <Check size={14} className="text-gray-300 opacity-40" />;
    }
  };

  return (
    <div
      className={`flex items-end gap-2 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {!isMe && (
        <img
          src={
            msg.sender?.avatar ||
            `https://i.pravatar.cc/150?u=${msg.sender?.id}`
          }
          className="w-8 h-8 rounded-full object-cover"
          alt="avatar"
        />
      )}

      <div className="flex flex-col max-w-[50%]">
        <div
          className={`p-4 text-sm shadow wrap-break-word ${
            isMe
              ? "bg-primary text-white rounded-t-3xl rounded-bl-3xl"
              : "bg-surface text-text-primary rounded-t-3xl rounded-br-3xl"
          }`}
        >
          {msg.type === "text" && (
            <p className="whitespace-pre-wrap leading-relaxed">
              {msg.message?.trim() || " "}
            </p>
          )}

          {msg.type === "image" && msg.mediaUrl && (
            <div className="space-y-2">
              <img
                src={msg.mediaUrl}
                className="rounded-xl w-full object-cover max-h-75"
                alt="media"
              />
              {msg.message && (
                <p className="whitespace-pre-wrap">{msg.message}</p>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-2 text-[10px] mt-1 text-gray-400 ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          <span className="opacity-80">
            {msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </span>

          <span className="flex items-center">{renderStatus()}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
