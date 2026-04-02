"use client";

import Navbar from "@/components/dashboard/Navbar";
import Spinner from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading) {
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
      {children}
    </div>
  );
}
