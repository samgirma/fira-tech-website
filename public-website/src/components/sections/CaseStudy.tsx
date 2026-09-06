import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CaseStudyProps {
  project?: any;
}

export function CaseStudy({ project }: CaseStudyProps) {
  const { ref, isVisible } = useScrollReveal();

  if (!project) return null;

  return (
    <section className="py-24 md:py-36 px-6" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Featured Case Study</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {project.images?.[0] && (
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-medium bg-forest/20 text-forest-light rounded-full">{project.category}</span>
              {project.client_name && <span className="text-sm text-muted-foreground">{project.client_name}</span>}
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground">{project.title}</h3>

            {project.problem && (
              <div>
                <h4 className="text-xs font-semibold tracking-wide uppercase text-accent mb-2">The Challenge</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.problem}</p>
              </div>
            )}

            {project.solution && (
              <div>
                <h4 className="text-xs font-semibold tracking-wide uppercase text-accent mb-2">The Approach</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.solution}</p>
              </div>
            )}

            {project.results && (
              <div>
                <h4 className="text-xs font-semibold tracking-wide uppercase text-accent mb-2">The Result</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.results}</p>
              </div>
            )}

            {project.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t: string) => (
                  <span key={t} className="px-3 py-1.5 text-xs bg-muted/50 text-muted-foreground rounded-lg">{t}</span>
                ))}
              </div>
            )}

            <Link
              to={`/work/${project.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Read full case study <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
