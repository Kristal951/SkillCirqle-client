"use client";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { AlignLeft, AlignCenter, AlignRight, X } from "lucide-react";
import { IconType } from "@/utils/SvgType";
import { TextStyle } from "@tiptap/extension-text-style";

import Undo from "@material-symbols/svg-400/outlined/undo.svg";
import Redo from "@material-symbols/svg-400/outlined/redo.svg";
import FormatBold from "@material-symbols/svg-400/outlined/format_bold.svg";
import FormatItalic from "@material-symbols/svg-400/outlined/format_italic.svg";
import FormatUnderlined from "@material-symbols/svg-400/outlined/format_underlined.svg";
import StrikeThrough from "@material-symbols/svg-400/outlined/strikethrough_s.svg";
import HighlightIcon from "@material-symbols/svg-400/outlined/ink_highlighter.svg";
import Code from "@material-symbols/svg-400/outlined/code.svg";
import FormatQuote from "@material-symbols/svg-400/outlined/format_quote.svg";
import Terminal from "@material-symbols/svg-400/outlined/terminal.svg";
import FormatListBulleted from "@material-symbols/svg-400/outlined/format_list_bulleted.svg";
import FormatListNumbered from "@material-symbols/svg-400/outlined/format_list_numbered.svg";
import Checklist from "@material-symbols/svg-400/outlined/checklist.svg";
import LinkIcon from "@material-symbols/svg-400/outlined/link.svg";
import { SlashCommand } from "./SlashCommand";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize || null,
        renderHTML: (attrs) =>
          attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
      },
    };
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) =>
          chain().setMark(this.name, { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark(this.name, { fontSize: null }).run(),
    };
  },
});

const NOTES_TEMPLATE = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Goals for this session" }],
    },
    { type: "paragraph" },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "What we covered" }],
    },
    { type: "paragraph" },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Follow-up" }],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [{ type: "paragraph" }],
        },
      ],
    },
  ],
};

