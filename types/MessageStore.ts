import { UIMessage } from "@/app/(protected)/chat/page";
import { Message } from "@/store/useChatStore";
import { Dispatch, SetStateAction } from "react";

export type EditingMessageState = {
  id: string;
  content: string;
  conversationId: string;
  isMediaMessage: boolean;
} | null;
export type SetEditingMessage = Dispatch<SetStateAction<EditingMessageState>>;

export type MessageActionsState = {
  activeMessageId: string | null;
  replyingTo: UIMessage | null;

  setActiveMessage: (id: string | null) => void;
  toggleMessageMenu: (id: string) => void;

  setReply: (msg: UIMessage | null) => void;
  clearReply: () => void;
  editingMessage: EditingMessageState;
  setEditingMessage: (msg: EditingMessageState) => void;

  clearAll: () => void;

  copyMessage: (msg: UIMessage) => void;
  deleteMessage: (msgId: string, conversationId: string) => Promise<void>;
};
