import React from "react";

interface HighlightTextProps {
    text: string;
    query: string;
    className?: string;
}

export function HighlightText({ text, query, className }: HighlightTextProps) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || !text) {
        return <span className={className}>{text}</span>;
    }

    const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const terms = escaped.split(/\s+/).filter(Boolean);

    if (terms.length === 0) {
        return <span className={className}>{text}</span>;
    }

    const pattern = new RegExp(`(${terms.join("|")})`, "gi");
    const parts = text.split(pattern);

    return (
        <span className={className}>
            {parts.map((part, i) =>
                pattern.test(part) ? (
                    <mark
                        key={i}
                        className="bg-transparent text-accent rounded-sm px-0.5 -mx-0.5"
                    >
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                ),
            )}
        </span>
    );
}