import { waitForSocket } from "../socket";

interface EmitNotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function emitNotification(payload: EmitNotificationPayload) {
  try {
    const socket = await waitForSocket(8000);
    socket.emit("notification:send", payload);
  } catch (err) {
    console.error("Notification emit failed — socket unavailable:", err);
  }
}
