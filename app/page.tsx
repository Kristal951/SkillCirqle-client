import FirstSection from "@/components/landing/FirstSection";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import SecondSection from "@/components/landing/SecondSection";
import ThirdSection from "@/components/landing/ThirdSection";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col bg-background-base">
      <Navbar />

      <section className="relative w-full min-h-screen flex items-center">
        <FirstSection />
      </section>

      <section className="relative w-full py-20">
        <SecondSection />
      </section>

      <section className="relative w-full py-20 px-4 sm:px-6 md:px-8">
        <ThirdSection />
      </section>

      <Footer />
    </main>
  );
}
