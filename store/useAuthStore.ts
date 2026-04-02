import { User } from "@/types/AuthStore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/apiFetch";
import {
  optimizeCloudinaryUrl,
  uploadToCloudinary,
} from "@/lib/uploadToCloudinary";

interface AuthState {
  user: User | null;
  loading: boolean;
  uploadProgress: number;
  isUpdatingUser: boolean;
  isUploadingProfilePic: boolean;
  isHydrated: boolean;

  setHydrated: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setIsUpdatingUser: (isUpdatingUser: boolean) => void;
  setIsUploadingProfilePic: (isUploadingProfilePic: boolean) => void;
  setUploadProgress: (progress: number) => void;

  logout: () => void;

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

      setHydrated: () => set({ isHydrated: true }),

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      setIsUpdatingUser: (isUpdatingUser) => set({ isUpdatingUser }),
      setIsUploadingProfilePic: (isUploadingProfilePic) =>
        set({ isUploadingProfilePic }),

      logout: () =>
        set({
          user: null,
          uploadProgress: 0,
        }),

      uploadUserProfilePic: async (file: File) => {
        if (!file) return null;

        set({ isUploadingProfilePic: true, uploadProgress: 0 });

        try {
          const res = await uploadToCloudinary(file, (progress) => {
            set({ uploadProgress: progress });
          });

          const optimizedUrl = optimizeCloudinaryUrl(res.secure_url);

          const currentUser = get().user;

          if (currentUser) {
            set({
              user: {
                ...currentUser,
                avatarUrl: optimizedUrl,
              },
            });
          }

          return optimizedUrl;
        } catch (error) {
          console.error("Upload failed:", error);
          return null;
        } finally {
          set({ isUploadingProfilePic: false });
        }
      },

      updateUser: async (updates: Partial<User>) => {
        set({ isUpdatingUser: true });

        try {
          const res = await apiFetch("/api/user/update-profile", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ updates }),
          });

          if (!res.ok) {
            throw new Error("Failed to update user");
          }

          const currentUser = get().user;

          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              ...updates,
            };

            set({
              user: updatedUser,
            });
          }

          return true;
        } catch (error) {
          console.error("❌ Update user failed:", error);
          return false;
        } finally {
          set({ isUpdatingUser: false });
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
