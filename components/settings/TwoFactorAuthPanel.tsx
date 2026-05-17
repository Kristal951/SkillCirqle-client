"use client";

import { getMfaStatus } from "@/lib/getUserMfaStatus";
import React, { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const TwoFactorAuthPanel = ({
  setShow2faMdl,
}: {
  setShow2faMdl: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const supabase = getSupabaseBrowserClient();
  const [userMfaStatus, setUserMfaStatus] = useState<
    "enabled" | "pending" | "disabled" | "loading"
  >("loading");
  const isFetchingRef = useRef(false);

  const fetchStatus = async () => {
    setUserMfaStatus("loading");
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const status = await getMfaStatus(supabase);

      if (status.enabled) {
        setUserMfaStatus("enabled");
      } else if (status.pending) {
        setUserMfaStatus("pending");
      } else {
        setUserMfaStatus("disabled");
      }
    } catch (err) {
      console.error(err);
      setUserMfaStatus("disabled");
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [setShow2faMdl]);

  const statusLabel = {
    enabled: {
      text: "Enabled",
      className: "bg-green-500/10 text-green-500",
    },
    pending: {
      text: "Pending",
      className: "bg-yellow-500/10 text-yellow-500",
    },
    disabled: {
      text: "Disabled",
      className: "bg-red-500/10 text-red-500",
    },
    loading: {
      text: "Loading...",
      className: "bg-gray-500/10 text-gray-400",
    },
  }[userMfaStatus];

  return (
    <div
      onClick={() => setShow2faMdl(true)}
      className="bg-surface/50 flex-1 cursor-pointer rounded-2xl p-6 flex flex-col justify-between group hover:bg-surface transition-colors"
    >
      <div>
        <span
          className="material-symbols-outlined text-text-primary mb-4"
          style={{ fontSize: "3rem" }}
        >
          verified_user
        </span>

        <h4 className="font-headline font-bold text-lg">Two-Factor Auth</h4>

        <p className="text-sm mt-2 text-text-secondary">
          Add an extra layer of protection to your account.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded-md font-bold ${statusLabel.className}`}
        >
          {statusLabel.text}
        </span>

        <button className="text-on-surface-variant group-hover:bg-background w-10 h-10 flex items-center justify-center cursor-pointer rounded-full font-medium text-sm">
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>
    </div>
  );
};

export default TwoFactorAuthPanel;
