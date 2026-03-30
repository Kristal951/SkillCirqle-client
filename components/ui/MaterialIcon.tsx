import React from "react";

type MaterialIconProps = {
  name: string;
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
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size }}
      data-weight={fill ? "fill" : undefined}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;