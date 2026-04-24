"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { MessageType, useChatStore } from "@/store/useChatStore";
import { CirclePlus, Send, Smile, Mic, X } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { uploadFile } from "@/utils/uploadFile";

const Input = () => {
  const [message, setMessage] = useState("");
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [uploadingFiles, setUploadingFiles] = useState<
    { file: File; id: string; previewUrl: string }[]
  >([]);
  const [uploadedMedia, setUploadedMedia] = useState<
    { url: string; file: File; id: string }[]
  >([]);

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const [isUploading, setIsUploading] = useState(false);

  const { sendMessage, activeChat } = useChatStore();
  const { user } = useAuthStore();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversationId = activeChat?.id;

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getSafeSocket = () => getSocket();
  const userId = user?.id || "";

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

  const toggleAttachmentModal = () => {
    setShowAttachmentModal((prev) => !prev);
  };

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

  const canShowSend = message.trim().length > 0 || uploadedMedia.length > 0;

  const handleFilePreview = async (files: File[]) => {
    setShowAttachmentModal(false);
    setIsUploading(true);

    const prepared = files.map((file) => {
      const id = `${file.name}-${file.size}-${Date.now()}`;

      return {
        file,
        id,
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith("image/") ? "image" : "file",
      };
    });

    setUploadingFiles(prepared);

    const uploads = prepared.map(async ({ file, id, type }) => {
      setUploadProgress((prev) => ({
        ...prev,
        [id]: 0,
      }));

      const url = await uploadFile(file, userId, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          [id]: progress,
        }));
      });

      return {
        id,
        url,
        file,
        type,
        previewUrl: type === "image" ? URL.createObjectURL(file) : "",
      };
    });

    const results = await Promise.all(uploads);

    setUploadedMedia(results);
    setUploadingFiles([]);
    setIsUploading(false);
  };
  const canSend = !isUploading;

  const handleRemoveUploadedMedia = (id: string) => {
    setUploadedMedia((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = async () => {
    setShowAttachmentModal(false);

    if (!conversationId || isUploading) return;

    const images = uploadedMedia.filter((m) =>
      m.file.type.startsWith("image/"),
    );

    const files = uploadedMedia.filter(
      (m) => !m.file.type.startsWith("image/"),
    );

    const hasText = message.trim().length > 0;
    const hasImages = images.length > 0;
    const hasFiles = files.length > 0;

    if (!hasText && !hasImages && !hasFiles) return;

    let type: MessageType = "text";

    if (hasImages && hasFiles) type = "mixed";
    else if (hasImages) type = "image";
    else if (hasFiles) type = "file";

    const imageCount = images.length;
    const fileCount = files.length;

    const content = hasText
      ? message.trim()
      : hasImages && !hasFiles
        ? imageCount === 1
          ? "Sent an image"
          : `Sent ${imageCount} images`
        : hasFiles && !hasImages
          ? fileCount === 1
            ? "Sent a file"
            : `Sent ${fileCount} files`
          : `Sent ${uploadedMedia.length} items`;

    sendMessage({
      conversationId,
      senderId: user?.id || "",
      senderAvatar: user?.avatar_url || "",
      content,
      type,
      metadata: uploadedMedia.length
        ? {
            media: uploadedMedia.map((m) => ({
              url: m.url,
              name: m.file.name,
              type: m.file.type.startsWith("image/") ? "image" : "file",
            })),
          }
        : undefined,
      name: user?.name || "",
    });

    setMessage("");
    setUploadedMedia([]);
    setUploadProgress({});

    const socket = getSafeSocket();
    socket?.emit("stop_typing", {
      conversationId,
      userId: user?.id,
    });
  };

  const handleRemoveFile = (id: string) => {
    setUploadingFiles((prev) => {
      const target = prev.find((f) => f.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return prev.filter((f) => f.id !== id);
    });

    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrls) previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="w-full sticky flex-col bottom-0 p-3 bg-surface/60 backdrop-blur-md flex gap-2 border-t border-border">
      {uploadingFiles.length > 0 && (
        <div className="w-full flex gap-2 flex-wrap">
          {uploadingFiles.map(({ file, id, previewUrl }) => {
            const progress = uploadProgress[id] || 0;

            return (
              <div key={id} className="relative w-20 h-20">
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover opacity-60 rounded-lg"
                />

                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {Math.round(progress)}%
                </div>

                <button
                  onClick={() => handleRemoveFile(id)}
                  className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-black/80"
                >
                  <X />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {uploadedMedia.length > 0 && !isUploading && (
        <div className="flex gap-2 flex-wrap">
          {uploadedMedia.map((item) => (
            <div key={item.id} className="relative w-20 h-20">
              {item.file.type.startsWith("image/") ? (
                <img
                  src={item.url}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-surface flex flex-col items-center justify-center text-xs p-2 text-center">
                  📄
                  <span className="mt-1 truncate w-full">{item.file.name}</span>
                </div>
              )}

              <button
                onClick={() => handleRemoveUploadedMedia(item.id)}
                className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-black/80"
              >
                <X />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="w-full h-full flex items-center gap-4">
        <button
          onClick={toggleAttachmentModal}
          aria-label="Add attachment"
          title="Add attachment"
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors duration-200"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{
              fontVariationSettings: `'FILL' ${showAttachmentModal ? 1 : 0}, 'wght' 400`,
            }}
          >
            add_circle
          </span>
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

        {canShowSend ? (
          <button
            onClick={handleSend}
            disabled={!canSend || isUploading}
            className={`p-2 bg-primary rounded-lg ${
              !canSend || isUploading
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button className="p-2">
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>

      {showAttachmentModal && (
        <div className="w-60 bottom-20 rounded-xl bg-surface absolute">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 w-full hover:bg-primary/10 py-4 px-6 transition-colors text-text-primary group"
          >
            <span
              className="material-symbols-outlined text-text-primary group-hover:scale-110 transition-transform"
              style={{
                fontVariationSettings: "'FILL' 1",
              }}
            >
              description
            </span>
            <span className="text-base font-medium">Document</span>
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-3 w-full hover:bg-primary/10 py-4 px-6 transition-colors text-text-primary group"
          >
            <span
              className="material-symbols-outlined text-text-primary group-hover:scale-110 transition-transform"
              style={{
                fontVariationSettings: "'FILL' 1",
              }}
            >
              image
            </span>
            <span className="text-base font-medium">Image</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 w-full hover:bg-primary/10 py-4 px-6 transition-colors text-text-primary group"
          >
            <span
              className="material-symbols-outlined text-text-primary group-hover:scale-110 transition-transform"
              style={{
                fontVariationSettings: "'FILL' 1",
              }}
            >
              folder
            </span>
            <span className="text-base font-medium">File</span>
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        hidden
        multiple
        ref={imageInputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          handleFilePreview(files);
        }}
      />

      <input
        type="file"
        hidden
        multiple
        ref={fileInputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          handleFilePreview(files);
        }}
      />
    </div>
  );
};

export default Input;
