import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/api";
import { OdaTreeVisual } from "@/components/tree/OdaTreeVisual";
import { TechnologyEcosystem3D } from "@/components/three-d/TechnologyEcosystem3D";

export function Hero() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    site.getHome().then(setData).catch(() => {});
  }, []);

  const settings = data?.settings || {};

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Layered background: Oda tree atmosphere */}
      <OdaTreeVisual className="absolute inset-0 z-0" withTechOverlay parallax />

      {/* Soft gradient overlay for depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/30 via-background/60 to-background/90" />

      <div className="container-fira relative z-10 px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent/80">
              Fira Tech Solutions
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.08] mb-6"
          >
            <span className="text-foreground">Building technology </span>
            <br className="hidden md:block" />
            <span className="text-gradient-gold">that moves ideas forward.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            We design and build digital products, software platforms, and technology solutions that turn real-world problems into useful experiences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/start-a-project"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 text-base"
            >
              Start a Project
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link
              to="/work"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-border/50 text-foreground font-medium rounded-full hover:bg-muted/30 transition-all duration-300 text-base"
            >
              Explore Our Work
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12 flex items-center gap-8"
          >
            {[
              { value: "50+", label: "Projects" },
              { value: "5+", label: "Years" },
              { value: "30+", label: "Clients" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl md:text-2xl font-display font-bold text-accent">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: 3D Technology Ecosystem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="hidden lg:block"
        >
          <div className="relative">
            {/* Glow behind 3D */}
            <div className="absolute -inset-8 bg-gradient-to-br from-forest/10 to-accent/5 rounded-3xl blur-3xl" />
            <TechnologyEcosystem3D className="relative w-full aspect-square max-w-lg mx-auto" />
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
