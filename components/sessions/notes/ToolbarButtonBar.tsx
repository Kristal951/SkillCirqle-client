import React from "react";
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
import { ToolbarButton } from "./ToolbarButton";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

const ToolbarButtonBar = ({editor, openLinkModal} : {editor: any, openLinkModal: () => void}) => {
  return (
    <div className="flex items-center gap-1 px-2 py-2 bg-surface/20 border-b border-border/50 overflow-x-auto md:overflow-x-visible md:flex-wrap snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-0.5 snap-start shrink-0">
        <ToolbarButton
          onClick={() => editor?.chain().focus().undo().run()}
          Icon={Undo}
          label="Undo"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().redo().run()}
          Icon={Redo}
          label="Redo"
        />
      </div>
      <div className="w-px h-5 bg-border mx-1 shrink-0" />

      <div className="flex items-center gap-0.5 snap-start shrink-0">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
          Icon={FormatBold}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
          Icon={FormatItalic}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline")}
          Icon={FormatUnderlined}
          label="Underline"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive("strike")}
          Icon={StrikeThrough}
          label="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHighlight().run()}
          active={editor?.isActive("highlight")}
          Icon={HighlightIcon}
          label="Highlight"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCode().run()}
          active={editor?.isActive("code")}
          Icon={Code}
          label="Inline code"
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
          className="text-sm bg-transparent border border-border rounded px-1 py-1 shrink-0 text-text-secondary"
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
          label="Bullet list"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
          Icon={FormatListNumbered}
          label="Numbered list"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          active={editor?.isActive("taskList")}
          Icon={Checklist}
          label="Checklist"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote")}
          Icon={FormatQuote}
          label="Quote"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive("codeBlock")}
          Icon={Terminal}
          label="Code block"
        />
      </div>
      <div className="w-px h-5 bg-border mx-1 shrink-0" />

      <div className="flex items-center gap-0.5 snap-start shrink-0">
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          active={editor?.isActive({ textAlign: "left" })}
          Icon={AlignLeft}
          label="Align left"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          active={editor?.isActive({ textAlign: "center" })}
          Icon={AlignCenter}
          label="Align center"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          active={editor?.isActive({ textAlign: "right" })}
          Icon={AlignRight}
          label="Align right"
        />
      </div>
      <div className="w-px h-5 bg-border mx-1 shrink-0" />

      <div className="flex items-center gap-0.5 snap-start shrink-0">
        <ToolbarButton
          onClick={openLinkModal}
          active={editor?.isActive("link")}
          Icon={LinkIcon}
          label="Insert link"
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          label="—"
        />
      </div>
    </div>
  );
};

export default ToolbarButtonBar;
