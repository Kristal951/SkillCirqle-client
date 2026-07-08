import { getSocket } from "../socket";
import { emitNotification } from "./notify";

interface sendInAppNotificationProps {
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
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
    emitNotification({
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
