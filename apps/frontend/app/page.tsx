import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import BottomCTA from "@/components/landing/BottomCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white relative">
      {/* Background glow & Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1A6CF6]/10 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar />
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <BottomCTA />
        <Footer />
      </div>
    </main>
  );
}
