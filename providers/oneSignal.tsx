"use client";

import { initOneSignal } from "@/lib/oneSignal";
import { useEffect } from "react";

export default function OneSignalProvider() {
  useEffect(() => {
    initOneSignal();
  }, []);

  return null;
}
