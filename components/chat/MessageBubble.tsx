"use client";

import { UIMessage } from "@/app/(protected)/chat/page";
import {
  Check,
  CheckCheck,
  Clock,
  Download,
  FileText,
  X,
  Edit2,
  Copy,
  Reply,
  Trash2,
} from "lucide-react";
import { useMediaViewer } from "@/store/useMediaViewer";
import VoicePlayer from "./VoicePlayer";
import { AnimatePresence, motion } from "framer-motion";
import { useMessageActionsStore } from "@/store/useMessageStore";
import { useChatStore } from "@/store/useChatStore";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const MessageBubble = ({
  isMe,
  msg,
  messageRefs,
}: {
  isMe: boolean;
  msg: UIMessage;
  messageRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
}) => {
  const { openViewer } = useMediaViewer();

  const {
    activeMessageId,
    toggleMessageMenu,
    copyMessage,
    deleteMessage,
    setReply,
    setEditingMessage,
  } = useMessageActionsStore();
  const { activeChat } = useChatStore();
  const { user } = useAuthStore();

  const isOpen = activeMessageId === msg.id;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  let time = "";

  if (msg.deleted && msg.deletedAt) {
    time = `Deleted at ${new Date(msg.deletedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (msg.edited && msg.updatedAt) {
    time = `Edited at ${new Date(msg.updatedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    time = new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMessageMenu(msg.id);
  };

  const handleReplyClick = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollToMessage(id);
  };

  const scrollToMessage = (id: string) => {
    const el = messageRefs.current[id];
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    el.classList.add("bg-accent/5", "animate-pulse");

    setTimeout(() => {
      el.classList.remove("bg-accent/5", "animate-pulse");
    }, 2000);
  };

  const handleEditMsg = (
    msgId: string,
    content: string,
    conversationId: string,
  ) => {
    setEditingMessage({
      id: msgId,
      content: content,
      conversationId: conversationId,
    });
  };

  const getStatus = () => {
    if (!isMe) return null;

    const receipt = msg as any;

    if (receipt.status === "sending") return "sending";
    if (receipt.status === "failed") return "failed";
    if (receipt.status === "read") return "read";
    if (receipt.status === "delivered") return "delivered";
    return "sent";
  };

  const renderStatus = () => {
    if (!isMe) return null;

    switch (getStatus()) {
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

  const media = msg.media || [];
  const isMediaMessage = msg?.type === "image" || msg?.type === "file";

  const images = media.filter((m) => m.type === "image");
  const files = media.filter((m) => m.type === "file");
  const audioMedia = media.filter((m) => m.type === "audio");

  const isAudioMessage = audioMedia.length > 0;
  const isFileMessage = files.length > 0;

  const openFile = (file: any) => {
    const url = file.url;
    const name = file.name || "";

    const ext = name.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      window.open(url, "_blank");
      return;
    }

    if (ext === "docx" || ext === "doc") {
      window.open(
        `https://docs.google.com/gview?url=${encodeURIComponent(
          url,
        )}&embedded=true`,
        "_blank",
      );
      return;
    }

    if (file.mime?.startsWith("video/")) {
      window.open(url, "_blank");
      return;
    }

    window.open(url, "_blank");
  };

  const downloadFile = async (url: string, filename?: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!activeMessageId) return;

      const target = e.target as Node;

      const clickedInsideMenu = menuRef.current?.contains(target);

      const clickedInsideBubble = containerRef.current?.contains(target);

      if (!clickedInsideMenu && !clickedInsideBubble) {
        toggleMessageMenu("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMessageId]);

  return (
    <div
      ref={(el) => {
        messageRefs.current[msg.id] = el;
        containerRef.current = el;
      }}
      className={`flex items-end gap-2 ${msg?.deleted ? "opacity-70 cursor-not-allowed" : "opacity-100"} ${
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
        />
      )}

      <div
        className="flex flex-col md:max-w-[55%] max-w-[70%] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle(e);
        }}
      >
        <div className="relative h-0">
          <AnimatePresence>
            {isOpen && msg?.status !== "failed" && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={` ${msg?.deleted ? "hidden" : "absolute"} -top-12 z-100 flex items-center gap-1 p-1 bg-surface/80 backdrop-blur-md border border-border shadow-xl rounded-2xl ${
                  isMe ? "right-0" : "left-0"
                }`}
              >
                {[
                  {
                    icon: Copy,
                    action: () => copyMessage(msg),
                  },
                  {
                    icon: Edit2,
                    action: () =>
                      handleEditMsg(msg.id, msg.message, activeChat?.id || ""),
                    show: isMe,
                  },
                  {
                    icon: Reply,
                    action: () => setReply(msg),
                  },
                  {
                    icon: Trash2,
                    action: () => deleteMessage(msg.id, activeChat?.id || ""),
                    danger: true,
                    show: isMe,
                  },
                ]
                  .filter((item) => item.show !== false)
                  .map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      className={`p-2  rounded-xl transition-colors hover:bg-background flex items-center gap-2 ${
                        item.danger
                          ? "hover:bg-red-500/10 text-red-500"
                          : "hover:bg-white/10 text-text-primary"
                      }`}
                    >
                      <item.icon size={16} />
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          className={`text-sm shadow wrap-break-word ${
            isAudioMessage || isFileMessage
              ? "p-4 rounded-t-xl"
              : "p-3 rounded-t-3xl"
          } ${
            isMe
              ? `bg-primary text-white ${isAudioMessage ? "rounded-bl-xl" : "rounded-bl-3xl"} `
              : "bg-surface text-text-primary rounded-br-3xl"
          }`}
        >
          {msg.reply && !msg.deleted && (
            <div
              onClick={handleReplyClick(msg?.reply?.id || "")}
              className={`flex flex-col mb-2 py-3 px-2 rounded-t-2xl border border-border/50 border-b-0 ${isMe ? "items-end bg-surface/40" : "items-start bg-background/50"} `}
            >
              <div className="flex items-center gap-2 border-l-2 border-primary pl-2 overflow-hidden w-full">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-text-primary/70 uppercase tracking-tighter">
                    {msg?.reply?.sender_id === user?.id
                      ? "You"
                      : msg?.reply?.metadata?.sender_name || "User"}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {msg?.reply?.content}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* {audioMedia.length > 0 && (
            <div className="mt-2 space-y-2">
              {audioMedia.map((audio) => (
                <VoicePlayer key={audio.url} src={audio.url} />
              ))}
            </div>
          )} */}

          {images.length > 0 && !msg?.deleted && (
            <div
              className={`grid gap-1 rounded-xl overflow-hidden ${
                images.length === 1
                  ? "grid-cols-1"
                  : images.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2"
              }`}
            >
              {images.slice(0, 4).map((img, index) => {
                const isLast = index === 3 && images.length > 4;

                return (
                  <div key={img.url} className="relative">
                    <img
                      src={img.url}
                      className="w-full h-40 object-cover cursor-pointer"
                      onClick={() =>
                        openViewer({
                          images,
                          index,
                        })
                      }
                    />

                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium pointer-events-none">
                        +{images.length - 4}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {msg.type === "file" && files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.url}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    openFile(file);
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/10 hover:bg-black/20 w-full"
                >
                  <FileText className="w-5 h-5" />

                  <div className="flex-1 text-left">
                    <p className="text-xs md:text-sm lg:text-sm font-medium">{file.name || "File"}</p>
                    <p className="text-xs opacity-60">Click to open</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(file.url, file.name);
                    }}
                    className={`hover:scale-110 transition p-2 rounded-lg ${isMe ? "bg-primary " : "bg-background"}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p
            className={`whitespace-pre-wrap ${
              (msg?.type === "image" || msg?.type === "file") && !msg.deleted
                ? "pt-3 px-2"
                : "py-0"
            }`}
          >
            {msg.deleted
              ? `This message was deleted by ${isMe ? "You" : msg?.sender?.name}`
              : isMediaMessage
                ? msg?.caption
                : msg?.message}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 text-[10px] mt-1 text-gray-400 ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          <span>{time}</span>

          <span>{renderStatus()}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
