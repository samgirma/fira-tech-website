import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const principles = [
  { title: "Purpose-driven", desc: "Every project starts with a real problem worth solving." },
  { title: "Practical engineering", desc: "We build things that work, not things that demo well." },
  { title: "Human-centered", desc: "Technology should adapt to people, never the other way around." },
  { title: "Long-term thinking", desc: "We build for where your business is going, not just where it is." },
  { title: "Local understanding", desc: "Rooted in Ethiopia, building for global standards." },
  { title: "Continuous improvement", desc: "Launch is the beginning, not the end." },
];

export function WhyFiraTech() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6" ref={ref}>
      <div className="container-fira grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Why Fira Tech</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Built on principles,<br />not promises
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-lg">
            We don't claim to be the biggest or the best. We focus on building technology that works — for the people who use it and the businesses that depend on it.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {principles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className="p-5 rounded-xl border border-border/30 hover:border-forest/20 transition-colors"
            >
              <h3 className="font-display font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
