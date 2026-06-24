import React from "react";
import Password from "@material-symbols/svg-400/outlined/password.svg"
import ArrowForwardIos from "@material-symbols/svg-400/outlined/arrow_forward_ios.svg"

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
      <Password className="text-[3rem]"/>

      <div className="w-full flex flex-col gap-2">
        <h2 className="text-3xl font-semibold">Change Password</h2>

        <p className="text-sm text-text-secondary">
          Update your account password regularly to keep account highly safe.
        </p>
      </div>

      <div className="w-full flex items-center justify-end">
        <button className="text-on-surface-variant group-hover:bg-background w-10 h-10 flex items-center justify-center cursor-pointer rounded-full font-medium text-sm">
          <ArrowForwardIos className="text-xl"/>
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPanel;
