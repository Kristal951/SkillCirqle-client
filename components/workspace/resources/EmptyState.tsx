export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 ">
      <span className="material-symbols-outlined text-text-secondary" style={{fontSize: '80px'}}>
        folder_open
      </span>
      <p className="text-base text-text-secondary">No resources yet</p>
      <button
        onClick={onAdd}
        className="text-base rounded-lg bg-primary font-medium py-2 px-3 gap-2 flex items-center justify-center"
      >
         <span className="material-symbols-outlined text-[18px]">add</span>
        Add the first one
      </button>
    </div>
  );
}