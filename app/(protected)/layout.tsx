"use client";

import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import Spinner from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isHydrated && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, isHydrated, router]);

  if (!isHydrated || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto mt-17.5">{children}</main>
      </div>
    </div>
  );
}
