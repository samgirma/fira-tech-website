import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Heart, Globe, TreeDeciduous } from "lucide-react";

const values = [
  {
    icon: TreeDeciduous,
    title: "Rooted in Community",
    description: "Like the Oda tree that shelters our people, we build technology that nurtures and protects the communities we serve.",
  },
  {
    icon: Heart,
    title: "Kinship First",
    description: "Fira means family. Every client becomes part of our extended family, receiving the care and dedication that bond brings.",
  },
  {
    icon: Globe,
    title: "Local-Global Vision",
    description: "We think globally while acting locally, creating solutions that work offline-first for Africa while meeting world-class standards.",
  },
  {
    icon: Users,
    title: "Collaborative Spirit",
    description: "True innovation comes from working together. We partner with businesses, not just serve them.",
  },
];

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-padding relative bg-background/40 backdrop-blur-sm overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 oromo-pattern opacity-20" />
      
      {/* Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-forest/10 rounded-full blur-[150px]" />

      <div ref={ref} className="container-fira relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">Our Story</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-6">
            Innovation. Community. <span className="text-gradient-green">Value.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We are a software engineering startup based in Adama, Ethiopia, dedicated to building 
            high-impact digital solutions for local businesses and the global market.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="glass-card p-8 group hover:border-forest/50 transition-all duration-500"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center group-hover:glow-green transition-all duration-500">
                  <value.icon className="w-7 h-7 text-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold mb-2 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
