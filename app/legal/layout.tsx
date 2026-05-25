import LegalNavbar from "@/components/legal/Navbar";
import Sidebar from "@/components/legal/Sidebar";

export default function LegalDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="fixed right-0 px-4 md:px-0 lg:px-0 md:py-5 lg:py-5 py-0 left-0 top-0 z-30 bg-background ">
        <div className=" w-full md:px-8 py-6">
          <div className="max-w-2xl flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              Legal Documents
            </h1>

            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Your trust is the foundation of SkillCirqle. We are committed to
              maintaining a secure, fair, and transparent environment for all
              Cirqlers.
            </p>
          </div>
        </div>

          <LegalNavbar/>
      </div>

      <div className="max-w-7xl flex gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 md:pl-74 lg:pl-74 px-4 pt-44">{children}</main>
      </div>
    </div>
  );
}