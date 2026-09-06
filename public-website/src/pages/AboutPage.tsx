import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Target, Heart, Lightbulb, Users, Globe } from "lucide-react";
import { site } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function AboutPage() {
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    site.getCompany().then(setCompany).catch(() => {});
  }, []);

  return (
    <>
      <section className="relative min-h-[60vh] flex items-center pt-20">
        <div className="container-fira px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest/20 border border-forest/30 text-sm text-forest-light mb-6">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Built on <span className="text-gradient-gold">Heritage</span>,<br />
              Driven by <span className="text-gradient-gold">Innovation</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8">
              Fira Tech Solutions bridges traditional business with modern technology, creating digital solutions that honor community values while driving growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/start-a-project"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all"
              >
                Work With Us <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border/50 text-foreground font-medium rounded-full hover:bg-muted/30 transition-all"
              >
                Our Services
              </Link>
            </div>
          </motion.div>

          {company?.founder?.name && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="glass-card p-8">
                {company.founder.photo && (
                  <img src={company.founder.photo} alt={company.founder.name} className="w-24 h-24 rounded-full object-cover mb-6" />
                )}
                <blockquote className="text-lg text-foreground leading-relaxed mb-4 italic">
                  "We believe technology should serve communities, not the other way around."
                </blockquote>
                <div>
                  <p className="font-display font-bold text-foreground">{company.founder.name}</p>
                  <p className="text-sm text-muted-foreground">{company.founder.role}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container-fira">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Target, title: "Mission-Driven", desc: "Every line of code serves a purpose — empowering businesses and communities." },
              { icon: Heart, title: "Community First", desc: "We build for the people who use our solutions, not just the clients who commission them." },
              { icon: Lightbulb, title: "Innovation", desc: "We bring world-class technology practices to solve local and global challenges." },
              { icon: Users, title: "Collaboration", desc: "We work as partners, not vendors. Your success is our success." },
            ].map((value) => (
              <motion.div key={value.title} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <div className="glass-card p-8 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-forest/20 flex items-center justify-center mb-6">
                    <value.icon className="w-7 h-7 text-forest-light" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/20">
        <div className="container-fira">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Our Story</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              { year: "Founding", title: "The Beginning", desc: "Founded with the vision of bridging the gap between traditional Ethiopian businesses and modern technology." },
              { year: "Growth", title: "Building the Team", desc: "Grew from a small founding team to a diverse group of engineers, designers, and strategists." },
              { year: "Impact", title: "Serving Communities", desc: "Delivered solutions across agriculture, education, retail, and enterprise — transforming how businesses operate." },
              { year: "Future", title: "Looking Ahead", desc: "Expanding our reach across Africa and building products that scale globally." },
            ].map((milestone, i) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card p-8"
              >
                <span className="text-sm font-medium text-accent">{milestone.year}</span>
                <h3 className="text-xl font-display font-bold text-foreground mt-2 mb-3">{milestone.title}</h3>
                <p className="text-muted-foreground">{milestone.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container-fira">
          <div className="glass-card p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Join Us on the Journey
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Whether you're looking for a technology partner or want to join our team, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all"
              >
                Contact Us <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/careers"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border/50 text-foreground font-medium rounded-full hover:bg-muted/30 transition-all"
              >
                View Careers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
