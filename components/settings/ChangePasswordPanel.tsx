import React from "react";

const ChangePasswordPanel = ({
  setShowPasswdMdl,
}: {
  setShowPasswdMdl: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div
      onClick={() => setShowPasswdMdl(true)}
      className="bg-surface/50 flex-1 cursor-pointer hover:bg-surface px-6 py-6 space-y-6 transition-colors rounded-2xl group"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "3rem" }}>
        password
      </span>

      <div className="w-full flex flex-col gap-2">
        <h2 className="text-3xl font-semibold">Change Password</h2>

        <p className="text-sm text-text-secondary">
          Update your account password regularly to keep account highly safe.
        </p>
      </div>

      <div className="w-full flex items-center justify-end">
        <button className="text-on-surface-variant group-hover:bg-background w-10 h-10 flex items-center justify-center cursor-pointer rounded-full font-medium text-sm">
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPanel;
