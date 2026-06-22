import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShoppingCart, Smartphone, Sprout, GraduationCap, Code, Cloud } from "lucide-react";

const services = [
  {
    icon: ShoppingCart,
    title: "Retail SaaS",
    description: "Streamlining inventory and sales for small-to-medium enterprises with Fira Retail — our flagship product.",
    highlight: "Flagship Product",
    color: "accent",
  },
  {
    icon: Smartphone,
    title: "Custom Web & Mobile Apps",
    description: "Building robust, offline-first applications tailored for the African market and beyond.",
    highlight: null,
    color: "forest",
  },
  {
    icon: Sprout,
    title: "Agri-Tech Solutions",
    description: "Developing scalable platforms that empower farmers and agricultural communities.",
    highlight: null,
    color: "forest",
  },
  {
    icon: GraduationCap,
    title: "Ed-Tech Platforms",
    description: "Creating accessible educational technology that bridges knowledge gaps across regions.",
    highlight: null,
    color: "forest",
  },
  {
    icon: Code,
    title: "Full-Stack Development",
    description: "React Native, Flutter, Next.js, Node.js — we build with the best modern technologies.",
    highlight: null,
    color: "forest",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure",
    description: "PostgreSQL, Supabase, Firebase — reliable and scalable backend solutions.",
    highlight: null,
    color: "forest",
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="section-padding relative bg-secondary/30">
      {/* Background Elements */}
      <div className="absolute inset-0 oromo-pattern opacity-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[200px]" />

      <div ref={ref} className="container-fira relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">What We Do</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-6">
            Building <span className="text-gradient-gold">Digital Bridges</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We bridge the gap between traditional business and modern technology, 
            creating solutions that work for our communities.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`glass-card p-6 group hover:border-${service.color}/50 transition-all duration-500 ${
                service.highlight ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Highlight Badge */}
              {service.highlight && (
                <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-4">
                  {service.highlight}
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                service.color === "accent" 
                  ? "from-accent to-gold-muted" 
                  : "from-forest to-forest-dark"
              } flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className={`w-6 h-6 ${
                  service.color === "accent" ? "text-accent-foreground" : "text-foreground"
                }`} />
              </div>

              <h3 className="text-xl font-display font-bold mb-3 text-foreground">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
