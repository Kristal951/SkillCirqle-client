import React from "react";

interface DeleteAccountPanelProps {
  onDeleteClick?: () => void;
}

const DeleteAccountPanel = ({ onDeleteClick }: DeleteAccountPanelProps) => {
  return (
    <div className="flex-1 p-6 flex flex-col gap-10 rounded-2xl bg-red-500/10 shadow-sm">
      <h1 className="text-3xl text-rose-300 font-semibold ">Danger Zone</h1>

      <p className="text-sm text-text-secondary leading-relaxed">
        Permanently delete your SkillCirqle account and all associated data.
        Please note that this is an{" "}
        <strong className="text-red-400 font-medium">irreversible</strong>{" "}
        action and cannot be undone.
      </p>


        <button
          onClick={onDeleteClick}
          className="w-full px-5 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
        >
          Delete Permanently
        </button>
    </div>
  );
};

export default DeleteAccountPanel;
