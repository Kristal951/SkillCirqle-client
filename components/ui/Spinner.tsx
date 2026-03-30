import React from "react";

const Spinner = ({ size = 24 }: { size?: number }) => {
  return (
    <div className="flex items-center justify-center">
      <div
        style={{ width: size, height: size }}
        className="border-2 border-text-secondary border-t-primary rounded-full animate-spin"
      />
    </div>
  );
};

export default Spinner;
