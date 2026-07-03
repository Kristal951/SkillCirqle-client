"use client";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { SocketIOProvider } from "y-socket.io";
import * as Y from "yjs";
import { removeAwarenessStates } from "y-protocols/awareness";
import { TextStyle } from "@tiptap/extension-text-style";
import { SlashCommand } from "./SlashCommand";
import Spinner from "../ui/Spinner";
import ToolbarButtonBar from "./notes/ToolbarButtonBar";
import Bottombar from "./notes/Bottombar";
import LinkModal from "./notes/LinkModal";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";

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

const NOTES_TEMPLATE = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Goals for this session" }],
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

function getUserColor(userId: string): string {
  const hues = [0, 30, 60, 120, 180, 210, 270, 300];
  const hash = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return `hsl(${hues[hash % hues.length]}, 70%, 60%)`;
}

export default function Notes({ sessionId }: { sessionId?: string }) {
  const userId = useAuthStore((state) => state.user?.id);
  const userName = useAuthStore((state) => state.user?.name || "Participant");
  const userAvatar = useAuthStore(
    (state) => state.user?.avatar_url ?? "/default-avatar.png",
  );
  const supabase = getSupabaseBrowserClient();

  const ydocRef = useRef<Y.Doc | null>(null);
  if (!ydocRef.current) ydocRef.current = new Y.Doc();

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collabEnabledRef = useRef(false);
  const hasLoadedContent = useRef(false);
  const hasSeededRef = useRef(false);
  const providerRef = useRef<SocketIOProvider | null>(null);
  const privateContentRef = useRef<any>(null);
  const collabSeedContentRef = useRef<any>(null);

  const [collabEnabled, setCollabEnabled] = useState(false);
  const [collabLoading, setCollabLoading] = useState(false);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [awarenessUsers, setAwarenessUsers] = useState<
    {
      id: string;
      name: string;
      avatar: string;
      color: string;
    }[]
  >([]);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("");

  useEffect(() => {
    collabEnabledRef.current = collabEnabled;
  }, [collabEnabled]);

  const extensions = useMemo(() => {
    const exts = [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: "Start taking notes… (type / for commands)",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
      FontSize,
      SlashCommand,
    ];

    if (collabEnabled) {
      exts.push(
        Collaboration.configure({
          document: ydocRef.current,
        }),
      );

      if (provider && userId) {
        exts.push(
          CollaborationCaret.configure({
            provider,
            user: {
              id: userId,
              name: userName,
              color: getUserColor(userId),
            },
          }),
        );
      }
    }

    return exts;
  }, [collabEnabled, provider, userId, userName]);

  const editor = useEditor(
    {
      extensions,
      immediatelyRender: false,
      onUpdate: () => {
        if (!collabEnabledRef.current) {
          scheduleSave();
        }
      },
    },
    [collabEnabled, provider, userId],
  );

  useEffect(() => {
    if (!sessionId || !userId || !editor || hasLoadedContent.current) return;

    const loadPreference = async () => {
      try {
        const { data } = await supabase
          .from("session_notes")
          .select("collab_enabled, content")
          .eq("session_id", sessionId)
          .eq("user_id", userId)
          .maybeSingle();

        const isCollab = Boolean(data?.collab_enabled);

        setCollabEnabled(isCollab);
        collabEnabledRef.current = isCollab;

        if (!isCollab && !editor.isDestroyed) {
          editor.commands.setContent(
            data?.content && Object.keys(data.content).length
              ? data.content
              : NOTES_TEMPLATE,
          );
        }
      } finally {
        setLoadingNotes(false);
        hasLoadedContent.current = true;
      }
    };

    loadPreference();
  }, [sessionId, userId, editor]);

  useEffect(() => {
    if (collabEnabled) return;
    if (!editor || editor.isDestroyed) return;
    if (privateContentRef.current === null) return;

    editor.commands.setContent(privateContentRef.current);
    privateContentRef.current = null;
  }, [editor, collabEnabled]);

  useEffect(() => {
    let cancelled = false;
    let p: SocketIOProvider | null = null;

    async function connect() {
      if (!collabEnabledRef.current || !sessionId || !userId) return;

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      const token = data.session?.access_token;
      if (!token) return;

      p = new SocketIOProvider(
        `${process.env.NEXT_PUBLIC_API_URI}`,
        sessionId,
        ydocRef.current!,
        { auth: { token } },
      );

      p.on("status", ({ status }: { status: string }) => {
        setIsConnected(status === "connected");
        if (status === "connected") {
          p?.awareness.setLocalStateField("user", {
            id: userId,
            name: userName,
            avatar: userAvatar,
            color: getUserColor(userId),
          });
        }
      });

      p.awareness.on("change", () => {
        const states = Array.from(
          p?.awareness.getStates().values() ?? [],
        ) as any[];

        setAwarenessUsers(
          states
            .filter((s) => s.user)
            .map((s) => ({
              id: s.user.id,
              name: s.user.name,
              avatar: s.user.avatar,
              color: s.user.color,
            })),
        );
      });

      p.on("sync", (isSynced: boolean) => {
        if (!isSynced) return;
        if (hasSeededRef.current) return;
        hasSeededRef.current = true;

        if (!editor || editor.isDestroyed) return;

        const isEmpty =
          ydocRef.current!.getXmlFragment("prosemirror").length === 0;
        if (isEmpty) {
          const seedContent = collabSeedContentRef.current ?? NOTES_TEMPLATE;
          editor.commands.setContent(seedContent);
        }
        collabSeedContentRef.current = null;
      });

      if (cancelled) {
        p.destroy();
        return;
      }

      providerRef.current = p;
      setProvider(p);
    }

    connect();

    return () => {
      cancelled = true;

      if (p) {
        try {
          removeAwarenessStates(p.awareness, [p.awareness.clientID], "left");
        } catch {}
        p.destroy();
      }

      setProvider(null);
      providerRef.current = null;
      hasSeededRef.current = false;
      setAwarenessUsers([]);
    };
  }, [collabEnabled, sessionId, userId]);

  const scheduleSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(saveNotes, 800);
  };

  const saveNotes = useCallback(async () => {
    if (!sessionId || !userId || !editor || editor.isDestroyed) return;
    const { error } = await supabase.from("session_notes").upsert(
      {
        session_id: sessionId,
        user_id: userId,
        content: editor.getJSON(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id,user_id" },
    );
    setSaveStatus(error ? "error" : "saved");
    if (error) console.error("Failed to save notes:", error);
  }, [sessionId, userId, editor]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (!collabEnabledRef.current) saveNotes();
      }
    };
  }, [saveNotes]);

  const toggleCollab = async () => {
    if (!sessionId || !userId || collabLoading) return;
    setCollabLoading(true);

    const newValue = !collabEnabled;

    try {
      if (!newValue && editor) {
        // Switching collaborative -> private.
        const contentJSON = editor.getJSON();
        privateContentRef.current = contentJSON;

        await supabase.from("session_notes").upsert(
          {
            session_id: sessionId,
            user_id: userId,
            content: contentJSON,
            collab_enabled: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "session_id,user_id" },
        );
      } else {
        if (editor) {
          collabSeedContentRef.current = editor.getJSON();
        }
        ydocRef.current?.destroy();
        ydocRef.current = new Y.Doc();
        hasSeededRef.current = false;

        await supabase.from("session_notes").upsert(
          {
            session_id: sessionId,
            user_id: userId,
            collab_enabled: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "session_id,user_id" },
        );
      }
      setCollabEnabled(newValue);
    } catch (err) {
      console.error("Failed to toggle collab:", err);
    } finally {
      setCollabLoading(false);
    }
  };

  const editorStats = useEditorState({
    editor,
    selector: (ctx) => ({
      characters: ctx.editor?.storage.characterCount?.characters() ?? 0,
      words: ctx.editor?.storage.characterCount?.words() ?? 0,
    }),
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

  if (loadingNotes) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Spinner size={25} />
      </div>
    );
  }

  if (collabEnabled && !provider) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Spinner size={25} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden border-l border-border/50">
      <div className="relative">
        <ToolbarButtonBar editor={editor} openLinkModal={openLinkModal} />

        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-linear-to-l from-background to-transparent md:hidden" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none min-h-0">
        <EditorContent editor={editor} />
      </div>

      <Bottombar
        toggleCollab={toggleCollab}
        collabLoading={collabLoading}
        collabEnabled={collabEnabled}
        isConnected={isConnected}
        saveStatus={saveStatus}
        editorStats={editorStats}
        awarenessUsers={awarenessUsers}
      />

      {showLinkModal && (
        <LinkModal
          setShowLinkModal={setShowLinkModal}
          linkUrlInput={linkUrlInput}
          setLinkUrlInput={setLinkUrlInput}
          removeLink={removeLink}
          applyLink={applyLink}
        />
      )}
    </div>
  );
}
