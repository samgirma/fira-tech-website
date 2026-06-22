import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { CommunitySection } from "@/components/CommunitySection";
import { ContactSection } from "@/components/ContactSection";
import CommentsSection from "@/components/CommentsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <CommunitySection />
        <ContactSection />
        <CommentsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
