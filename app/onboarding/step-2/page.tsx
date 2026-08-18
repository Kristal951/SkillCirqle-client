// "use client";

// import React, { useRef, useState, useEffect } from "react";
// import {
//   Camera,
//   X,
//   CheckCircle2,
//   Image as ImageIcon,
//   File as FileIcon,
//   ArrowLeft,
//   ArrowRight,
// } from "lucide-react";
// import { useOnboardingStore } from "@/store/useOnboardingStore";
// import Spinner from "@/components/ui/Spinner";
// import Cropper from "react-easy-crop";
// import { getCroppedImg } from "@/lib/image";
// import { useAuthStore } from "@/store/useAuthStore";
// import { useRouter } from "next/navigation";

// const UploadProfilePicture = () => {
//   const [image, setImage] = useState<string | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const [showCropper, setShowCropper] = useState(false);
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const { updateUserOnboardingStepInDB } = useOnboardingStore();
//   const {
//     uploadUserProfilePic,
//     updateUser,
//     isUpdatingUser,
//     isUploadingProfilePic,
//     uploadProgress,
//   } = useAuthStore();
//   const router = useRouter();

//   useEffect(() => {
//     return () => {
//       if (image) URL.revokeObjectURL(image);
//     };
//   }, [image]);

//   const handleFile = (selected?: File) => {
//     if (selected && selected.type.startsWith("image/")) {
//       const preview = URL.createObjectURL(selected);
//       setImage(preview);
//       setShowCropper(true);
//     }
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     handleFile(e.target.files?.[0]);
//   };

//   const onDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user" },
//       });

//       streamRef.current = stream;
//       setShowCamera(true);
//     } catch (err) {
//       console.error("Camera error:", err);
//     }
//   };

//   const stopCamera = () => {
//     streamRef.current?.getTracks().forEach((track) => track.stop());
//     setShowCamera(false);
//   };

//   const capturePhoto = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     if (!video || !canvas) return;

//     if (video.readyState < 2) {
//       console.log("Video not ready yet");
//       return;
//     }

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     ctx.drawImage(video, 0, 0);

//     canvas.toBlob((blob) => {
//       if (!blob) return;

//       const file = new globalThis.File([blob], "camera-photo.jpg", {
//         type: "image/jpeg",
//       });

//       setFile(file);
//       setImage(URL.createObjectURL(blob));
//       stopCamera();
//     }, "image/jpeg");
//   };

//   const onDragLeave = () => setIsDragging(false);

//   const onDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     handleFile(e.dataTransfer.files?.[0]);
//   };

//   const openCamera = () => {
//     startCamera();
//   };

//   const openUpload = () => {
//     if (inputRef.current) {
//       inputRef.current.removeAttribute("capture");
//       inputRef.current.click();
//     }
//   };

//   const clearSelection = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setFile(null);
//     setImage(null);
//     if (inputRef.current) inputRef.current.value = "";
//   };

//   const handleUpload = async () => {
//     if (!file) return;

//     setLoading(true);

//     try {
//       const url = await uploadUserProfilePic(file);

//       if (!url) return;

//       const success = await updateUser({
//         avatar_url: url,
//       });

//       if (!success) return;

//       await updateUserOnboardingStepInDB(2);
//     } catch (err) {
//       console.error("Upload error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     return () => {
//       streamRef.current?.getTracks().forEach((track) => track.stop());
//     };
//   }, []);

//   useEffect(() => {
//     if (showCamera && videoRef.current && streamRef.current) {
//       videoRef.current.srcObject = streamRef.current;

//       videoRef.current.onloadedmetadata = () => {
//         videoRef.current?.play();
//       };
//     }
//   }, [showCamera]);

//   const isUploading = isUploadingProfilePic;
//   const isUpdating = isUpdatingUser;
//   const isBusy = isUploading || isUpdating;

//   return (
//     <div className="h-full w-full flex items-center justify-center bg-background md:px-6 px-4 mt-6 md:py-12">
//       <div className="w-full max-w-6xl grid h-full lg:grid-cols-2 gap-16 items-center">
//         <div className="max-w-xl space-y-8">
//           <div className="space-y-4">
//             <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
//               Step 1: Identity
//             </div>
//             <h1 className="text-5xl md:text-5xl font-bold tracking-tight text-balance">
//               Show the <span className="text-primary">Cirqle</span> who you are.
//             </h1>
//             <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
//               First impressions in the Cirqle are visual. Upload a photo or take
//               a selfie to help your future connections recognize the person
//               behind the skills.
//             </p>
//           </div>

