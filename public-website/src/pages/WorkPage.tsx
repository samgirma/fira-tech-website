import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Filter } from "lucide-react";
import { site } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function WorkPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    site.getProjects().then(setProjects).catch(() => {});
  }, []);

  const categories = ["all", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  const filtered = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <>
      <section className="relative min-h-[60vh] flex items-end pt-20 pb-12">
        <div className="container-fira px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest/20 border border-forest/30 text-sm text-forest-light mb-6">
              Our Work
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Projects That <span className="text-gradient-gold">Deliver Results</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Real solutions built for real businesses. See how we've helped organizations transform through technology.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container-fira">
          {categories.length > 1 && (
            <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-accent text-obsidian"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? "All Projects" : cat}
                </button>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                variants={fadeUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Link
                  to={`/work/${project.slug}`}
                  className="glass-card overflow-hidden group block h-full"
                >
                  {project.images?.[0] && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs font-medium bg-forest/20 text-forest-light rounded-full">
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="px-3 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    {project.client_name && (
                      <p className="text-sm text-muted-foreground mb-2">Client: {project.client_name}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.short_description}</p>
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 4).map((tech: string) => (
                          <span key={tech} className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container-fira">
          <div className="glass-card p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Have a Project in Mind?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              We'd love to hear about your vision. Let's explore how we can bring it to life.
            </p>
            <Link
              to="/start-a-project"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all text-lg"
            >
              Start a Project <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
