import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent! 🌿",
      description: "Welcome to the family! We'll be in touch soon.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="section-padding relative bg-secondary/30">
      {/* Background */}
      <div className="absolute inset-0 oromo-pattern opacity-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />

      <div ref={ref} className="container-fira relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent text-sm font-semibold tracking-wider uppercase">Get in Touch</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-6">
              Join the <span className="text-gradient-gold">Family</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Ready to start your digital transformation journey? We'd love to hear from you. 
              Let's build something meaningful together.
            </p>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email Us</div>
                  <a href="mailto:contact@firatechsolutions.com" className="text-foreground hover:text-accent transition-colors">
                    admin@firatech.systems
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Visit Us</div>
                  <span className="text-foreground">Adama, Ethiopia 🇪🇹</span>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="mt-12 p-6 glass-card">
              <p className="text-lg font-display italic text-center text-muted-foreground">
                "Empowering communities through digital transformation."
              </p>
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Name</label>
                  <Input 
                    placeholder="Enter your name" 
                    required 
                    className="bg-background/50 border-border/50 focus:border-forest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    required
                    className="bg-background/50 border-border/50 focus:border-forest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subject</label>
                <Input 
                  placeholder="How can we help?" 
                  required
                  className="bg-background/50 border-border/50 focus:border-forest"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Message</label>
                <Textarea 
                  placeholder="Tell us about your project or idea..." 
                  rows={5}
                  required
                  className="bg-background/50 border-border/50 focus:border-forest resize-none"
                />
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Start a Conversation
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
