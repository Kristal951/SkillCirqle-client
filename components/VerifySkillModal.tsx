"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { X, Link2, FileUp, BadgeCheck, Loader2, FileText, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadFile } from "@/utils/uploadFile";
import { toast } from "@/lib/toast";
import { SocketContext } from "@/providers/SocketContext";
import { getSocket } from "@/lib/socket";

type ProofType = "link" | "file";

export interface VerifiableSkill {
  id: string;
  name: string;
}

interface VerifySkillModalProps {
  skill: VerifiableSkill;
  onClose: () => void;
  onSubmitted?: (skillId: string) => void;
}

export const VerifySkillModal: React.FC<VerifySkillModalProps> = ({
  skill,
  onClose,
  onSubmitted,
}) => {
  const { user } = useAuthStore();
  const supabase = getSupabaseBrowserClient();
  const { socketReady } = useContext(SocketContext)
  const socket = getSocket()

  const [proofType, setProofType] = useState<ProofType>("link");
  const [proofUrl, setProofUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSafeClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitting]);

  const handleProofTypeChange = (type: ProofType) => {
    if (submitting) return;
    setProofType(type);
    if (type === "link") {
      setFile(null);
    } else {
      setProofUrl("");
    }
  };

  const handleSafeClose = () => {
    if (submitting) return;
    onClose();
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (submitting) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (submitting) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/svg+xml"
      ];
      if (allowedTypes.includes(droppedFile.type) || droppedFile.name.endsWith(".doc") || droppedFile.name.endsWith(".docx")) {
        setFile(droppedFile);
      } else {
        toast.error("Unsupported file type. Please upload an image, PDF, or Word document.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to verify skills.");
      return;
    }

    if (proofType === "link" && !proofUrl.trim()) {
      toast.error("Enter a link to your proof.");
      return;
    }

    if (proofType === "file" && !file) {
      toast.error("Choose or drop a file to upload.");
      return;
    }

    setSubmitting(true);

    try {
      let finalUrl = proofUrl.trim();

      if (proofType === "file" && file) {
        finalUrl = await uploadFile(
          file,
          user.id,
          (progress) => {
            setUploadProgress(progress);
          },
          "skill-verification-proofs",
          true
        );
      }

      const { data: inserted, error } = await supabase.from("skill_verifications").insert({
        user_id: user.id,
        skill_id: skill.id,
        proof_type: proofType,
        proof_url: finalUrl,
        note: note.trim() || null,
      }).select("id");

      if (error) {
        if (error.code === "23505") {
          toast.error("You already have a pending verification for this skill.");
        } else {
          toast.error("Failed to submit for verification.");
          console.error(error);
        }
        return;
      }

      if (socket && socketReady) {
        socket.emit(
          "skill-verification:submitted",
          { verificationId: inserted?.[0]?.id },
          (response: { success: boolean }) => {
            if (!response?.success) {
              console.warn("Failed to notify admins of new verification submission");
            }
          },
        );
      }

      toast.info("Submitted for review.");
      onSubmitted?.(skill.id);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div
      onClick={handleSafeClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border/80 rounded-3xl w-full max-w-md p-6 md:p-8 relative shadow-2xl transition-all scale-100"
      >
        <button
          onClick={handleSafeClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 rounded-full text-text-secondary hover:bg-background hover:text-text-primary transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
            <BadgeCheck className="text-primary" size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              Verify "{skill.name}"
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload credentials or links to prove your expertise.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">
              Submission Method
            </label>
            <div className="grid grid-cols-2 p-1 bg-background rounded-2xl border border-border/60">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleProofTypeChange("link")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${proofType === "link"
                    ? "bg-surface text-text-primary shadow-sm border border-border/40"
                    : "text-text-secondary hover:text-text-primary border border-transparent"
                  } disabled:opacity-50`}
              >
                <Link2 size={16} />
                Link / URL
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleProofTypeChange("file")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${proofType === "file"
                    ? "bg-surface text-text-primary shadow-sm border border-border/40"
                    : "text-text-secondary hover:text-text-primary border border-transparent"
                  } disabled:opacity-50`}
              >
                <FileUp size={16} />
                Upload File
              </button>
            </div>
          </div>

          <div className="min-h-27.5 flex flex-col justify-end">
            {proofType === "link" ? (
              <div className="space-y-2 w-full">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Proof Link
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  disabled={submitting}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://your-portfolio, github, or credential link"
                  className="w-full bg-background/50 border border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 py-3.5 px-4 outline-none rounded-2xl transition-all disabled:opacity-60 text-sm placeholder:text-text-secondary/60 text-text-primary"
                />
              </div>
            ) : (
              <div className="space-y-2 w-full">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Upload Documents or Images
                </label>

                {!file ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !submitting && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all ${dragActive
                        ? "border-primary bg-primary/5 scale-[0.99]"
                        : "border-border/80 bg-background/30 hover:border-primary/50 hover:bg-background/50"
                      } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      disabled={submitting}
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="p-3 bg-primary/5 rounded-full text-primary">
                      <FileUp size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-text-primary">
                        Drag & drop your file here
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        or click to browse from device
                      </p>
                    </div>
                    <p className="text-[10px] text-text-secondary/70">
                      PDF, DOCX, PNG, JPG (Max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-background/60 border border-border rounded-2xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-text-primary">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    {!submitting && (
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-red-500/10 text-text-secondary hover:text-red-500 rounded-xl transition-colors"
                        title="Remove file"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}

                {file && submitting && (
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between text-xs text-text-secondary font-medium">
                      <span>Uploading proof file...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Reviewer Note
              </label>
              <span className="text-[10px] text-text-secondary/70 italic font-medium">
                Optional
              </span>
            </div>
            <textarea
              value={note}
              disabled={submitting}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add details, passwords if credentials are gated, or overall context for the verification admin..."
              rows={3}
              className="w-full bg-background/50 border border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 py-3 px-4 outline-none rounded-2xl transition-all resize-none disabled:opacity-60 text-sm placeholder:text-text-secondary/60 text-text-primary"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 bg-primary text-text-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-primary/10"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {uploadProgress > 0 && uploadProgress < 100
                  ? `Uploading (${uploadProgress}%)...`
                  : "Submitting Review..."}
              </>
            ) : (
              "Submit for Verification"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};