import FirstSection from "@/components/landing/FirstSection";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import SecondSection from "@/components/landing/SecondSection";
import ThirdSection from "@/components/landing/ThirdSection";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col bg-background">
      <Navbar />
      <section className="relative w-full h-screen">
        <FirstSection />
      </section>
      <section className="relative w-full h-screen">
        <SecondSection />
      </section>
      <section className="relative w-full h-screen py-20 px-8">
        <ThirdSection />
      </section>
      <Footer/>
    </main>
  );
}
