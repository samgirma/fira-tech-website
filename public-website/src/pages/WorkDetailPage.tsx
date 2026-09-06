import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { site } from "@/lib/api";

export default function WorkDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    site.getProject(slug)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <h1 className="text-2xl font-display font-bold">Project not found</h1>
        <Link to="/work" className="text-accent hover:underline">Back to Work</Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative pt-20 pb-12">
        <div className="container-fira px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/work" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> All Projects
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-xs font-medium bg-forest/20 text-forest-light rounded-full">{project.category}</span>
              {project.client_name && (
                <span className="text-sm text-muted-foreground">Client: {project.client_name}</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">{project.title}</h1>
            {project.short_description && (
              <p className="text-lg text-muted-foreground max-w-3xl">{project.short_description}</p>
            )}
          </motion.div>
        </div>
      </section>

      {project.images?.length > 0 && (
        <section className="py-8 px-6">
          <div className="container-fira">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {project.images.map((img: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl overflow-hidden"
                >
                  <img src={img} alt={`${project.title} ${i + 1}`} className="w-full aspect-video object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-6">
        <div className="container-fira grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {project.problem && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">The Challenge</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.problem}</p>
              </motion.div>
            )}

            {project.solution && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">Our Solution</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.solution}</p>
              </motion.div>
            )}

            {project.results && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">Results</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.results}</p>
              </motion.div>
            )}

            {project.full_description && !project.problem && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">About This Project</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.full_description}</p>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 sticky top-24">
              <h3 className="font-display font-bold text-foreground mb-4">Project Details</h3>
              <dl className="space-y-3 text-sm">
                {project.client_name && (
                  <div>
                    <dt className="text-muted-foreground">Client</dt>
                    <dd className="text-foreground font-medium">{project.client_name}</dd>
                  </div>
                )}
                {project.category && (
                  <div>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="text-foreground font-medium">{project.category}</dd>
                  </div>
                )}
                {project.completion_date && (
                  <div>
                    <dt className="text-muted-foreground">Completed</dt>
                    <dd className="text-foreground font-medium">
                      {new Date(project.completion_date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                    </dd>
                  </div>
                )}
              </dl>

              {project.technologies?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t: string) => (
                      <span key={t} className="px-3 py-1.5 text-sm bg-muted/50 text-muted-foreground rounded-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg transition-all text-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> Demo
                  </a>
                )}
                {project.repository_url && (
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-border/50 text-foreground font-medium rounded-full hover:bg-muted/30 transition-all text-sm"
                  >
                    <Github className="w-4 h-4" /> Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container-fira">
          <div className="glass-card p-12 text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Like What You See?</h2>
            <p className="text-muted-foreground mb-6">Let's discuss how we can build something similar for your business.</p>
            <Link
              to="/start-a-project"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all"
            >
              Start a Project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
