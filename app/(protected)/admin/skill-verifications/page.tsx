"use client";

import React, { useState, useMemo, useEffect, useContext } from "react";
import pendingActions from "@material-symbols/svg-400/outlined/pending_actions.svg";
import Verified from "@material-symbols/svg-400/outlined/verified.svg";
import Cancel from "@material-symbols/svg-400/outlined/cancel.svg";
import DataThresholding from "@material-symbols/svg-400/outlined/data_thresholding.svg";
import {
  Search,
  FilterX,
} from "lucide-react";

import { useSkillVerifications } from "@/hooks/admin/useSkillVerifications";
import DataCard from "@/components/admin/DataCard";
import { ConfirmationActionType, SkillVerification } from "@/types/Admin";
import SkillVerificationCard, {
  SkillVerificationCardSkeleton,
} from "@/components/admin/skillVerification/SkillVerificationCard";
import { ConfirmationModal } from "@/components/admin/skillVerification/ConfirmationModal";
import { toast } from "@/lib/toast";
import { SocketContext } from "@/providers/SocketContext";
import { getSocket } from "@/lib/socket";
import { useAdminSidebarStore } from "@/store/useAdminStore";

const SkillVerificationsPage = () => {
  const {
    skillVerifications = [],
    updateVerificationStatus,
    loading,
  } = useSkillVerifications({});
  const { adminModeReady } = useAdminSidebarStore()

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [proofUrlMap, setProofUrlMap] = useState<Record<string, string>>({});
  const [proofUrlsLoading, setProofUrlsLoading] = useState(false);

  const { socketReady } = useContext(SocketContext);
  const socket = getSocket();

  useEffect(() => {
    if (!socketReady || !socket || !adminModeReady) return;

    const nonLinkVerifications = skillVerifications.filter(
      (sv: SkillVerification) => sv.proof_type !== "link" && sv.proof_url,
    );

    if (nonLinkVerifications.length === 0) {
      setProofUrlMap({});
      return;
    }

    let cancelled = false;
    setProofUrlsLoading(true);

    const paths = nonLinkVerifications.map((sv) => sv.proof_url as string);

    socket.emit(
      "admin:skill-verifications_sign-url",
      { paths },
      (response: {
        success: boolean;
        results?: { path: string; signedUrl: string | null; error: string | null }[];
        message?: string;
      }) => {
        if (cancelled) return;

        if (!response.success || !response.results) {
          console.error("Failed to resolve proof URLs:", response.message);
          setProofUrlMap({});
          setProofUrlsLoading(false);
          return;
        }

        const map: Record<string, string> = {};
        nonLinkVerifications.forEach((sv, i) => {
          const result = response.results![i];
          if (result?.error) {
            console.error(`Failed to sign proof for verification ${sv.id}:`, result.error, result.path);
            return;
          }
          if (result?.signedUrl) {
            map[sv.id] = result.signedUrl;
          }
        });
        setProofUrlMap(map);
        setProofUrlsLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [skillVerifications, socket, adminModeReady]);

  const pendingCount = useMemo(
    () =>
      skillVerifications.filter((sv: any) => sv.status === "PENDING").length,
    [skillVerifications],
  );

  const approvedCount = useMemo(
    () =>
      skillVerifications.filter((sv: any) => sv.status === "APPROVED").length,
    [skillVerifications],
  );

  const rejectedCount = useMemo(
    () =>
      skillVerifications.filter((sv: any) => sv.status === "REJECTED").length,
    [skillVerifications],
  );

  const totalCount = useMemo(
    () => skillVerifications.length,
    [skillVerifications],
  );

  const filteredVerifications = useMemo(() => {
    return skillVerifications.filter((sv: any) => {
      if (selectedStatusTab !== "ALL" && sv.status !== selectedStatusTab) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const userName = sv.user?.name?.toLowerCase() || "";
        const userEmail = sv.user?.email?.toLowerCase() || "";
        const skillName = sv.skill?.name?.toLowerCase() || "";
        const userId = sv.skill?.id || "";
        return (
          userName.includes(query) ||
          userEmail.includes(query) ||
          skillName.includes(query) ||
          userId.includes(query)
        );
      }

      return true;
    });
  }, [skillVerifications, selectedStatusTab, searchQuery]);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] =
    useState<SkillVerification | null>(null);
  const [selectedAction, setSelectedAction] =
    useState<ConfirmationActionType | null>(null);

  const handleTriggerConfirm = (
    verification: SkillVerification,
    action: ConfirmationActionType,
  ) => {
    setSelectedVerification(verification);
    setSelectedAction(action);
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async (action: ConfirmationActionType) => {
    if (!selectedVerification) return;
    setActioningId(selectedVerification.id);

    try {
      await updateVerificationStatus({
        verificationId: selectedVerification.id,
        status: action,
        rejectionReason: rejectionReason,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to update verification.");
    } finally {
      setActioningId("");
    }
  };

  const cardData = [
    {
      icon: pendingActions,
      label: "PENDING",
      value: pendingCount,
    },
    {
      icon: Verified,
      label: "APPROVED",
      value: approvedCount,
    },
    {
      icon: Cancel,
      label: "REJECTED",
      value: rejectedCount,
    },
    {
      icon: DataThresholding,
      label: "TOTAL",
      value: totalCount,
    },
  ];

  return (
    <div className="px-6 py-8 max-w-8xl mx-auto space-y-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">
          Skill Verifications
        </h1>
        <p className="text-sm text-text-secondary">
          Review credentials, portfolios, and verify user skill claims on
          Skillcirqle.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((data, i) => {
          const Icon = data.icon;
          return (
            <DataCard
              key={i}
              icon={Icon}
              label={data.label}
              value={data.value}
              loading={loading}
            />
          );
        })}
      </div>

      <div className="bg-surface/50 border border-border/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          <div className="flex items-center p-1 bg-background rounded-2xl border border-border/50 self-start w-fit">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedStatusTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${selectedStatusTab === tab
                    ? "bg-surface text-text-primary shadow-sm border border-border/40"
                    : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60"
              size={18}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search User by name, email, skill or ID..."
              className="w-full bg-background/50 border border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 py-2.5 pl-11 pr-4 outline-none rounded-2xl transition-all text-sm placeholder:text-text-secondary/60 text-text-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="">
              <tr className="bg-background/40 border-b border-border/40">
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  User
                </th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Requested Skill
                </th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Proof of Expertise
                </th>
                {/* <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Reviewer Context
                </th> */}
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Status
                </th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkillVerificationCardSkeleton key={i} />
                ))
              ) : filteredVerifications.length > 0 ? (
                filteredVerifications.map((sv: SkillVerification) => (
                  <SkillVerificationCard
                    sv={sv}
                    key={sv.id}
                    actioningId={actioningId}
                    buttonOnClick={handleTriggerConfirm}
                    onConfirm={handleConfirmAction}
                    resolvedProofUrl={proofUrlMap[sv.id] ?? null}
                    proofUrlLoading={proofUrlsLoading}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-text-secondary/60">
                      <div className="p-4 bg-background/60 border border-border/40 rounded-full">
                        <FilterX size={28} className="text-text-secondary/50" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-text-primary">
                          No verifications found
                        </p>
                        <p className="text-xs">
                          Adjust your status tabs or try searching for a
                          different term.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {confirmModalOpen && selectedVerification && selectedAction && (
        <ConfirmationModal
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setSelectedVerification(null);
            setSelectedAction(null);
          }}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onConfirm={handleConfirmAction}
          actionType={selectedAction}
          userName={selectedVerification.user?.name || "User"}
          skillName={selectedVerification.skill?.name || "Skill"}
        />
      )}
    </div>
  );
};

export default SkillVerificationsPage;
