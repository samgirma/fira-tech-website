import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Github, Linkedin, Globe, MessageCircle, Twitter, Youtube, Facebook, Instagram } from "lucide-react";
import { site } from "@/lib/api";

const iconMap: Record<string, any> = {
  Github, Linkedin, MessageCircle, Globe, Twitter, Youtube, Facebook, Instagram,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function ContactPage() {
  const [company, setCompany] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    site.getCompany().then(setCompany).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await site.submitContact(form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="relative min-h-[60vh] flex items-end pt-20 pb-12">
        <div className="container-fira px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest/20 border border-forest/30 text-sm text-forest-light mb-6">
              Contact
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Let's <span className="text-gradient-gold">Talk</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Have a question, project idea, or just want to connect? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container-fira grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <motion.div {...fadeUp}>
              {sent ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-forest/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">Message Sent!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <button onClick={() => setSent(false)} className="mt-6 text-accent hover:text-accent/80 transition-colors text-sm font-medium">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                  <h2 className="text-2xl font-display font-bold text-foreground">Send a Message</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                      placeholder="Tell us about your project or question..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Message"}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div {...fadeUp} className="glass-card p-6 space-y-6">
              <h3 className="text-xl font-display font-bold text-foreground">Get in Touch</h3>
              {company?.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-5 h-5 text-accent" /> {company.email}
                </a>
              )}
              {company?.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-5 h-5 text-accent" /> {company.phone}
                </a>
              )}
              {company?.location && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-accent" /> {company.location}
                </div>
              )}
            </motion.div>

            {company?.socialLinks?.length > 0 && (
              <motion.div {...fadeUp} className="glass-card p-6">
                <h3 className="text-xl font-display font-bold text-foreground mb-4">Follow Us</h3>
                <div className="flex items-center gap-3">
                  {company.socialLinks.map((social: any) => {
                    const Icon = iconMap[social.icon] || Globe;
                    return (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-forest hover:text-foreground transition-all"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <motion.div {...fadeUp} className="glass-card p-6">
              <h3 className="text-xl font-display font-bold text-foreground mb-4">Office Hours</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Monday - Friday: 9:00 AM - 6:00 PM (EAT)</p>
                <p>Saturday: 10:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
