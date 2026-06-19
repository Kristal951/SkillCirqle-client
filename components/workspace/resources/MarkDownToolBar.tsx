// components/workspace/MarkdownToolbar.tsx
"use client";

interface MarkdownToolbarProps {
  value: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const TOOLS = [
  { label: "bold", icon: "format_bold", wrap: "**" },
  { label: "italic", icon: "format_italic", wrap: "_" },
  { label: "strikethrough", icon: "strikethrough_s", wrap: "~~" },
] as const;

export default function MarkdownToolbar({
  value,
  onChange,
  textareaRef,
}: MarkdownToolbarProps) {
  function wrapSelection(wrap: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "text";

    const newValue =
      value.slice(0, start) + wrap + selected + wrap + value.slice(end);
    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + wrap.length,
        start + wrap.length + selected.length,
      );
    });
  }

  function insertLinePrefix(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue =
      value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  function insertLink() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "link text";

    const newValue =
      value.slice(0, start) + `[${selected}](url)` + value.slice(end);
    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const urlStart = start + selected.length + 3;
      textarea.setSelectionRange(urlStart, urlStart + 3);
    });
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border border-text-primary/10 rounded-t-xl bg-surface/80 border-b-0">
      {TOOLS.map((tool) => (
        <button
          key={tool.label}
          type="button"
          onClick={() => wrapSelection(tool.wrap)}
          title={tool.label}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-text-primary/5 hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">
            {tool.icon}
          </span>
        </button>
      ))}

      <div className="w-px h-4 bg-text-primary/10 mx-0.5" />

      <button
        type="button"
        onClick={() => insertLinePrefix("- ")}
        title="Bullet list"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-text-primary/5 hover:text-text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[15px]">
          format_list_bulleted
        </span>
      </button>

      <button
        type="button"
        onClick={() => insertLinePrefix("1. ")}
        title="Numbered list"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-text-primary/5 hover:text-text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[15px]">
          format_list_numbered
        </span>
      </button>

      <div className="w-px h-4 bg-text-primary/10 mx-0.5" />

      <button
        type="button"
        onClick={insertLink}
        title="Link"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-text-primary/5 hover:text-text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[15px]">link</span>
      </button>

      <button
        type="button"
        onClick={() => insertLinePrefix("> ")}
        title="Quote"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-text-primary/5 hover:text-text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[15px]">
          format_quote
        </span>
      </button>
    </div>
  );
}
