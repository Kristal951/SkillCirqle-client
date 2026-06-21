"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { loginOneSignal } from "@/lib/oneSignal";

export default function OneSignalLoginSync() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.id) return;

    loginOneSignal(user.id);
  }, [user?.id]);

  return null;
}