//           <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {[
//               {
//                 text: "Clear lighting",
//                 icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
//               },
//               {
//                 text: "Neutral background",
//                 icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
//               },
//               {
//                 text: "Friendly expression",
//                 icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
//               },
//               {
//                 text: "High resolution",
//                 icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
//               },
//             ].map((item, i) => (
//               <li
//                 key={i}
//                 className="flex items-center gap-3 text-muted-foreground font-medium"
//               >
//                 {item.icon} {item.text}
//               </li>
//             ))}
//           </ul>

//           <div className=" hidden lg:flex p-4 items-center justify-between w-full">
//             <button className="flex gap-1 items-center text-text-secondary hover:text-text-primary transition-colors font-medium">
//               <ArrowLeft className="w-4 h-4" />
//               Go Back
//             </button>

//             <button
//               onClick={handleUpload}
//               disabled={!file || isBusy}
//               className={`
//     relative overflow-hidden md:py-4 py-2 md:px-6 px-4 rounded-4xl font-bold flex  items-center justify-center gap-3 transition-all
//     ${
//       file
//         ? "bg-text-secondary/10 text-primary-foreground"
//         : " text-text-secondary hover:bg-text-secondary/10 cursor-not-allowed"
//     }
//   `}
//             >
//               {isUploading && (
//                 <div
//                   className="absolute left-0 top-0 h-full bg-primary transition-all"
//                   style={{
//                     width: `${uploadProgress}%`,
//                     transition: "width 0.2s ease-in-out",
//                   }}
//                 />
//               )}

//               <div className="relative z-10 flex items-center gap-2">
//                 {isUploading ? (
//                   <>
//                     <Spinner />
//                     <span>Uploading {Math.round(uploadProgress)}%</span>
//                   </>
//                 ) : isUpdating ? (
//                   <>
//                     <Spinner />
//                     <span>Updating profile...</span>
//                   </>
//                 ) : (
//                   <>
//                     Next Step
//                     <ArrowRight
//                       className={`w-5 h-5 ${file ? "group-hover:translate-x-1" : ""}`}
//                     />
//                   </>
//                 )}
//               </div>
//             </button>
//           </div>
//         </div>

//         <div className="relative group">
//           <div className="relative bg-surface-2 rounded-xl md:p-8 p-4 flex flex-col gap-10">
//             <input
//               type="file"
//               accept="image/*"
//               ref={inputRef}
//               hidden
//               onChange={handleImageChange}
//             />

//             <div
//               onClick={openUpload}
//               onDragOver={onDragOver}
//               onDragLeave={onDragLeave}
//               onDrop={onDrop}
//               className={`
//                 relative h-80 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 overflow-hidden
//                 ${isDragging ? "border-primary bg-primary/10 scale-[0.98]" : "border-white/30 hover:border-white/60 bg-secondary/20"}
//                 ${image ? "border-solid border-primary/50" : ""}
//               `}
//             >
//               {!image ? (
//                 <div className="flex flex-col items-center text-center p-6 space-y-4">
//                   <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm animate-pulse">
//                     <ImageIcon className="w-8 h-8 text-primary" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-lg">
//                       Drop your photo here
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       or click to browse from device
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <img
//                     src={image}
//                     alt="Preview"
//                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                   />
//                   <div className="absolute inset-0 bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center justify-center">
//                     <button
//                       onClick={clearSelection}
//                       className="bg-text-secondary/80 text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-text-secondary/90 transition"
//                     >
//                       <X className="w-4 h-4" /> Change Photo
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <button
//                 onClick={openUpload}
//                 className="flex items-center justify-center gap-2 md:px-4 px-2 md:py-3 py-2 rounded-md text-background bg-text-primary transition-colors font-medium shadow-sm"
//               >
//                 <FileIcon className="w-4 h-4" /> Choose File
//               </button>

