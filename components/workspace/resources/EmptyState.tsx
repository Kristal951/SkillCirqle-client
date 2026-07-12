import Add from "@material-symbols/svg-400/outlined/add.svg";
import FolderOpen from "@material-symbols/svg-400/outlined/folder_open.svg";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 ">
      <FolderOpen
        className="text-text-secondary"
        style={{ fontSize: "80px" }}
      />
      <p className="text-base text-text-secondary">No resources yet</p>
      <button
        onClick={onAdd}
        className="text-base rounded-lg bg-primary font-medium py-2 px-3 gap-2 flex items-center justify-center"
      >
        <Add className="text-[18px]" />
        Add the first one
      </button>
    </div>
  );
}
