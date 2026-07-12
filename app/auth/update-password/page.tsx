import { Suspense } from "react";
import Spinner from "@/components/ui/Spinner";
import UpdatePasswordPage from "./UpdatePasswordPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size={24} />
        </div>
      }
    >
      <UpdatePasswordPage />
    </Suspense>
  );
}