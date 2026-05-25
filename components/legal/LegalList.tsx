import React from "react";

type LegalListProps = {
  items: React.ReactNode[];
  ordered?: boolean;
  className?: string;
};

const LegalList = ({
  items,
  ordered = false,
  className = "",
}: LegalListProps) => {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag
      className={`pl-6 space-y-2 text-sm text-text-secondary leading-relaxed ${
        ordered ? "list-decimal" : "list-disc"
      } ${className}`}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ListTag>
  );
};

export default LegalList;