export default function Notes({ sessionId }: { sessionId?: string }) {
  const userId = useAuthStore((state) => state.user?.id);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("");
  const [isShared, setIsShared] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedInitialContent = useRef(false);
  const supabase = getSupabaseBrowserClient();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      Placeholder.configure({ placeholder: "Start taking notes…" }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
      FontSize,
      SlashCommand,
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: () => {
      scheduleSave();
    },
  });

  const editorStats = useEditorState({
    editor,
    selector: (ctx) => ({
      characters: ctx.editor?.storage.characterCount?.characters() ?? 0,
      words: ctx.editor?.storage.characterCount?.words() ?? 0,
    }),
  });

  const openLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrlInput(previousUrl);
    setShowLinkModal(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrlInput.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    setShowLinkModal(false);
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setShowLinkModal(false);
  };

  useEffect(() => {
    if (!sessionId || !userId || !editor || hasLoadedInitialContent.current) {
      return;
    }

    let isCancelled = false;

    const loadNotes = async () => {
      const { data, error } = await supabase
        .from("session_notes")
        .select("content, is_shared")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (isCancelled) return;

      if (error) {
        console.error("Failed to load session notes:", error);
        setIsLoaded(true);
        hasLoadedInitialContent.current = true;
        return;
      }

      if (data?.content && Object.keys(data.content).length > 0) {
        editor.commands.setContent(data.content);
      } else {
        editor.commands.setContent(NOTES_TEMPLATE);
      }
      setIsShared(Boolean(data?.is_shared));
      setIsLoaded(true);
      hasLoadedInitialContent.current = true;
    };

    loadNotes();

    return () => {
      isCancelled = true;
    };
  }, [sessionId, userId, editor]);

  const scheduleSave = () => {
    if (!isLoaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes();
    }, 800);
  };

  const saveNotes = async () => {
    if (!sessionId || !userId || !editor) return;
    const content = editor.getJSON();

    const { error } = await supabase.from("session_notes").upsert(
      {
        session_id: sessionId,
        user_id: userId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id,user_id" },
    );

    if (error) {
      console.error("Failed to save session notes:", error);
      setSaveStatus("error");
      return;
    }
    setSaveStatus("saved");
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveNotes();
      }
    };
  }, []);

  const saveStatusLabel = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Failed to save",
  }[saveStatus];

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden border-l border-border/50">
      <div className="relative">
        <div className="flex items-center gap-1 px-2 py-4 bg-surface/20 scrollbar-hide overflow-x-auto md:overflow-x-visible md:flex-wrap snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-0.5 snap-start shrink-0">
            <ToolbarButton
              onClick={() => editor?.chain().focus().undo().run()}
              Icon={Undo}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().redo().run()}
              Icon={Redo}
            />
          </div>
          <div className="w-px h-5 bg-border mx-1 shrink-0" />

          <div className="flex items-center gap-0.5 snap-start shrink-0">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive("bold")}
              Icon={FormatBold}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive("italic")}
              Icon={FormatItalic}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              active={editor?.isActive("underline")}
              Icon={FormatUnderlined}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              active={editor?.isActive("strike")}
              Icon={StrikeThrough}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
              active={editor?.isActive("highlight")}
              Icon={HighlightIcon}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleCode().run()}
              active={editor?.isActive("code")}
              Icon={Code}
            />
          </div>
          <div className="w-px h-5 bg-border mx-1 shrink-0" />

          <div className="flex items-center gap-0.5 snap-start shrink-0">
            <ToolbarButton
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor?.isActive("heading", { level: 1 })}
              label="H1"
            />
            <ToolbarButton
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor?.isActive("heading", { level: 2 })}
              label="H2"
            />
            <ToolbarButton
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor?.isActive("heading", { level: 3 })}
              label="H3"
            />

            <select
              onChange={(e) => {
                if (e.target.value) {
                  editor?.chain().focus().setFontSize(e.target.value).run();
                } else {
                  editor?.chain().focus().unsetFontSize().run();
                }
              }}
              className="text-sm bg-transparent border border-border rounded px-1 py-1"
            >
              <option value="">Size</option>
              <option value="14px">Small</option>
              <option value="16px">Normal</option>
              <option value="20px">Large</option>
              <option value="28px">Huge</option>
            </select>
          </div>
          <div className="w-px h-5 bg-border mx-1 shrink-0" />

          <div className="flex items-center gap-0.5 snap-start shrink-0">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive("bulletList")}
              Icon={FormatListBulleted}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              active={editor?.isActive("orderedList")}
              Icon={FormatListNumbered}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleTaskList().run()}
              active={editor?.isActive("taskList")}
              Icon={Checklist}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              active={editor?.isActive("blockquote")}
              Icon={FormatQuote}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              active={editor?.isActive("codeBlock")}
              Icon={Terminal}
            />
          </div>
          <div className="w-px h-5 bg-border mx-1 shrink-0" />

          <div className="flex items-center gap-0.5 snap-start shrink-0">
            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              active={editor?.isActive({ textAlign: "left" })}
              Icon={AlignLeft}
            />
            <ToolbarButton
              onClick={() =>
                editor?.chain().focus().setTextAlign("center").run()
              }
              active={editor?.isActive({ textAlign: "center" })}
              Icon={AlignCenter}
            />
            <ToolbarButton
              onClick={() =>
                editor?.chain().focus().setTextAlign("right").run()
              }
              active={editor?.isActive({ textAlign: "right" })}
              Icon={AlignRight}
            />
          </div>
          <div className="w-px h-5 bg-border mx-1 shrink-0" />

          <div className="flex items-center gap-0.5 snap-start shrink-0">
            <ToolbarButton
              onClick={openLinkModal}
              active={editor?.isActive("link")}
              Icon={LinkIcon}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              label="—"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-linear-to-l from-background to-transparent md:hidden" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none min-h-0">
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 text-xs font-medium bg-surface/20">
        <div className="flex items-center gap-3">
          <span
            className={`capitalize ${saveStatus === "saved" ? "text-emerald-500" : "text-amber-500"}`}
          >
            {saveStatusLabel}
          </span>
        </div>

        <div className="text-text-secondary">
          <span>{editorStats?.characters ?? 0} characters · </span>
          <span>{editorStats?.words ?? 0} words</span>
        </div>
      </div>

      {showLinkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all"
          onClick={() => setShowLinkModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary tracking-tight">
                Insert Link
              </h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 rounded-full hover:bg-text-secondary/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">
                URL
              </label>
              <input
                autoFocus
                type="url"
                placeholder="https://example.com"
                value={linkUrlInput}
                onChange={(e) => setLinkUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyLink();
                  if (e.key === "Escape") setShowLinkModal(false);
                }}
                className="w-full rounded-lg bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition-all text-text-primary placeholder:text-text-secondary"
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={removeLink}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
              >
                Remove link
              </button>

              <div className="flex gap-2">
                <button
                  onClick={applyLink}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-text-primary shadow-sm transition-all active:scale-[0.97]"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  Icon,
  AriaLabel,
}: {
  onClick: () => void;
  active?: boolean;
  label?: string;
  AriaLabel?: string;
  Icon?: IconType;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={AriaLabel}
      className={`
        px-2.5 py-1 rounded-md text-sm font-semibold transition-all duration-200 hover:bg-surface
        ${active ? "bg-surface" : "text-text-secondary"}
      `}
    >
      {label ? label : Icon ? <Icon className="w-4 h-4" /> : label}
    </button>
  );
}
