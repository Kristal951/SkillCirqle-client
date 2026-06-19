export async function sendPushNotification(
  userId: string,
  message: string,
  url: string,
  heading: string,
) {
  await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      include_aliases: {
        external_id: [userId],
      },
      target_channel: "push",
      headings: { en: heading },
      contents: {
        en: message,
      },
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${url}`,
    }),
  });
}
