"use client";
import MediaViewer from "@/components/chat/MediaViewer";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomBar from "@/components/ui/BottomBar";
import Spinner from "@/components/ui/Spinner";
import { useClearSessionCache } from "@/hooks/useSessions";
import { LogoutModalProvider, useLogoutModal } from "@/providers/LogoutContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isInChatPage, setIsInChatPage] = useState(false);
  const { activeChat } = useChatStore();
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const { showLogoutModal, openLogoutModal, closeLogoutModal } =
    useLogoutModal();

  useEffect(() => {
    setIsInChatPage(pathname.startsWith("/chat"));
  });

  const handleLogout = async () => {
    openLogoutModal();
    setLoggingOut(true);
    console.log('clicked')
    try {
      useClearSessionCache();
      logout();
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
          setIsSideBarOpen={setIsSideBarOpen}
        />

        <main
          className={`flex-1 overflow-y-auto mt-17.5 ${isInChatPage && activeChat ? "mb-0" : "mb-13 md:mb-0"}`}
        >
          {children}
        </main>

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
                onClick={() => closeLogoutModal()}
                className="flex-1 px-4 py-2 b rounded-lg bg-text-primary text-primary font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-secondary hover:text-white rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomBar />
    </div>
  );
}
