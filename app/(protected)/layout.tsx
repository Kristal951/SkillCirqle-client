"use client";
import MediaViewer from "@/components/chat/MediaViewer";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import ThemeToggle from "@/components/ToggleThemeButton";
import Spinner from "@/components/ui/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useTokenStore } from "@/store/useTokenStore";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { setTokens, setTotal } = useTokenStore();
  const { setUser } = useAuthStore();

  const handleLogout = async () => {
    setShowLogoutModal(false); 
    setLoggingOut(true);
    try {
      const supabase = await getSupabaseBrowserClient();
      await supabase.auth.signOut();
      setUser(null);
      setTokens(0);
      setTotal(0);
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false); 
    }
  };
  return (
    <div className="flex relative flex-col h-screen">
      <Navbar setIsSideBarOpen={setIsSideBarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isSideBarOpen={isSideBarOpen}
          setLoggingOut={setLoggingOut}
          setIsSideBarOpen={setIsSideBarOpen}
          setShowLogoutModal={setShowLogoutModal}
        />

        <main className="flex-1 overflow-y-auto mt-17.5">{children}</main>

        {/* <div className="md:hidden lg:hidden absolute bottom-2 right-2">
          <ThemeToggle />
        </div> */}
      </div>

      {loggingOut && (
        <div className="fixed inset-0 z-100 bg-black/70 flex items-center justify-center">
          <Spinner size={48} />
        </div>
      )}

      <MediaViewer />

      {showLogoutModal && (
        <div className="fixed inset-0 z-100 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">
                Confirm Logout
              </h3>
              <p className="text-text-secondary mt-2">
                Are you sure you want to log out? You will need to sign in again
                to access your account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 py-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 b rounded-lg bg-text-primary text-primary font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-secondary hover:text-white rounded-lg font-medium transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
