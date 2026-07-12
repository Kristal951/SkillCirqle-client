import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminSidebarState {
  isCollapsed: boolean;
  showMobileSidebar: boolean;
  toggle: () => void;
  toggleMobileSidebar: ()=> void
  setCollapsed: (value: boolean) => void;
  setShowMobileSidebar: (show: boolean) => void;
}

export const useAdminSidebarStore = create<AdminSidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      showMobileSidebar: false,
      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      toggleMobileSidebar: () => set((state) => ({ showMobileSidebar: !state.showMobileSidebar })),
      setCollapsed: (value) => set({ isCollapsed: value }),
      setShowMobileSidebar: (value) => set({ showMobileSidebar: value }),
    }),
    { name: "admin-sidebar-storage" },
  ),
);
