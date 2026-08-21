import { User } from "@/types/AuthStore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/apiFetch";
import {
  optimizeCloudinaryUrl,
  uploadToCloudinary,
} from "@/lib/uploadToCloudinary";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { getSocket } from "@/lib/socket";
import { useTokenStore } from "./useTokenStore";
import { useOnboardingStore } from "./useOnboardingStore";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";

interface AuthState {
  user: User | null;
  loading: boolean;
  uploadProgress: number;
  isUpdatingUser: boolean;
  isUploadingProfilePic: boolean;
  isHydrated: boolean;
  authReady: boolean;
  skillsVersion: number;

  setHydrated: (isHydrated: boolean) => void;
  bumpSkillsVersion: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setIsUpdatingUser: (isUpdatingUser: boolean) => void;
  setIsUploadingProfilePic: (isUploadingProfilePic: boolean) => void;
  setUploadProgress: (progress: number) => void;
  fetchUser: () => Promise<any>;

  logout: () => void;
  reset: () => void;
  isAuthenticated: () => boolean;

  uploadUserProfilePic: (file: File) => Promise<string | null>;
  updateUser: (
    updates: Partial<User>,
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      uploadProgress: 0,
      isUpdatingUser: false,
      isUploadingProfilePic: false,
      isHydrated: false,
      authReady: false,
      skillsVersion: 0,

      setHydrated: (isHydrated) => set({ isHydrated }),
      bumpSkillsVersion: () =>
        set((state) => ({ skillsVersion: state.skillsVersion + 1 })),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      setIsUpdatingUser: (isUpdatingUser) => set({ isUpdatingUser }),
      setIsUploadingProfilePic: (isUploadingProfilePic) =>
        set({ isUploadingProfilePic }),

      logout: async () => {
        const supabase = getSupabaseBrowserClient();
        const socket = getSocket();
        const currentUserId = get().user?.id;

        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error("Supabase signOut failed:", error);
        }

        try {
          await fetch("/api/user/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId }),
          });
        } catch (error) {
          console.error("Server logout call failed:", error);
        }

        socket?.disconnect();

        set({
          user: null,
          uploadProgress: 0,
          authReady: false,
        });

        useTokenStore.getState().unsubscribeFromTokenUpdates();
        useTokenStore.getState().setTokens(0);
        useTokenStore.getState().setTotal(0);
        useOnboardingStore.getState().setTotalSteps(0);

        localStorage.removeItem("auth-storage");
        sessionStorage.removeItem("device_session_id");

        window.location.replace("/auth/signin");
      },

      reset: () =>
        set({
          user: null,
          loading: false,
          uploadProgress: 0,
          isUpdatingUser: false,
          isUploadingProfilePic: false,
          authReady: false,
        }),

      isAuthenticated: () => !!get().user,

      fetchUser: async () => {
        try {
          const parser = new UAParser();
          const result = parser.getResult();
          const isUsableModel = (model?: string) =>
            !!model && model.trim().length > 2;

          const deviceName =
            result.device.vendor && isUsableModel(result.device.model)
              ? `${result.device.vendor} ${result.device.model}`.trim()
              : result.os.name === "Android"
                ? "Android Phone"
                : result.os.name === "iOS"
                  ? "iPhone"
                  : result.os.name === "Windows"
                    ? "Windows PC"
                    : result.os.name === "Mac OS"
                      ? "Mac"
                      : "Desktop";

          let deviceSessionId = localStorage.getItem("device_session_id");

          if (!deviceSessionId) {
            deviceSessionId = globalThis.crypto?.randomUUID?.() ?? uuidv4();
            localStorage.setItem("device_session_id", deviceSessionId);
          }

          try {
            await apiFetch("/api/user/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                device_session_id: deviceSessionId,
                device_name: deviceName,
                browser: result.browser.name,
                os: result.os.name,
                user_agent: navigator.userAgent,
              }),
            });
          } catch (e) {
            console.error("Session API failed", e);
          }

          const res = await apiFetch("/api/auth/profile");
          const parsedRes = await res.json();
          const { profile } = parsedRes;

          set({
            user: profile,
            authReady: true,
          });

          if (profile?.id) {
            useTokenStore.getState().subscribeToTokenUpdates(profile.id);
          }
        } catch (err) {
          console.error("fetchUser", err);
          set({ authReady: true, user: null });
        }
      },

      uploadUserProfilePic: async (file: File) => {
        if (!file) return null;
        set({ isUploadingProfilePic: true, uploadProgress: 0 });

        try {
          const res = await uploadToCloudinary(file, (progress) => {
            set({ uploadProgress: progress });
          });
          return optimizeCloudinaryUrl(res.secure_url);
        } catch (error) {
          console.error("Upload failed:", error);
          return null;
        } finally {
          set({ isUploadingProfilePic: false });
        }
      },

      updateUser: async (updates: Partial<User>) => {
        const prevUser = get().user;

        if (!prevUser) {
          return {
            success: false,
            message: "User not found in state",
          };
        }

        set({ isUpdatingUser: true });

        try {
          const res = await fetch("/api/user/update-profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates }),
          });

          if (!res.ok) {
            const errorData = await res.json();

            console.error("Update user failed:", errorData);

            return {
              success: false,
              message: errorData.message || "Failed to update user",
            };
          }

          const { user } = await res.json();
          set({ user });

          return {
            success: true,
            message: "Profile updated successfully",
            user,
          };
        } catch (error: any) {
          console.error("❌ Update user failed:", error);

          return {
            success: false,
            message: error?.message || "Unexpected error occurred",
          };
        } finally {
          set({ isUpdatingUser: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({}),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
