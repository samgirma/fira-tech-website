import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock, Briefcase, Wifi } from "lucide-react";
import { site } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApply, setShowApply] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", coverLetter: "" });

  useEffect(() => {
    site.getJobs().then(setJobs).catch(() => {});
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplying(true);
    try {
      await site.submitApplication({
        jobId: selectedJob.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        coverLetter: form.coverLetter,
      });
      setApplied(true);
    } catch {
      alert("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <section className="relative min-h-[60vh] flex items-end pt-20 pb-12">
        <div className="container-fira px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest/20 border border-forest/30 text-sm text-forest-light mb-6">
              Careers
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Shape the <span className="text-gradient-gold">Future</span> With Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              We're building something special. Join a team that values innovation, community, and impact.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container-fira">
          {jobs.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">No Open Positions Right Now</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We're always looking for talented people. Send us your resume and we'll keep you in mind for future roles.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg transition-all">
                Get in Touch <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {jobs.map((job) => (
                  <motion.div key={job.id} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                    <button
                      onClick={() => { setSelectedJob(job); setShowApply(false); setApplied(false); }}
                      className={`w-full text-left glass-card p-6 group transition-all ${
                        selectedJob?.id === job.id ? "border-accent/50" : "hover:border-forest/30"
                      }`}
                    >
                      <h3 className="text-xl font-display font-bold text-foreground group-hover:text-accent transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {job.department && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.department}</span>}
                        {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>}
                        {job.type && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.type}</span>}
                        {job.remote && <span className="flex items-center gap-1 text-forest-light"><Wifi className="w-4 h-4" />Remote-friendly</span>}
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="lg:sticky lg:top-24 lg:self-start">
                {selectedJob ? (
                  <div className="glass-card p-6 space-y-6">
                    {!showApply && !applied ? (
                      <>
                        <h3 className="text-xl font-display font-bold text-foreground">{selectedJob.title}</h3>
                        {selectedJob.description && (
                          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedJob.description}</div>
                        )}
                        {selectedJob.experience && (
                          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Experience:</span> {selectedJob.experience}</p>
                        )}
                        <button
                          onClick={() => setShowApply(true)}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg transition-all"
                        >
                          Apply Now <ArrowRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : applied ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-forest/20 flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">✓</span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-foreground mb-2">Application Submitted!</h3>
                        <p className="text-sm text-muted-foreground">We'll review your application and get back to you soon.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleApply} className="space-y-4">
                        <h3 className="text-lg font-display font-bold text-foreground">Apply for {selectedJob.title}</h3>
                        <input
                          type="text"
                          placeholder="Full Name *"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                        <textarea
                          placeholder="Cover Letter"
                          rows={4}
                          value={form.coverLetter}
                          onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                        />
                        <button
                          type="submit"
                          disabled={applying}
                          className="w-full px-6 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {applying ? "Submitting..." : "Submit Application"}
                        </button>
                        <button type="button" onClick={() => setShowApply(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="glass-card p-6 text-center">
                    <p className="text-muted-foreground">Select a position to view details and apply.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
