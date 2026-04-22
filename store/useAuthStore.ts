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

      logout: () => set({ user: null, uploadProgress: 0, authReady: false }),

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

      // Inside useAuthStore.ts
      fetchUser: async () => {
        const supabase = await getSupabaseBrowserClient(); // The Client one
        const { data } = await supabase.auth.getSession();
          console.log("🟡 createSupabaseServer called");

        if (!data.session) return set({ authReady: true });

        // Pass the browser client into the helper
        const user = await getProfile(supabase, data.session.user.id);

        set({ user, authReady: true });
        // useTokenStore().setTokens(user?.wallet?.skillTokens);
        // useTokenStore().setTotal(user?.wallet?.totalEarned);
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

        // Optimistic Update
        set({ user: { ...prevUser, ...updates }, isUpdatingUser: true });

        try {
          const res = await apiFetch("/api/user/update-profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates }),
          });

          if (!res.ok) throw new Error("Update failed");
          return true;
        } catch (error) {
          console.error("❌ Update user failed:", error);
          set({ user: prevUser }); // Rollback
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
