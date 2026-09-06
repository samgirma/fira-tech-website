import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { num: "01", title: "Understand", desc: "We listen deeply. Your business, your users, your constraints — before writing a single line of code." },
  { num: "02", title: "Plan", desc: "Architecture, timelines, and milestones mapped out. No surprises." },
  { num: "03", title: "Design", desc: "Interfaces crafted around human behavior, not generic templates." },
  { num: "04", title: "Build", desc: "Iterative development with working software at every stage." },
  { num: "05", title: "Launch", desc: "Deployed, tested, and ready for real users from day one." },
  { num: "06", title: "Improve", desc: "Data-driven refinement. We stay partners after launch." },
];

export function Process() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6 bg-muted/15" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">How We Work</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            From idea to impact
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="relative p-6"
            >
              <span className="text-5xl font-display font-bold text-forest/15 absolute top-0 right-0 select-none">
                {step.num}
              </span>
              <div className="relative pt-8">
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
