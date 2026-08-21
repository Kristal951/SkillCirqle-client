import { RealtimeChannel } from "@supabase/supabase-js";

export type NotificationType =
  | "proposal_received"
  | "proposal_updated"
  | "message"
  | "system"
  | "session_scheduled"
  | "session_rescheduled"
  | "session_missed"
  | "session_rejected";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
  link: string;
};

export type NotificationsState = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  deletingIds: string[];
  realtimeChannel: RealtimeChannel | null;
  realtimeChannelUserId: string | null;
  addNotification: (notification: Notification) => boolean;
  listenToNotificationsRealtime: (userId: string) => void;
  cleanupRealtime: () => void;
  fetchNotifications: (userId: string) => Promise<void>;

  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllNotifications: (userId: string) => Promise<void>;

  listenToNotifications: () => void;
  cleanup: () => void;
  setDeleting: (id: string, value: boolean) => void;
};
