import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminSidebarState {
  isCollapsed: boolean;
  adminModeReady: boolean;
  showMobileSidebar: boolean;
  toggle: () => void;
  toggleMobileSidebar: () => void;
  setCollapsed: (value: boolean) => void;
  setShowMobileSidebar: (show: boolean) => void;
  setAdminModeReady: (ready: boolean) => void;
}

export const useAdminSidebarStore = create<AdminSidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      showMobileSidebar: false,
      adminModeReady: false,
      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      toggleMobileSidebar: () =>
        set((state) => ({ showMobileSidebar: !state.showMobileSidebar })),
      setCollapsed: (value) => set({ isCollapsed: value }),
      setShowMobileSidebar: (value) => set({ showMobileSidebar: value }),
      setAdminModeReady: (value) => set({ adminModeReady: value }),
    }),
    {
      name: "admin-sidebar-storage",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        // adminModeReady and showMobileSidebar intentionally excluded —
        // adminModeReady must always come from a live admin:join round-trip,
        // never from a cached previous session
      }),
    },
  ),
);