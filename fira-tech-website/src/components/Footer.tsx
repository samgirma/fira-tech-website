import { useEffect, useState } from "react";
import { Github, Linkedin, MessageCircle, Globe, Twitter, Youtube, Facebook, Instagram, Heart, Send } from "lucide-react";

const iconMap: Record<string, any> = {
  Github, Linkedin, MessageCircle, Globe, Twitter, Youtube, Facebook, Instagram, Send,
}

interface SocialLink {
  platform: string
  url: string
  icon: string
  label: string
}

const footerLinks = {
  company: [
    { name: "About Us", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Community", href: "#community" },
    { name: "Careers", href: "/careers" },
  ],
  products: [
    { name: "Fira Retail", href: "#" },
    { name: "Agri-Tech", href: "#" },
    { name: "Ed-Tech", href: "#" },
    { name: "Custom Solutions", href: "#" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch('/api/social-links')
      .then(res => res.json())
      .then(setSocialLinks)
      .catch(() => {})
  }, [])

  return (
    <footer className="relative bg-secondary/50 border-t border-border/50">
      <div className="absolute inset-0 oromo-pattern opacity-5" />

      <div className="container-fira relative px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-forest to-forest-light rounded-lg opacity-80" />
                <span className="relative text-xl font-bold font-display text-foreground">F</span>
              </div>
              <span className="text-xl font-display font-bold">
                <span className="text-foreground">Fira</span>
                <span className="text-accent ml-1">Tech Solutions</span>
              </span>
            </div>

            <p className="text-muted-foreground max-w-md mb-6">
              Building high-impact digital solutions that bridge traditional business with modern technology.
              Based in Adama, Ethiopia — serving communities globally.
            </p>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = iconMap[social.icon]
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-forest hover:text-foreground transition-all duration-300"
                      aria-label={social.label}
                    >
                      {Icon ? <Icon className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Fira Tech Solutions. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-accent fill-accent" /> in Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
