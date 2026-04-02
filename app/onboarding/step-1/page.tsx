"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  X,
  CheckCircle2,
  Image as ImageIcon,
  File as FileIcon,
  ArrowLeft,
  ArrowRight,
  CheckCheckIcon,
} from "lucide-react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/image";
import { useAuthStore } from "@/store/useAuthStore";

const UploadProfilePicture = () => {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { updateUserOnboardingStepInDB } = useOnboardingStore();
  const {
    uploadUserProfilePic,
    updateUser,
    isUpdatingUser,
    isUploadingProfilePic,
    uploadProgress,
  } = useAuthStore();
  
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleFile = (selected?: File) => {
    if (selected && selected.type.startsWith("image/")) {
      const preview = URL.createObjectURL(selected);
      setImage(preview);
      setShowCropper(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (video.readyState < 2) {
      console.log("Video not ready yet");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new globalThis.File([blob], "camera-photo.jpg", {
        type: "image/jpeg",
      });

      setFile(file);
      setImage(URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg");
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const openCamera = () => {
    startCamera();
  };

  const openUpload = () => {
    if (inputRef.current) {
      inputRef.current.removeAttribute("capture");
      inputRef.current.click();
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setImage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadUserProfilePic(file);

      if (url) {
        await updateUser({
          avatarUrl: url,
        });
      }
      await updateUserOnboardingStepInDB(2);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }
  }, [showCamera]);

  const isUploading = isUploadingProfilePic;
  const isUpdating = isUpdatingUser;
  const isBusy = isUploading || isUpdating;

  return (
    <div className="min-h-[90vh] w-full flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
        <div className="max-w-xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Step 1: Identity
            </div>
            <h1 className="text-5xl md:text-5xl font-bold tracking-tight text-balance">
              Show the <span className="text-primary">Cirqle</span> who you are.
            </h1>
            <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
              First impressions in the Cirqle are visual. Upload a photo or take
              a selfie to help your future connections recognize the person
              behind the skills.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                text: "Clear lighting",
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
              },
              {
                text: "Neutral background",
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
              },
              {
                text: "Friendly expression",
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
              },
              {
                text: "High resolution",
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
              },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-muted-foreground font-medium"
              >
                {item.icon} {item.text}
              </li>
            ))}
          </ul>

          <div className="p-4 flex items-center justify-between w-full">
            <button className="flex gap-1 items-center text-text-secondary hover:text-text-primary transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            <button
              onClick={handleUpload}
              disabled={!file || isBusy}
              className={`
    relative overflow-hidden py-4 px-6 rounded-4xl font-bold flex  items-center justify-center gap-3 transition-all
    ${
      file
        ? "bg-text-secondary/10 text-primary-foreground"
        : " text-text-secondary hover:bg-text-secondary/10 cursor-not-allowed"
    }
  `}
            >
              {isUploading && (
                <div
                  className="absolute left-0 top-0 h-full bg-primary transition-all"
                  style={{
                    width: `${uploadProgress}%`,
                    transition: "width 0.2s ease-in-out",
                  }}
                />
              )}

              <div className="relative z-10 flex items-center gap-2">
                {isUploading ? (
                  <>
                    <Spinner />
                    <span>Uploading {Math.round(uploadProgress)}%</span>
                  </>
                ) : isUpdating ? (
                  <>
                    <Spinner />
                    <span>Updating profile...</span>
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight
                      className={`w-5 h-5 ${file ? "group-hover:translate-x-1" : ""}`}
                    />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="relative group">
          <div className="relative bg-surface-2 rounded-xl p-8 flex flex-col gap-10">
            <input
              type="file"
              accept="image/*"
              ref={inputRef}
              hidden
              onChange={handleImageChange}
            />

            <div
              onClick={openUpload}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                relative h-80 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 overflow-hidden
                ${isDragging ? "border-primary bg-primary/10 scale-[0.98]" : "border-white/30 hover:border-white/60 bg-secondary/20"}
                ${image ? "border-solid border-primary/50" : ""}
              `}
            >
              {!image ? (
                <div className="flex flex-col items-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm animate-pulse">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      Drop your photo here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse from device
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button
                      onClick={clearSelection}
                      className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-destructive/90 transition"
                    >
                      <X className="w-4 h-4" /> Change Photo
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={openUpload}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-md text-background bg-text-primary transition-colors font-medium shadow-sm"
              >
                <FileIcon className="w-4 h-4" /> Choose File
              </button>

              <button
                onClick={openCamera}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-md  bg-surface-1 hover:bg-white/20 transition-colors font-medium shadow-sm"
              >
                <Camera className="w-4 h-4" /> Take Photo
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute bottom-10 flex items-center gap-6">
            <button
              onClick={stopCamera}
              className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white"
            >
              Cancel
            </button>

            <button
              onClick={capturePhoto}
              disabled={!videoRef.current || videoRef.current.readyState < 2}
              className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {showCropper && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={image!}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) =>
                setCroppedAreaPixels(croppedAreaPixels)
              }
            />
          </div>

          <div className="p-6 flex justify-between bg-black">
            <button onClick={() => setShowCropper(false)}>
              {" "}
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "50px", color: "red" }}
              >
                cancel
              </span>
            </button>

            <button
              onClick={async () => {
                const blob = await getCroppedImg(image!, croppedAreaPixels);

                const file = new globalThis.File([blob], "avatar.jpg", {
                  type: "image/jpeg",
                });

                setFile(file);
                setImage(URL.createObjectURL(blob));
                setShowCropper(false);
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "50px", color: "green" }}
              >
                check_circle
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProfilePicture;
