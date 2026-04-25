"use client";

import { UIMessage } from "@/app/(protected)/chat/page";
import {
  Check,
  CheckCheck,
  Clock,
  Download,
  FileText,
  X,
  Play,
} from "lucide-react";
import { useMediaViewer } from "@/store/useMediaViewer";
import VoicePlayer from "./VoicePlayer";

const MessageBubble = ({ isMe, msg }: { isMe: boolean; msg: UIMessage }) => {
  const { openViewer } = useMediaViewer();

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

  const images = media.filter((m) => m.type === "image");
  const files = media.filter((m) => m.type === "file");
  const audioMedia = media.filter((m) => m.type === "audio");

  const isAudioMessage = audioMedia.length > 0;

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
        />
      )}

      <div className="flex flex-col max-w-[55%]">
        <div
          className={`text-sm shadow wrap-break-word ${
            isAudioMessage ? "px-4 py-2 rounded-t-xl" : "p-4 rounded-t-3xl"
          } ${
            isMe
              ? `bg-primary text-white ${isAudioMessage ? "rounded-bl-xl" : "rounded-bl-3xl"} `
              : "bg-surface text-text-primary rounded-br-3xl"
          }`}
        >
          {msg.type === "text" && (
            <p className="whitespace-pre-wrap">{msg.message}</p>
          )}

          {audioMedia.length > 0 && (
            <div className="mt-2 space-y-2">
              {audioMedia.map((audio) => (
                <VoicePlayer key={audio.url} src={audio.url} />
              ))}
            </div>
          )}

          {images.length > 0 && (
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
                  onClick={() => openFile(file)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/10 hover:bg-black/20 w-full"
                >
                  <FileText className="w-5 h-5" />

                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{file.name || "File"}</p>
                    <p className="text-xs opacity-60">Click to open</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(file.url, file.name);
                    }}
                    className="hover:scale-110 transition px-2"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-2 text-[10px] mt-1 text-gray-400 ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          <span>
            {msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </span>

          <span>{renderStatus()}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
