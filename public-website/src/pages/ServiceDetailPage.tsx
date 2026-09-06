import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { site } from "@/lib/api";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    site.getService(slug)
      .then(setService)
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <h1 className="text-2xl font-display font-bold">Service not found</h1>
        <Link to="/services" className="text-accent hover:underline">Back to Services</Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative min-h-[50vh] flex items-end pt-20 pb-12">
        <div className="container-fira px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> All Services
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              {service.title}
            </h1>
            {service.short_description && (
              <p className="text-lg text-muted-foreground max-w-2xl">{service.short_description}</p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container-fira grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {service.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="prose prose-invert max-w-none"
              >
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{service.description}</div>
              </motion.div>
            )}

            {service.features?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">What We Deliver</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {service.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/20">
                      <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {service.deliverables?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">Deliverables</h2>
                <ul className="space-y-3">
                  {service.deliverables.map((d: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-foreground">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {service.process?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">Our Process</h2>
                <div className="space-y-6">
                  {service.process.map((step: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-forest/20 flex items-center justify-center shrink-0 text-sm font-bold text-forest-light">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{step.title || step.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{step.description || step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {service.faq?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">FAQ</h2>
                <div className="space-y-4">
                  {service.faq.map((item: any, i: number) => (
                    <div key={i} className="glass-card p-6">
                      <h3 className="font-semibold text-foreground mb-2">{item.question || item.q}</h3>
                      <p className="text-sm text-muted-foreground">{item.answer || item.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 sticky top-24">
              <h3 className="font-display font-bold text-foreground mb-4">Technologies</h3>
              {service.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.technologies.map((t: string) => (
                    <span key={t} className="px-3 py-1.5 text-sm bg-muted/50 text-muted-foreground rounded-lg">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <Link
                to="/start-a-project"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all"
              >
                Start a Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
