"use client";

import Spinner from "@/components/ui/Spinner";
import { logout } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const {user} = useAuthStore()

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/auth/signin");
    } catch (error) {
      console.log(error);
    } finally {
      setLoggingOut(false);
    }
  };
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      {user && <p>Welcome, {user.displayName}!</p>}

      {loggingOut && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Spinner size={40} />
        </div>
      )}
    </div>
  );
}