//               <button
//                 onClick={openCamera}
//                 className="flex items-center justify-center gap-2 px-4 py-3 rounded-md  bg-surface-1 hover:bg-white/20 transition-colors font-medium shadow-sm"
//               >
//                 <Camera className="w-4 h-4" /> Take Photo
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className=" p-4 lg:hidden flex items-center justify-between w-full">
//           <button
//             onClick={() => router.back()}
//             className="flex gap-1 items-center text-text-secondary hover:text-text-primary transition-colors font-medium"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Go Back
//           </button>

//           <button
//             onClick={handleUpload}
//             disabled={!file || isBusy}
//             className={`
//     relative overflow-hidden py-4 px-6 rounded-4xl font-bold flex  items-center justify-center gap-3 transition-all
//     ${
//       file
//         ? "bg-text-secondary/10 text-primary-foreground"
//         : " text-text-secondary hover:bg-text-secondary/10 cursor-not-allowed"
//     }
//   `}
//           >
//             {isUploading && (
//               <div
//                 className="absolute left-0 top-0 h-full bg-primary transition-all"
//                 style={{
//                   width: `${uploadProgress}%`,
//                   transition: "width 0.2s ease-in-out",
//                 }}
//               />
//             )}

//             <div className="relative z-10 flex items-center gap-2">
//               {isUploading ? (
//                 <>
//                   <Spinner />
//                   <span>Uploading {Math.round(uploadProgress)}%</span>
//                 </>
//               ) : isUpdating ? (
//                 <>
//                   <Spinner />
//                   <span>Updating profile...</span>
//                 </>
//               ) : (
//                 <>
//                   Next Step
//                   <ArrowRight
//                     className={`w-5 h-5 ${file ? "group-hover:translate-x-1" : ""}`}
//                   />
//                 </>
//               )}
//             </div>
//           </button>
//         </div>
//       </div>

//       {showCamera && (
//         <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             className="w-full h-full object-cover"
//           />

//           <canvas ref={canvasRef} className="hidden" />

//           <div className="absolute bottom-10 flex items-center gap-6">
//             <button
//               onClick={stopCamera}
//               className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white"
//             >
//               Cancel
//             </button>

//             <button
//               onClick={capturePhoto}
//               disabled={!videoRef.current || videoRef.current.readyState < 2}
//               className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 disabled:opacity-50"
//             />
//           </div>
//         </div>
//       )}

//       {showCropper && (
//         <div className="fixed inset-0 z-50 bg-black flex flex-col">
//           <div className="relative flex-1">
//             <Cropper
//               image={image!}
//               crop={crop}
//               zoom={zoom}
//               aspect={1}
//               cropShape="round"
//               onCropChange={setCrop}
//               onZoomChange={setZoom}
//               onCropComplete={(_, croppedAreaPixels) =>
//                 setCroppedAreaPixels(croppedAreaPixels)
//               }
//             />
//           </div>

//           <div className="p-6 flex justify-between bg-black">
//             <button onClick={() => setShowCropper(false)}>
//               {" "}
//               <span
//                 className="material-symbols-outlined"
//                 style={{ fontSize: "50px", color: "red" }}
//               >
//                 cancel
//               </span>
//             </button>

//             <button
//               onClick={async () => {
//                 const blob = await getCroppedImg(image!, croppedAreaPixels);

//                 const file = new globalThis.File([blob], "avatar.jpg", {
//                   type: "image/jpeg",
//                 });

//                 setFile(file);
//                 setImage(URL.createObjectURL(blob));
//                 setShowCropper(false);
//               }}
//             >
//               <span
//                 className="material-symbols-outlined"
//                 style={{ fontSize: "50px", color: "green" }}
//               >
//                 check_circle
//               </span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UploadProfilePicture;

"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  VerifiableSkill,
  VerifySkillModal,
} from "@/components/VerifySkillModal";
import Spinner from "@/components/ui/Spinner";
import Psychology from "@material-symbols/svg-400/outlined/psychology.svg";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

type TeachSkill = {
  skill_id: string;
  name?: string;
  type: string;
  verified?: boolean;
};

const SkillRowSkeleton = () => (
  <div className="flex items-center justify-between gap-4 bg-background/40 w-full border border-border/50 pl-4 pr-2 py-2.5 rounded-lg animate-pulse">
    <div className="flex items-center gap-2 flex-1">
      <div className="w-5 h-5 rounded-md bg-text-secondary/15 shrink-0" />
      <div className="h-4 bg-text-secondary/15 rounded-md w-2/5" />
    </div>
    <div className="h-6 w-16 bg-text-secondary/15 rounded-md shrink-0" />
  </div>
);

