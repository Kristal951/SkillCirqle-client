import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { getSocket } from "@/lib/socket";
import { Notification, NotificationsState } from "@/types/NotificationStore";
import { toast } from "@/lib/toast";
import type { RealtimeChannel } from "@supabase/supabase-js";

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  deletingIds: [],
  realtimeChannel: null as RealtimeChannel | null,
  realtimeChannelUserId: null as string | null,

  fetchNotifications: async (userId: string) => {
    if (!userId) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    set({ loading: true });

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch notifications error:", error.message);
      set({ loading: false });
      return;
    }

    const unread = data.filter((n) => !n.is_read).length;

    set({
      notifications: data,
      unreadCount: unread,
      loading: false,
    });
  },

  setDeleting: (id: string, value: boolean) =>
    set((state) => ({
      deletingIds: value
        ? [...state.deletingIds, id]
        : state.deletingIds.filter((x) => x !== id),
    })),

  addNotification: (notification) => {
    const normalized = {
      ...notification,
      is_read: notification.is_read ?? false,
    };

    let added = false;

    set((state) => {
      const exists = state.notifications.some((n) => n.id === normalized.id);
      if (exists) return state;

      added = true;
      return {
        notifications: [normalized, ...state.notifications],
        unreadCount: normalized.is_read
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    });

    return added;
  },

  markAsRead: async (notificationId: string) => {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Mark read error:", error.message);
      return;
    }

    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n,
      );

      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      };
    });
  },

  deleteNotification: async (notificationId: string) => {
    const supabase = getSupabaseBrowserClient();
    get().setDeleting(notificationId, true);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    get().setDeleting(notificationId, false);

    if (error) {
      console.error("Delete notification error:", error.message);
      return;
    }

    set((state) => {
      const updated = state.notifications.filter(
        (n) => n.id !== notificationId,
      );

      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      };
    });
  },

  deleteAllNotifications: async (userId: string) => {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Delete all notifications error:", error.message);
      return;
    }

    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  markAllAsRead: async (userId: string) => {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Mark all read error:", error.message);
      return;
    }

    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        is_read: true,
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
      const added = get().addNotification(notification);
      if (added) {
        toast.info(notification.title || "Notification", notification.message);
      }
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
          is_read: true,
        })),
        unreadCount: 0,
      }));
    });
  },

  listenToNotificationsRealtime: (userId: string) => {
    const { realtimeChannel, realtimeChannelUserId } = get();

    if (realtimeChannelUserId === userId) return; 
    if (realtimeChannel) {
      const supabase = getSupabaseBrowserClient();
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null, realtimeChannelUserId: null });
    }
    
    set({ realtimeChannelUserId: userId });

    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          const added = get().addNotification(notification);
          if (added) {
            toast.info(
              notification.title || "Notification",
              notification.message,
            );
          }
        },
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  cleanupRealtime: () => {
    const { realtimeChannel } = get();
    if (!realtimeChannel) return;

    const supabase = getSupabaseBrowserClient();
    supabase.removeChannel(realtimeChannel);
    set({ realtimeChannel: null, realtimeChannelUserId: null });
  },

  cleanup: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("notification:new");
    socket.off("notification:updated");
    socket.off("notification:all_read");
  },
}));