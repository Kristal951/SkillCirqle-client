import { User } from "@/types/AuthStore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/apiFetch";
import {
  optimizeCloudinaryUrl,
  uploadToCloudinary,
} from "@/lib/uploadToCloudinary";
import { getProfile } from "@/lib/getProfile";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { getSocket } from "@/lib/socket";
import { useTokenStore } from "./useTokenStore";
import { useOnboardingStore } from "./useOnboardingStore";
import { UAParser } from "ua-parser-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  uploadProgress: number;
  isUpdatingUser: boolean;
  isUploadingProfilePic: boolean;
  isHydrated: boolean;
  authReady: boolean;

  setHydrated: (isHydrated: boolean) => void;
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
  updateUser: (updates: Partial<User>) => Promise<boolean>;
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

      setHydrated: (isHydrated) => set({ isHydrated }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      setIsUpdatingUser: (isUpdatingUser) => set({ isUpdatingUser }),
      setIsUploadingProfilePic: (isUploadingProfilePic) =>
        set({ isUploadingProfilePic }),

      logout: async () => {
        try {
          const supabase = getSupabaseBrowserClient();
          const socket = getSocket();
          await supabase.auth.signOut();

          socket?.disconnect();

          await fetch("/api/user/logout", {
            method: "POST",
          });

          set({
            user: null,
            uploadProgress: 0,
            authReady: false,
          });

          useTokenStore.getState().setTokens(0);
          useTokenStore.getState().setTotal(0);

          useOnboardingStore.getState().setTotalSteps(0);

          localStorage.removeItem("auth-storage");
          sessionStorage.removeItem("device_session_id");

          window.location.replace("/auth/signin");
        } catch (error) {
          console.error("Logout failed:", error);
        }
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
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (!data.session) return set({ authReady: true });

        const parser = new UAParser();
        const result = parser.getResult();

        let sessionId = sessionStorage.getItem("device_session_id");

        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem("device_session_id", sessionId);
        }

        await apiFetch("/api/user/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            device_name: result.device.model || "Desktop",
            browser: result.browser.name,
            os: result.os.name,
            user_agent: navigator.userAgent,
          }),
        });

        const user = await getProfile(supabase, data.session.user.id);

        set({ user, authReady: true });
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

        if (!prevUser) return false;

        set({ isUpdatingUser: true });

        try {
          const res = await apiFetch("/api/user/update-profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates }),
          });

          if (!res.ok) throw new Error("Update failed");

          const { user } = await res.json();

          set({ user });

          return true;
        } catch (error) {
          console.error("❌ Update user failed:", error);

          // rollback
          set({ user: prevUser });

          return false;
        } finally {
          set({ isUpdatingUser: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);


// https://chatgpt.com/share/6a102f94-a074-83ea-8e47-54179ec18d74 - for legal documents