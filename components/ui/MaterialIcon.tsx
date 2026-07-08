import React from "react";
import CheckCircle from "@material-symbols/svg-400/outlined/check_circle.svg";
import ErrorIcon from "@material-symbols/svg-400/outlined/error.svg";
import Info from "@material-symbols/svg-400/outlined/info.svg";
import Warning from "@material-symbols/svg-400/outlined/warning.svg";

type IconName = "check_circle" | "error" | "info" | "warning";

const ICONS: Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>> = {
  check_circle: CheckCircle,
  error: ErrorIcon,
  info: Info,
  warning: Warning,
};

type MaterialIconProps = {
  name: IconName | (string & {});
  className?: string;
  size?: number;
  fill?: boolean;
};

const MaterialIcon = ({
  name,
  className = "",
  size = 20,
  fill = false,
}: MaterialIconProps) => {
  const Icon = ICONS[name as IconName];

  if (!Icon) return null;

  return (
    <Icon
      width={size}
      height={size}
      className={className}
      style={fill ? { fill: "currentColor" } : undefined}
    />
  );
};

export default MaterialIcon;