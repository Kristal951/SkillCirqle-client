import OneSignal from "@/lib/oneSignal";

export async function loginOneSignal(userId?: string) {
  if (!userId) return;

  await OneSignal.login(userId);
}
