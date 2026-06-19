import { getSocket } from "../socket";

interface sendInAppNotificationProps {
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>
}

export function sendInAppNotification({
  userId,
  type,
  title,
  body,
  data,
}: sendInAppNotificationProps) {
  const socket = getSocket();
  if (!socket) return;

  try {
    socket.emit("notification:send", {
      userId,
      type,
      title,
      body,
      data,
    });
    
  } catch (error) {
    console.log("send In app notification error", error);
  }
}
