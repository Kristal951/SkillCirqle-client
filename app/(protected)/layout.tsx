"use client";

import MediaViewer from "@/components/chat/MediaViewer";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomBar from "@/components/ui/BottomBar";
import Spinner from "@/components/ui/Spinner";
import { useClearSessionCache } from "@/hooks/useSessions";
import { logoutOneSignal } from "@/lib/oneSignal";
import { useLogoutModal } from "@/providers/LogoutContext";
import NotificationProvider from "@/providers/NotificationProvider";
import OneSignalProvider from "@/providers/oneSignal";
import OneSignalLoginSync from "@/providers/OneSignalLoginSync";
import SocketProvider from "@/providers/SocketProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
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
  const [isInSessionPage, setIsInSessionPage] = useState(false);

  const { activeChat } = useChatStore();
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const { showLogoutModal, openLogoutModal, closeLogoutModal } =
    useLogoutModal();
  const { fetchNotifications } = useNotificationsStore();

  useEffect(() => {
    setIsInChatPage(pathname.startsWith("/chat"));
  }, [pathname]);
  useEffect(() => {
    setIsInSessionPage(pathname.startsWith("/sessions"));
    console.log(isInSessionPage, "sess", pathname);
  }, [pathname]);

  const clearSessionCache = useClearSessionCache();

  useEffect(() => {
    if (user?.id) fetchNotifications(user?.id || "");
  }, [user?.id, fetchNotifications]);

  const handleOpenLogout = () => {
    openLogoutModal();
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      clearSessionCache();
      await logoutOneSignal();
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
      closeLogoutModal();
    }
  };

  const isAdmin = pathname.startsWith("/admin");

  return (
    <SocketProvider>
      <NotificationProvider>
        <OneSignalProvider />
        <OneSignalLoginSync />
        <div className="flex relative flex-col h-screen">
          {!isAdmin && !isInSessionPage && (
            <Navbar setIsSideBarOpen={setIsSideBarOpen} />
          )}

          <div className="flex flex-1 overflow-hidden">
            {!isAdmin && (
              <Sidebar
                isSideBarOpen={isSideBarOpen}
                setIsSideBarOpen={setIsSideBarOpen}
              />
            )}

            <main
              className={`flex-1 overflow-y-auto ${isInSessionPage || isAdmin ? "mt-0" : "mt-17.5"} ${
                (isInChatPage && activeChat) || isInSessionPage
                  ? "mb-0"
                  : "mb-13 md:mb-0"
              }`}
            >
              {children}
            </main>
          </div>

          {loggingOut && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
              <Spinner size={48} />
            </div>
          )}

          {!isAdmin && <MediaViewer />}

          {showLogoutModal && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
              <div className="bg-surface rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">
                    Confirm Logout
                  </h3>
                  <p className="text-text-secondary mt-2">
                    Are you sure you want to log out? You will need to sign in
                    again to access your account.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 py-4">
                  <button
                    onClick={closeLogoutModal}
                    className="flex-1 px-4 py-2 rounded-lg bg-text-primary text-primary font-medium transition-colors"
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

          {!isAdmin && <BottomBar />}
        </div>
      </NotificationProvider>
    </SocketProvider>
  );
}
