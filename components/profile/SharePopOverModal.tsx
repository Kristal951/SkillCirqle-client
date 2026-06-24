"use client";

import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useRef, useEffect } from "react";
import QrCode from "@material-symbols/svg-400/outlined/qr_code.svg"
import PersonAdd from "@material-symbols/svg-400/outlined/person_add.svg"
import Share from "@material-symbols/svg-400/outlined/share.svg"

interface ShareAction {
  title: string;
  icon: string;
  onClick?: () => void;
}

interface ShareModalProps {
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  setShowQrModal: (show: boolean) => void;
}

export default function SharePopoverModal({
  showShareModal,
  setShowShareModal,
  setShowQrModal,
}: ShareModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const getProfileLink = (id: string) => {
    return `${window.location.origin}/profile/${id}`;
  };
  const getInviteLink = (id: string) => {
    const url = new URL(`/profile/${id}`, window.location.origin);
    url.searchParams.set("invite", "true");
    return url.toString();
  };

  const shareProfile = async () => {
    const link = getProfileLink(user?.id || "");

    if (navigator.share) {
      await navigator.share({
        title: `${user?.name}'s Profile`,
        text: "Check out my profile",
        url: link,
      });
      toast?.success("Profile link Copied.");
    } else {
      await navigator.clipboard.writeText(link);
      toast?.success("Profile link Copied.");
    }
  };

  const copyInvite = async () => {
    const link = getInviteLink(user?.id || "");

    if (navigator.share) {
      await navigator.share({
        title: `${user?.name}'s Invite`,
        text: "Come and join me in the cirqle.",
        url: link,
      });
      toast?.success("Invite link Copied.");
    } else {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied!");
    }
  };

  const shareModalData = [
    {
      title: "Share Profile",
      icon: Share,
      onClick: shareProfile,
    },
    {
      title: "Show QR Code",
      icon: QrCode,
      onClick: () => setShowQrModal(true),
    },
    {
      title: "Invite Link",
      icon: PersonAdd,
      onClick: copyInvite,
    },
  ];

  useEffect(() => {
    if (!showShareModal) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowShareModal(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showShareModal, setShowShareModal]);

  if (!showShareModal) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-18 right-4 w-52 bg-surface/90 backdrop-blur-md border border-border/40 rounded-xl flex flex-col shadow-xl shadow-black/20 z-50 animate-scale-up"
    >
      {shareModalData.map((action, i) => {
        const Icon = action.icon
        return (
          <button
            key={i}
            type="button"
            onClick={() => {
              action.onClick?.();
              setShowShareModal(false);
            }}
            className="w-full px-3 py-2 flex items-center gap-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-text-secondary/10 transition-all group text-left"
          >
            <div className="text-text-secondary/60 group-hover:text-text-primary transition-colors shrink-0">
              <Icon className="text-2xl"/>
            </div>
            <span className="truncate transition-transform duration-150">
              {action.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
