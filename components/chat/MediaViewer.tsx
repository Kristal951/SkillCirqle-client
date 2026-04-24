"use client";

import { useEffect } from "react";
import { useMediaViewer } from "@/store/useMediaViewer";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

const MediaViewer = () => {
  const { isOpen, media, closeViewer, setIndex } = useMediaViewer();

  const images = media?.images || [];
  const currentIndex = media?.index || 0;

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const next = () => {
    if (!images.length) return;
    setIndex((currentIndex + 1) % images.length);
  };

  const prev = () => {
    if (!images.length) return;
    setIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

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

  if (!isOpen || !media || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-1000 flex flex-col items-center justify-center">
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-linear-to-b from-black/60 to-transparent">
        <div className="text-white">
          <p className="text-sm font-medium">{currentImage?.name || "Image"}</p>
          <p className="text-xs opacity-60">
            {currentIndex + 1} of {images.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadFile(currentImage.url, currentImage.name);
            }}
            className="p-2 hover:bg-white/10 rounded-full text-white"
          >
            <Download size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeViewer();
            }}
            className="p-2 hover:bg-white/10 rounded-full text-white"
          >
            <X size={26} />
          </button>
        </div>
      </div>

      <div
        {...handlers}
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={closeViewer}
      >
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-6 p-3 hover:bg-white/10 text-white rounded-full z-50 hidden md:block"
            >
              <ChevronLeft size={48} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-6 p-3 hover:bg-white/10 text-white rounded-full z-50 hidden md:block"
            >
              <ChevronRight size={48} />
            </button>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage.url}
            src={currentImage.url}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-8 flex gap-2 p-2 bg-black/40 rounded-xl border border-white/10 z-50 overflow-x-auto max-w-[90vw]">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                currentIndex === i
                  ? "border-primary scale-110"
                  : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              <img src={img.url} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaViewer;
