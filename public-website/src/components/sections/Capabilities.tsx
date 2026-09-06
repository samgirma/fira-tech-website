import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Code, Smartphone, Globe, Server, Database, Brain, Layers } from "lucide-react";

const items = [
  { icon: Globe, title: "Web Platforms", desc: "Modern web applications built for performance and scale." },
  { icon: Smartphone, title: "Mobile Experiences", desc: "Native and cross-platform mobile apps your users will love." },
  { icon: Code, title: "Custom Software", desc: "Business-specific systems designed around how you actually work." },
  { icon: Server, title: "Cloud Infrastructure", desc: "Scalable, secure cloud architecture that grows with you." },
  { icon: Database, title: "Data Solutions", desc: "Analytics, pipelines, and intelligence from your data." },
  { icon: Brain, title: "AI & Automation", desc: "Practical AI integration that saves time and reduces cost." },
  { icon: Layers, title: "Digital Products", desc: "End-to-end product design from concept to launch." },
];

export function Capabilities() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">What We Build</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground max-w-3xl mx-auto">
            Technology across every layer
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              className="glass-card p-6 group hover:border-forest/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center mb-4 group-hover:bg-forest/20 transition-colors">
                <item.icon className="w-6 h-6 text-forest-light" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2 text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