const OnboardingStep2 = () => {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const { updateUserOnboardingStepInDB } = useOnboardingStore();

  const [teachSkills, setTeachSkills] = useState<TeachSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const [selectedSkillToVerify, setSelectedSkillToVerify] =
    useState<VerifiableSkill | null>(null);
  const [submittedSkills, setSubmittedSkills] = useState<Set<string>>(
    new Set(),
  );
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const fetchTeachSkills = async () => {
      setLoadingSkills(true);
      setSkillsError(null);

      try {
        const res = await fetch("/api/user/skills/skill-with-id?type=teach");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load skills");
        }

        setTeachSkills(data.skills || []);
      } catch (err) {
        console.error("Failed to fetch teach skills:", err);
        setSkillsError("Couldn't load your skills. Please try again.");
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchTeachSkills();
  }, []);

  const handleContinue = async () => {
    setFinishing(true);

    try {
      const success = await updateUser({ has_onboarded: true });

      if (!success) {
        toast.error("Failed to complete onboarding");
        return;
      }

      await updateUserOnboardingStepInDB(2, true);

      router.replace("/onboarding/onboardingCompleted");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setFinishing(false);
    }
  };

  const handleSkip = () => {
    router.replace("/dashboard");
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-10">
      <div className="flex flex-col gap-1 mb-4 items-center justify-center text-center">
        <div className="p-3 bg-primary/10 rounded-2xl mb-2">
          <BadgeCheck className="text-primary" size={28} />
        </div>
        <h1 className="text-4xl font-bold text-text-primary">
          Verify your skills
        </h1>
        <p className="text-text-secondary text-sm max-w-md">
          Verified skills get a badge on your profile and stand out in search.
          This step is optional — you can always verify later from your profile.
        </p>
      </div>

      <div className="w-full max-w-xl mx-auto bg-surface/50 p-6 border border-border/50 rounded-xl">
        {loadingSkills ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkillRowSkeleton key={i} />
            ))}
          </div>
        ) : skillsError ? (
          <p className="text-sm text-red-500 text-center py-8">{skillsError}</p>
        ) : teachSkills.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            You didn't add any teaching skills yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {teachSkills.map((skill) => {
              const alreadySubmitted =
                submittedSkills.has(skill.skill_id) || skill.verified;

              return (
                <div
                  key={skill.skill_id}
                  className="flex items-center justify-between gap-4 bg-primary/10 w-full border border-primary/30 text-text-primary text-sm font-medium pl-4 pr-2 py-2.5 rounded-lg"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Psychology className="text-text-secondary text-lg shrink-0" />
                    <span className="truncate">{skill.name}</span>
                  </div>

                  <button
                    type="button"
                    disabled={alreadySubmitted}
                    onClick={() =>
                      setSelectedSkillToVerify({
                        id: skill.skill_id,
                        name: skill.name || '',
                      })
                    }
                    className={`text-xs flex items-center gap-1.5 border px-2.5 py-1 rounded-md font-medium transition-colors disabled:cursor-not-allowed shrink-0 ${
                      skill.verified
                        ? "bg-green-500/10 border-green-500/30 text-green-600 disabled:opacity-100"
                        : "bg-background border-border hover:bg-muted/10 text-text-primary disabled:opacity-50"
                    }`}
                  >
                    <BadgeCheck size={14} />
                    {skill.verified
                      ? "Verified"
                      : alreadySubmitted
                        ? "Submitted"
                        : "Verify"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full max-w-xl mx-auto flex items-center justify-between mt-auto pt-4 border-t border-border/30">
        <button
          type="button"
          onClick={handleSkip}
          disabled={finishing}
          className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          Skip for now
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={finishing}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          {finishing ? <Spinner size={20} /> : "Finish"}
        </button>
      </div>

      {selectedSkillToVerify && (
        <VerifySkillModal
          skill={selectedSkillToVerify}
          onClose={() => setSelectedSkillToVerify(null)}
          onSubmitted={(skillId) => {
            setSubmittedSkills((prev) => new Set(prev).add(skillId));
            setSelectedSkillToVerify(null);
          }}
        />
      )}
    </div>
  );
};

export default OnboardingStep2;
