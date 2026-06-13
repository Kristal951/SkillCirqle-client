import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function Notes({ sessionId }: { sessionId?: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  return (
    <div className="notes-wrapper absolute inset-0">
      <div className="notes-toolbar">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor?.isActive("bold") ? "active" : ""}`}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor?.isActive("italic") ? "active" : ""}`}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={`toolbar-btn ${editor?.isActive("strike") ? "active" : ""}`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <div className="toolbar-divider" />
        <button
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`toolbar-btn ${editor?.isActive("heading", { level: 1 }) ? "active" : ""}`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`toolbar-btn ${editor?.isActive("heading", { level: 2 }) ? "active" : ""}`}
          title="Heading 2"
        >
          H2
        </button>
        <div className="toolbar-divider" />
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor?.isActive("bulletList") ? "active" : ""}`}
          title="Bullet List"
        >
          ≡
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor?.isActive("orderedList") ? "active" : ""}`}
          title="Ordered List"
        >
          1.
        </button>
        <div className="toolbar-divider" />
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`toolbar-btn ${editor?.isActive("blockquote") ? "active" : ""}`}
          title="Blockquote"
        >
          "
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={`toolbar-btn ${editor?.isActive("code") ? "active" : ""}`}
          title="Inline Code"
        >
          {"<>"}
        </button>
        <div className="toolbar-divider" />
        <button
          onClick={() => editor?.chain().focus().undo().run()}
          className="toolbar-btn"
          title="Undo"
          disabled={!editor?.can().undo()}
        >
          ↩
        </button>
        <button
          onClick={() => editor?.chain().focus().redo().run()}
          className="toolbar-btn"
          title="Redo"
          disabled={!editor?.can().redo()}
        >
          ↪
        </button>
      </div>
      <EditorContent editor={editor} className="notes-editor" />
    </div>
  );
}
