"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { useState } from "react";
import Close from "@material-symbols/svg-400/outlined/close.svg";
import ToolbarButtonBar from "@/components/sessions/notes/ToolbarButtonBar";
import LinkModal from "@/components/sessions/notes/LinkModal";

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
        ({ chain }: any) =>
          chain().setMark(this.name, { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark(this.name, { fontSize: null }).run(),
    };
  },
});

interface NoteResourceFullScreenEditorProps {
  initialTitle: string;
  initialContent: string; // JSON-stringified Tiptap content, or ""
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export default function NoteResourceFullScreenEditor({
  initialTitle,
  initialContent,
  onSave,
  onCancel,
}: NoteResourceFullScreenEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("");
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      Placeholder.configure({
        placeholder: "Start writing… (type / for commands)",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontSize,
    ],
    immediatelyRender: false,
    content: initialContent ? JSON.parse(initialContent) : "",
  });

  const openLinkModal = () => {
    if (!editor) return;
    setLinkUrlInput(editor.getAttributes("link").href || "");
    setShowLinkModal(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrlInput.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setShowLinkModal(false);
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setShowLinkModal(false);
  };

  const handleSave = () => {
    if (!editor) return;
    onSave(title.trim(), JSON.stringify(editor.getJSON()));
  };

  const handleClose = () => {
    const isEmpty = !title.trim() && (editor?.isEmpty ?? true);
    if (isEmpty) {
      onCancel();
      return;
    }
    setConfirmingDiscard(true);
  };

  return (
    <div className="fixed inset-0 z-100 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          autoFocus
          className="flex-1 min-w-0 text-lg font-bold text-text-primary bg-transparent outline-none placeholder:text-text-secondary/40 mr-4"
        />

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClose}
            className="px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-40 rounded-lg transition-colors"
          >
            Save note
          </button>
        </div>
      </div>

      <div className="relative shrink-0">
        <ToolbarButtonBar editor={editor} openLinkModal={openLinkModal} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>

      {showLinkModal && (
        <LinkModal
          setShowLinkModal={setShowLinkModal}
          linkUrlInput={linkUrlInput}
          setLinkUrlInput={setLinkUrlInput}
          removeLink={removeLink}
          applyLink={applyLink}
        />
      )}

      {confirmingDiscard && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border shadow-2xl p-6">
            <h3 className="text-base font-bold text-text-primary mb-1.5">
              Discard this note?
            </h3>
            <p className="text-sm text-text-secondary mb-5">
              Your changes haven't been saved yet.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingDiscard(false)}
                className="flex-1 rounded-xl border border-text-primary/10 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-text-primary/5 transition-colors"
              >
                Keep writing
              </button>
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}