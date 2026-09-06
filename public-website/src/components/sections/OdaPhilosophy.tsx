import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { OdaTreeVisual } from "@/components/tree/OdaTreeVisual";

export function OdaPhilosophy() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="relative py-24 md:py-36 px-6 overflow-hidden" ref={ref}>
      {/* Background tree atmosphere */}
      <OdaTreeVisual className="absolute inset-0 pointer-events-none" withTechOverlay={false} parallax />

      <div className="container-fira relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Our Philosophy</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              Built on connection
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              An Oda tree is where communities gather — to share knowledge, make decisions, and grow together. It represents roots, belonging, and collective progress.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              At Fira Tech, we believe technology should work the same way. It should connect people, businesses, and ideas — not isolate them. Every solution we build is rooted in understanding and designed for community impact.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card p-8 md:p-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-forest/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-lg">🌳</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-1">Roots</h4>
                    <p className="text-sm text-muted-foreground">Grounded in Ethiopian values and community understanding.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-forest/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-lg">🤝</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-1">Community</h4>
                    <p className="text-sm text-muted-foreground">Technology that brings people together, not apart.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-forest/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-lg">🌱</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-1">Growth</h4>
                    <p className="text-sm text-muted-foreground">Building solutions that scale with the people and businesses they serve.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
