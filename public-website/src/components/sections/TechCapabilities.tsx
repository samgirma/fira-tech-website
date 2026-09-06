import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const techByArea = [
  {
    area: "Frontend",
    tools: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vue.js"],
  },
  {
    area: "Backend",
    tools: ["Node.js", "Python", "Express", "PostgreSQL", "REST APIs"],
  },
  {
    area: "Mobile",
    tools: ["React Native", "Flutter", "iOS", "Android"],
  },
  {
    area: "Cloud",
    tools: ["AWS", "Docker", "Supabase", "CI/CD", "Linux"],
  },
  {
    area: "Data & AI",
    tools: ["PostgreSQL", "Python", "OpenAI", "Analytics", "ETL"],
  },
];

export function TechCapabilities() {
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
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Technology</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            Tools we trust
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {techByArea.map((group, i) => (
            <motion.div
              key={group.area}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-accent mb-4 tracking-wide uppercase">{group.area}</h3>
              <div className="flex flex-wrap gap-2">
                {group.tools.map((tool) => (
                  <span key={tool} className="px-3 py-1.5 text-xs bg-muted/50 text-muted-foreground rounded-lg">
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
