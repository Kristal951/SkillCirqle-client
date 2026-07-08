import OneSignal from "react-onesignal";

let initPromise: Promise<void> | null = null;

export function initOneSignal(): Promise<void> {
  if (!initPromise) {
    initPromise = OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV !== "production",
    });
  }
  return initPromise;
}

export async function loginOneSignal(userId: string) {
  if (!userId) return;
  await initOneSignal();
  await OneSignal.login(userId);
}

export async function logoutOneSignal() {
  await initOneSignal();
  await OneSignal.logout();
}
