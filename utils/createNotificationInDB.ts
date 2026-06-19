import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Props {
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
}

const saveNotification = async ({ userId, type, title, body, data }: Props) => {
  const { data: notification, error } = await supabaseAdmin
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message: body,
      data,
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    console.log("❌ Notification save error:", error.message);
    return null;
  }

  return notification;
};
