"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "@/lib/toast";

interface ToastError {
  title: string;
  description?: string;
}

const ERROR_MESSAGES: Record<string, ToastError> = {
  unauthorized: {
    title: "Please log in",
    description: "You need to be signed in to continue.",
  },
  admin_required: {
    title: "Access denied",
    description: "You don't have permission to access the admin dashboard.",
  },
  session_revoked: {
    title: "Session ended",
    description: "This device was signed out remotely.",
  },
};

export default function AuthErrorToast() {
  return (
    <Suspense fallback={null}>
      <AuthErrorToastInner />
    </Suspense>
  );
}

function AuthErrorToastInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    const { title, description } = ERROR_MESSAGES[error] ?? {
      title: "Something went wrong",
    };
    toast.error(title, description);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    params.delete("redirect");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [searchParams]);

  return null;
}
