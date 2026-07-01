import { useSessionStore } from "@/store/useSessionStore";
import { useRef } from "react";

export function useJitsiSession(roomId: string) {
  const actions = useSessionStore();
  const apiRef = useRef(null);
}
