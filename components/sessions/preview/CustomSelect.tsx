import { IconType } from "@/utils/SvgType";
import { useEffect, useRef, useState } from "react";
import ExpandMore from "@material-symbols/svg-400/outlined/arrow_drop_down.svg";
import ExpandLess from "@material-symbols/svg-400/outlined/arrow_drop_up.svg";

interface CustomSelectProps {
  label: string;
  icon: IconType;
  value: string;
  options: MediaDeviceInfo[];
  onChange: (id: string) => void;
  fallbackLabel: string;
}

const CustomSelect = ({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  fallbackLabel,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.deviceId === value);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-xs text-text-secondary font-medium px-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surface/90 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-text-primary flex items-center justify-between hover:bg-surface transition text-left"
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon className="text-text-primary text-lg shrink-0 select-none" />
          <span className="truncate">
            {selectedOption?.label || fallbackLabel}
          </span>
        </div>
        {isOpen ? (
          <ExpandLess className="text-text-secondary text-sm select-none" />
        ) : (
          <ExpandMore className="text-text-secondary text-sm select-none" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border space-y-2 rounded-xl shadow-2xl max-h-48 overflow-y-auto scrollbar-hide p-1 backdrop-blur-xl">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-secondary italic">
              No devices found
            </div>
          ) : (
            options.map((opt, idx) => (
              <button
                key={opt.deviceId || idx}
                type="button"
                onClick={() => {
                  onChange(opt.deviceId);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2.5 transition ${
                  opt.deviceId === value
                    ? "bg-primary text-text-primary font-medium"
                    : "text-text-secondary hover:bg-text-secondary/20 hover:text-text-primary"
                }`}
              >
                <Icon
                  className={`material-symbols-outlined text-lg ${opt.deviceId === value ? "text-white" : "text-text-secondary"}`}
                />
                <span className="truncate">
                  {opt.label || `${fallbackLabel} ${idx + 1}`}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
