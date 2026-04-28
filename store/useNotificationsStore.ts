import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { getSocket } from "@/lib/socket";
import { Notification, NotificationsState } from "@/types/NotificationStore";
import { toast } from "@/lib/toast";

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (userId: string) => {
    if (!userId) {
      console.log(`! userID`);
      return;
    }
    console.log(userId);
    const supabase = getSupabaseBrowserClient();
    set({ loading: true });

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    console.log(data);

    if (error) {
      console.error("Fetch notifications error:", error.message);
      set({ loading: false });
      return;
    }

    const unread = data.filter((n) => !n.is_read).length;
    console.log(unread);

    set({
      notifications: data,
      unreadCount: unread,
      loading: false,
    });
  },

  addNotification: (notification) => {
    set((state) => {
      const exists = state.notifications.some((n) => n.id === notification.id);
      if (exists) return state;

      return {
        notifications: [notification, ...state.notifications],
        unreadCount: notification.is_read
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    });
  },

  markAsRead: async (notificationId: string) => {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Mark read error:", error.message);
      return;
    }

    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      );

      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      };
    });
  },

  markAllAsRead: async (userId: string) => {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Mark all read error:", error.message);
      return;
    }

    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
      })),
      unreadCount: 0,
    }));
  },

  listenToNotifications: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("notification:new");
    socket.off("notification:updated");
    socket.off("notification:all_read");

    socket.on("notification:new", (notification: Notification) => {
      console.log("🔥 notification received:", notification);

      get().addNotification(notification);

      toast.info(notification.title || "Notification", notification.body);
    });

    socket.on("notification:updated", (updated: Notification) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === updated.id ? updated : n,
        ),
      }));
    });

    socket.on("notification:all_read", () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
        })),
        unreadCount: 0,
      }));
    });
  },

  cleanup: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("notification:new");
    socket.off("notification:updated");
    socket.off("notification:all_read");
  },
}));
