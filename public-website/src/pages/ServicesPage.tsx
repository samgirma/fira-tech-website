import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Globe, Shield, Users, Code, Server, Smartphone } from "lucide-react";
import { site } from "@/lib/api";

const iconMap: Record<string, any> = {
  code: Code,
  globe: Globe,
  shield: Shield,
  users: Users,
  zap: Zap,
  server: Server,
  smartphone: Smartphone,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    site.getServices().then(setServices).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-20">
        <div className="container-fira px-6 py-20">
          <motion.div {...fadeUp} className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest/20 border border-forest/30 text-sm text-forest-light mb-6">
              Our Services
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Technology Solutions{" "}
              <span className="text-gradient-gold">Built for Impact</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              From custom software development to cloud infrastructure, we deliver end-to-end technology solutions that transform businesses and communities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6">
        <div className="container-fira">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => {
              const Icon = iconMap[service.icon] || Zap;
              return (
                <motion.div
                  key={service.id}
                  variants={fadeUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/services/${service.slug}`}
                    className="glass-card p-8 block group hover:border-forest/30 transition-all h-full"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-forest/20 flex items-center justify-center mb-6 group-hover:bg-forest/30 transition-colors">
                      <Icon className="w-8 h-8 text-forest-light" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                      {service.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {service.short_description}
                    </p>
                    {service.features?.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {service.features.slice(0, 4).map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    {service.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {service.technologies.map((t: string) => (
                          <span key={t} className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium text-accent group-hover:text-accent/80 transition-colors">
                      Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container-fira">
          <div className="glass-card p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Not Sure What You Need?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Schedule a free consultation. We'll help you identify the right solution for your challenges.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all text-lg"
            >
              Get in Touch <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
