"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useMemo, useEffect, useRef } from "react";
import { X, QrCode, Download } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface ProfileQrProp {
  id: string;
  setShowQrModal: (show: boolean) => void;
}

export default function ProfileQR({ id, setShowQrModal }: ProfileQrProp) {
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/profile/${id}`;
  }, [id]);
  const { user } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowQrModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setShowQrModal]);

  const qrWrapperRef = useRef<HTMLDivElement | null>(null);

  const downloadQR = () => {
    if (!qrWrapperRef.current) return;

    const canvas = qrWrapperRef.current.querySelector("canvas");
    if (!canvas) return;
    const safeName = user?.name?.replace(/[^a-z0-9]/gi, "-").toLowerCase();

    try {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;

      a.download = `skillcirqle-${safeName}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to generate or download QR code:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={() => setShowQrModal(false)}
    >
      <div
        className="w-full max-w-xs p-6 bg-surface border border-border/10 rounded-2xl flex flex-col items-center gap-5 shadow-2xl relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowQrModal(false)}
          className="absolute top-4 right-4 p-1.5 text-text-secondary hover:text-text-primary bg-background/40 hover:bg-surface/80 border border-border/5 rounded-lg transition-all active:scale-95"
          title="Dismiss Modal"
        >
          <X size={14} />
        </button>

        <div className="flex flex-col items-center gap-1.5 text-center mt-2">
          <div className="w-10 h-10 bg-primary/5 border border-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm mb-1">
            <QrCode size={18} />
          </div>
          <h3 className="text-sm font-bold text-text-primary tracking-tight">
            Share Profile
          </h3>
        </div>

        <div
          ref={qrWrapperRef}
          className="p-3 bg-white border border-gray-100 rounded-xl shadow-inner select-none"
        >
          <QRCodeCanvas
            value={url}
            size={160}
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="text-center space-y-0.5">
          <p className="text-sm font-bold text-text-primary">
            Scan to view profile
          </p>
          <p className="text-[11px] text-text-secondary/60 max-w-50 mx-auto leading-normal">
            Open your device camera to scan QR code.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadQR}
          className="w-full mt-1 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Download size={14} />
          <span>Download QR</span>
        </button>
      </div>
    </div>
  );
}
