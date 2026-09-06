import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, MessageCircle, Globe, Twitter, Youtube, Facebook, Instagram, Heart } from "lucide-react";
import { site } from "@/lib/api";

const iconMap: Record<string, any> = {
  Github, Linkedin, MessageCircle, Globe, Twitter, Youtube, Facebook, Instagram,
};

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  label: string;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    site.getCompany().then((comp) => {
      setCompany(comp);
      setSocialLinks(comp.socialLinks || []);
    }).catch(() => {});
  }, []);

  return (
    <footer className="relative border-t border-border/30">
      <div className="absolute inset-0 oromo-pattern opacity-[0.03]" />

      <div className="container-fira relative px-6 pt-20 pb-12">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-forest to-forest-light rounded-xl opacity-80" />
                <span className="relative text-lg font-bold font-display text-foreground">F</span>
              </div>
              <span className="text-lg font-display font-bold tracking-tight">
                <span className="text-foreground">Fira</span>
                <span className="text-accent ml-0.5">Tech Solutions</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
              {company?.description || "Designing and building digital products, software platforms, and technology solutions. Based in Ethiopia, serving communities globally."}
            </p>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = iconMap[social.icon];
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground hover:bg-forest hover:text-foreground transition-all duration-300"
                      aria-label={social.label}
                    >
                      {Icon ? <Icon className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-5">Navigate</h4>
            <ul className="space-y-3">
              {[
                { label: "About", url: "/about" },
                { label: "Services", url: "/services" },
                { label: "Work", url: "/work" },
                { label: "Insights", url: "/insights" },
                { label: "Careers", url: "/careers" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.url} className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Fine divider */}
        <div className="fine-divider mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {company?.name || "Fira Tech Solutions"}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 text-accent fill-accent" /> in Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
