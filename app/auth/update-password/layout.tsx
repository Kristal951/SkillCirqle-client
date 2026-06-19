import { Suspense } from "react";
import Spinner from "@/components/ui/Spinner";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center">
          <Spinner size={24} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}