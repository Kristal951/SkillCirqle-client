export type NotificationType =
  | "proposal_received"
  | "proposal_updated"
  | "message"
  | "system";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
};

export type NotificationsState = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;

  fetchNotifications: (userId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;

  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;

  listenToNotifications: () => void;
  cleanup: () => void;
};
