import { IconType } from "@/utils/SvgType";

export function ToolbarButton({
  onClick,
  active,
  label,
  Icon,
}: {
  onClick: () => void;
  active?: boolean;
  label?: string;
  Icon?: IconType;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`px-2.5 py-1 rounded-md text-sm font-semibold transition-all duration-200 hover:bg-surface ${
        active ? "bg-surface" : "text-text-secondary"
      }`}
    >
      {Icon ? <Icon className="w-4 h-4" /> : (label ?? null)}
    </button>
  );
}
