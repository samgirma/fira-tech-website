import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { CommunitySection } from "@/components/CommunitySection";
import CommentsSection from "@/components/CommentsSection";
import { Footer } from "@/components/Footer";
import { ChatAssistant } from "@/components/ChatAssistant";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <CommunitySection />
        <CommentsSection />
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
};

export default Index;
