"use client";

import ActiveSessionsPanel from "@/components/settings/ActiveSessionsPanel";
import ChangePasswordPanel from "@/components/settings/ChangePasswordPanel";
import PasswordModal from "@/components/settings/ChangePasswordModal";
import LocalizationSettings from "@/components/settings/LocallizationPanel";
import NotificationSettings from "@/components/settings/NotificationPanel";
import TwoFactorAuthPanel from "@/components/settings/TwoFactorAuthPanel";
import TwoFAModal from "@/components/settings/TwoFAModal";
import { useAuthStore } from "@/store/useAuthStore";
import { Trash, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import DeleteAccountPanel from "@/components/settings/DeleteAccountPanel";
import ProfileDetailsPanel from "@/components/settings/ProfileDetailsPanel";

const SettingsPage = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FaModal, setShow2FaModal] = useState(false);

  return (
    <div className="w-full h-full px-3 md:px-8 md:py-6 py-4 gap-6 flex flex-col">
      <div className="w-full">
        <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold ">
          Profile Settings
        </h1>
      </div>

      <div className="w-full h-max">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          <div className="lg:col-span-2">
            <ProfileDetailsPanel />
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            <NotificationSettings />
            <LocalizationSettings />
          </div>
        </div>

        <div className="w-full md:mt-12 lg:mt-12 mt-25 mb-10 space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold ">Account Settings</h1>

          <div className="w-full flex flex-col gap-8">
            <div className="flex-col flex md:flex-row lg:flex gap-8">
              <ChangePasswordPanel setShowPasswdMdl={setShowPasswordModal} />
              <TwoFactorAuthPanel setShow2faMdl={setShow2FaModal} />
              <DeleteAccountPanel />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <ActiveSessionsPanel />
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordModal
          showPasswordModal={showPasswordModal}
          setShowPasswordModal={setShowPasswordModal}
        />
      )}
      {show2FaModal && (
        <TwoFAModal open={show2FaModal} setOpen={setShow2FaModal} />
      )}
    </div>
  );
};

export default SettingsPage;
