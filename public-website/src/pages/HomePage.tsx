import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { site } from "@/lib/api";
import { Hero } from "@/components/Hero";
import { Capabilities } from "@/components/sections/Capabilities";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { Process } from "@/components/sections/Process";
import { WhyFiraTech } from "@/components/sections/WhyFiraTech";
import { OdaPhilosophy } from "@/components/sections/OdaPhilosophy";
import { TechCapabilities } from "@/components/sections/TechCapabilities";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    site.getHome().then(setData).catch(() => {});
  }, []);

  const services = data?.services || [];
  const projects = data?.featuredProjects || [];
  const testimonials = data?.testimonials || [];
  const blogPosts = data?.blogPosts || [];
  const openJobs = data?.openJobs || [];
  const caseStudyProject = projects.length > 1 ? projects[1] : projects[0];

  return (
    <>
      {/* 01 — Hero */}
      <Hero />

      {/* 02 — What Fira Tech Is */}
      <WhatWeDo />

      {/* 03 — What We Build (Capabilities) */}
      <Capabilities />

      {/* 04 — Services */}
      {services.length > 0 && <ServicesPreview services={services} />}

      {/* 05 — Selected Work */}
      {projects.length > 0 && <SelectedWork projects={projects} />}

      {/* 06 — Case Study */}
      {caseStudyProject && <CaseStudy project={caseStudyProject} />}

      {/* 07 — Technology */}
      <TechCapabilities />

      {/* 09 — How We Work */}
      <Process />

      {/* 10 — Why Fira Tech */}
      <WhyFiraTech />

      {/* 11 — Oda Philosophy */}
      <OdaPhilosophy />

      {/* 12 — Testimonials */}
      {testimonials.length > 0 && <Testimonials testimonials={testimonials} idx={testimonialIdx} setIdx={setTestimonialIdx} />}

      {/* 13 — Insights */}
      {blogPosts.length > 0 && <InsightsPreview posts={blogPosts} />}

      {/* 14 — Careers */}
      {openJobs.length > 0 && <CareersPreview jobs={openJobs} />}

      {/* 15 — Final CTA */}
      <FinalCTA />
    </>
  );
}

/* ── Sub-sections ── */

