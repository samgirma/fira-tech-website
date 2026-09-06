import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Send } from "lucide-react";
import { site } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const projectTypes = [
  "Custom Software Development",
  "Mobile App Development",
  "Web Application",
  "E-commerce Platform",
  "SaaS Product",
  "Cloud Infrastructure",
  "UI/UX Design",
  "Data Analytics / AI",
  "Legacy System Modernization",
  "Other",
];

const budgetRanges = [
  "Under $5,000",
  "$5,000 - $15,000",
  "$15,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000+",
  "Not sure yet",
];

const timelines = [
  "ASAP",
  "1-2 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
  "Flexible",
];

export default function StartProjectPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    projectType: "",
    description: "",
    timeline: "",
    budget: "",
    additionalInfo: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await site.submitProjectRequest(form);
      setSent(true);
    } catch {
      alert("Failed to submit request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-20 px-6">
        <motion.div {...fadeUp} className="glass-card p-12 text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-forest/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-forest-light" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">Request Received!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your interest in working with Fira Tech. We'll review your project details and get back to you within 24-48 hours.
          </p>
          <button
            onClick={() => { setSent(false); setStep(0); setForm({ name: "", email: "", phone: "", company: "", projectType: "", description: "", timeline: "", budget: "", additionalInfo: "" }); }}
            className="text-accent hover:text-accent/80 transition-colors text-sm font-medium"
          >
            Submit another request
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      <section className="relative min-h-[50vh] flex items-end pt-20 pb-12">
        <div className="container-fira px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest/20 border border-forest/30 text-sm text-forest-light mb-6">
              Start a Project
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Let's Build <span className="text-gradient-gold">Together</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Tell us about your project. We'll review your requirements and schedule a free consultation.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container-fira max-w-3xl">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-12">
            {["About You", "Your Project", "Details"].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i <= step ? "bg-accent text-obsidian" : "bg-muted/50 text-muted-foreground"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-accent" : "bg-muted/50"}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <motion.div {...fadeUp} className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-foreground">Tell Us About Yourself</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="your@email.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                    <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="Your company name" />
                  </div>
                </div>
                <button type="button" onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg transition-all">
                  Next: Your Project <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div {...fadeUp} className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-foreground">About Your Project</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Project Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {projectTypes.map((type) => (
                      <button key={type} type="button"
                        onClick={() => setForm({ ...form, projectType: type })}
                        className={`p-3 rounded-xl text-sm text-left transition-all border ${
                          form.projectType === type
                            ? "bg-accent/20 border-accent text-foreground"
                            : "bg-muted/20 border-border/50 text-muted-foreground hover:border-forest/30"
                        }`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Project Description *</label>
                  <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    placeholder="Describe what you want to build, the problem it solves, and any key requirements..." />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(0)}
                    className="px-6 py-3 border border-border/50 text-foreground font-medium rounded-full hover:bg-muted/30 transition-all">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg transition-all">
                    Next: Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div {...fadeUp} className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-foreground">Final Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Timeline</label>
                    <div className="space-y-2">
                      {timelines.map((t) => (
                        <button key={t} type="button"
                          onClick={() => setForm({ ...form, timeline: t })}
                          className={`w-full p-3 rounded-xl text-sm text-left transition-all border ${
                            form.timeline === t
                              ? "bg-accent/20 border-accent text-foreground"
                              : "bg-muted/20 border-border/50 text-muted-foreground hover:border-forest/30"
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Budget Range</label>
                    <div className="space-y-2">
                      {budgetRanges.map((b) => (
                        <button key={b} type="button"
                          onClick={() => setForm({ ...form, budget: b })}
                          className={`w-full p-3 rounded-xl text-sm text-left transition-all border ${
                            form.budget === b
                              ? "bg-accent/20 border-accent text-foreground"
                              : "bg-muted/20 border-border/50 text-muted-foreground hover:border-forest/30"
                          }`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Additional Information</label>
                  <textarea rows={3} value={form.additionalInfo} onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    placeholder="Any references, links, or other details..." />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)}
                    className="px-6 py-3 border border-border/50 text-foreground font-medium rounded-full hover:bg-muted/30 transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={sending}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg transition-all disabled:opacity-50">
                    {sending ? "Submitting..." : "Submit Request"}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
