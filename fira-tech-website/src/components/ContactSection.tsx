import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Send, Phone, MessageCircle, Globe, Github, Linkedin, Twitter, Youtube, Facebook, Instagram, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, any> = {
  Github, Linkedin, MessageCircle, Globe, Twitter, Youtube, Facebook, Instagram, Send,
}

interface SocialLink {
  platform: string
  url: string
  icon: string
  label: string
}

interface ContactEntry {
  label: string
  value: string
}

const platformConfig: Record<string, { icon: any; color: string; bg: string; getHref: (v: string) => string; desc: string }> = {
  telegram: { icon: Send, color: "text-sky-400", bg: "bg-sky-400/10", getHref: v => v, desc: "Quick reply via Telegram" },
  whatsapp: { icon: Phone, color: "text-green-400", bg: "bg-green-400/10", getHref: v => v, desc: "Chat on WhatsApp" },
  phone:    { icon: Phone, color: "text-emerald-400", bg: "bg-emerald-400/10", getHref: v => `tel:${v}`, desc: "Call us directly" },
  email:    { icon: Mail, color: "text-forest", bg: "bg-forest/20", getHref: v => `mailto:${v}`, desc: "Send us an email" },
}

const platformLabels: Record<string, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  phone: 'Phone',
  email: 'Email',
}

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactOptions, setContactOptions] = useState<{ icon: any; label: string; desc: string; href: string; color: string; bg: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  useEffect(() => {
    fetch('/api/social-links')
      .then(res => res.json())
      .then(setSocialLinks)
      .catch(() => {})
    fetch('/api/settings')
      .then(res => res.json())
      .then(s => {
        let entries: ContactEntry[] = []
        try {
          if (s.contact_channels) entries = JSON.parse(s.contact_channels)
        } catch {}

        if (entries.length === 0) {
          entries = []
          if (s.contact_telegram) entries.push({ label: 'telegram', value: s.contact_telegram })
          if (s.contact_whatsapp) entries.push({ label: 'whatsapp', value: s.contact_whatsapp })
          if (s.contact_phone) entries.push({ label: 'phone', value: s.contact_phone })
          if (s.contact_email) entries.push({ label: 'email', value: s.contact_email })
        }

        const grouped: Record<string, ContactEntry[]> = {}
        for (const e of entries) {
          if (!grouped[e.label]) grouped[e.label] = []
          grouped[e.label].push(e)
        }

        const options: any[] = []
        for (const [platform, list] of Object.entries(grouped)) {
          const cfg = platformConfig[platform]
          if (!cfg) continue
          for (const entry of list) {
            options.push({
              icon: cfg.icon,
              label: platformLabels[platform] || platform,
              desc: entry.value,
              href: cfg.getHref(entry.value),
              color: cfg.color,
              bg: cfg.bg,
            })
          }
        }
        setContactOptions(options)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to send')
      toast({ title: "Message Sent!", description: "We'll get back to you soon." })
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast({ title: "Something went wrong", description: "Try again or use one of the options above." })
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="section-padding relative bg-secondary/30">
      <div className="absolute inset-0 oromo-pattern opacity-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />

      <div ref={ref} className="container-fira relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent text-sm font-semibold tracking-wider uppercase">Get in Touch</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-6">
              Join the <span className="text-gradient-gold">Family</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Ready to start your digital transformation journey? We'd love to hear from you.
              Let's build something meaningful together.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email Us</div>
                  <span className="text-foreground">{contactOptions.find(o => o.label === 'Email')?.desc || 'admin@firatech.systems'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Visit Us</div>
                  <span className="text-foreground">Adama, Ethiopia</span>
                </div>
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-8">
                <div className="text-sm text-muted-foreground mb-4">Follow Us</div>
                <div className="flex items-center gap-3">
                  {socialLinks.map((link) => {
                    const Icon = iconMap[link.icon]
                    return (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-xl bg-forest/20 flex items-center justify-center text-forest hover:bg-forest hover:text-foreground transition-all duration-300"
                        aria-label={link.label}
                      >
                        {Icon ? <Icon className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 p-6 glass-card">
              <p className="text-lg font-display italic text-center text-muted-foreground">
                "Empowering communities through digital transformation."
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Reach us via</span>

            {contactOptions.map((opt, i) => (
              <a
                key={`${opt.label}-${i}`}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${opt.bg} flex items-center justify-center`}>
                  <opt.icon className={`w-6 h-6 ${opt.color}`} />
                </div>
                <div className="flex-1">
                  <div className="text-foreground font-semibold group-hover:text-accent transition-colors">{opt.label}</div>
                  <div className="text-sm text-muted-foreground truncate">{opt.desc}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
              </a>
            ))}

            <div className="glass-card p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-forest/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-forest" />
                </div>
                <div>
                  <div className="text-foreground font-semibold">Direct Message</div>
                  <div className="text-sm text-muted-foreground">Send to admin dashboard</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                    className="bg-background/50 border-border/50 focus:border-forest"
                  />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    className="bg-background/50 border-border/50 focus:border-forest"
                  />
                </div>
                <Input
                  placeholder="Subject"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  required
                  className="bg-background/50 border-border/50 focus:border-forest"
                />
                <Textarea
                  placeholder="Tell us about your project..."
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  required
                  className="bg-background/50 border-border/50 focus:border-forest resize-none"
                />
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
