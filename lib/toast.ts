import { useToastStore } from "@/store/useToast";

export const toast = {
  success: (message: string, description?: string) =>
    useToastStore
      .getState()
      .addToast({ message, description, type: "success" }),

  error: (message: string, description?: string) =>
    useToastStore.getState().addToast({ message, description, type: "error" }),

  info: (message: string, description?: string) =>
    useToastStore.getState().addToast({ message, description, type: "info" }),

  warning: (message: string, description?: string) =>
    useToastStore.getState().addToast({ message, description, type: "warning" }),
};