function WhatWeDo() {
  const { ref, isVisible } = useScrollReveal();
  const capabilities = [
    { label: "Digital Products", desc: "From concept to launch — products designed for real users." },
    { label: "Custom Software", desc: "Systems built around your workflow, not the other way around." },
    { label: "Web Platforms", desc: "Fast, accessible web applications that scale." },
    { label: "Mobile Experiences", desc: "Native-quality apps for iOS and Android." },
    { label: "Cloud Infrastructure", desc: "Secure, scalable architecture you can depend on." },
    { label: "Automation", desc: "Intelligent systems that save time and reduce errors." },
  ];

  return (
    <section className="py-24 md:py-36 px-6" ref={ref}>
      <div className="container-fira grid lg:grid-cols-2 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Technology with Purpose</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            We solve problems that matter.
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-lg">
            Fira Tech designs and builds digital solutions for businesses, communities, and organizations that need technology to work — not just look good. Based in Ethiopia, serving globally.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
              className="p-4 rounded-xl border border-border/30 hover:border-forest/20 transition-colors"
            >
              <h3 className="font-semibold text-foreground text-sm mb-1">{cap.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesPreview({ services }: { services: any[] }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6 bg-muted/15" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4"
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Services</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              What we do
            </h2>
          </div>
          <Link to="/services" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-medium">
            All services <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="space-y-4">
          {services.slice(0, 5).map((service: any, i: number) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            >
              <Link
                to={`/services/${service.slug}`}
                className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-forest/30 transition-all"
              >
                <span className="text-4xl font-display font-bold text-forest/15 select-none shrink-0 w-12">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-display font-bold text-foreground group-hover:text-accent transition-colors mb-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.short_description}</p>
                </div>
                <span className="text-sm font-medium text-accent shrink-0 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelectedWork({ projects }: { projects: any[] }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4"
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Selected Work</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Proof, not promises
            </h2>
          </div>
          <Link to="/work" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-medium">
            View all projects <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Asymmetric layout: large + two smaller */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Large featured project */}
          {projects[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Link to={`/work/${projects[0].slug}`} className="glass-card overflow-hidden group block h-full">
                {projects[0].images?.[0] && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={projects[0].images[0]} alt={projects[0].title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                  </div>
                )}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 text-xs font-medium bg-forest/20 text-forest-light rounded-full">{projects[0].category}</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2 group-hover:text-accent transition-colors">{projects[0].title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{projects[0].short_description}</p>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Two smaller projects */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {projects.slice(1, 3).map((project: any, i: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <Link to={`/work/${project.slug}`} className="glass-card overflow-hidden group block h-full">
                  {project.images?.[0] && (
                    <div className="aspect-video overflow-hidden">
                      <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="px-3 py-1 text-xs font-medium bg-forest/20 text-forest-light rounded-full">{project.category}</span>
                    <h3 className="text-lg font-display font-bold text-foreground mt-3 mb-1 group-hover:text-accent transition-colors">{project.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{project.short_description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials({ testimonials, idx, setIdx }: { testimonials: any[]; idx: number; setIdx: (i: number) => void }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            What people say
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-card p-8 md:p-12 text-center relative"
          >
            {testimonials[idx]?.rating && (
              <div className="flex items-center justify-center gap-1 mb-6">
                {Array.from({ length: testimonials[idx].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
            )}

            <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
              "{testimonials[idx]?.content}"
            </blockquote>

            <div>
              <p className="font-display font-bold text-foreground">{testimonials[idx]?.customer_name}</p>
              <p className="text-sm text-muted-foreground">
                {[testimonials[idx]?.position, testimonials[idx]?.company].filter(Boolean).join(", ")}
              </p>
            </div>
          </motion.div>

          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "bg-accent w-6" : "bg-muted-foreground/20 w-1.5"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setIdx((prev) => (prev + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InsightsPreview({ posts }: { posts: any[] }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6 bg-muted/15" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4"
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Insights</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Latest thinking
            </h2>
          </div>
          <Link to="/insights" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-medium">
            All articles <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post: any, i: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            >
              <Link to={`/insights/${post.slug}`} className="glass-card overflow-hidden group block h-full">
                {post.cover_image && (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                  </div>
                )}
                <div className="p-6">
                  {post.category && (
                    <span className="px-3 py-1 text-xs font-medium bg-forest/20 text-forest-light rounded-full">{post.category}</span>
                  )}
                  <h3 className="text-lg font-display font-bold text-foreground mt-3 mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CareersPreview({ jobs }: { jobs: any[] }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4 block">Careers</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Join the team
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We're building something meaningful. If you care about technology that serves people, let's talk.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4 mb-10">
          {jobs.slice(0, 3).map((job: any, i: number) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 16 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            >
              <Link
                to={`/careers#${job.id}`}
                className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-forest/30 transition-all"
              >
                <div>
                  <h3 className="font-display font-bold text-foreground group-hover:text-accent transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {job.department && <span>{job.department}</span>}
                    {job.location && <span>· {job.location}</span>}
                    {job.type && <span>· {job.type}</span>}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link to="/careers" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-medium">
            Explore opportunities <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 md:py-36 px-6" ref={ref}>
      <div className="container-fira">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-forest-dark to-obsidian p-12 md:p-20 text-center"
        >
          <div className="absolute inset-0 oromo-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              Have a problem worth solving?
            </h2>
            <p className="text-lg text-foreground/70 max-w-xl mx-auto mb-10">
              Tell us what you're trying to build. We'll take it from there.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/start-a-project"
                className="inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all text-lg"
              >
                Start a Project <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2.5 px-10 py-4 border border-foreground/20 text-foreground font-medium rounded-full hover:bg-foreground/5 transition-all text-lg"
              >
                Let's Talk
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
