import { Github, Linkedin, Send, Heart } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/Fira-Tech-Solutions", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/fira-tech-solutions/", label: "LinkedIn" },
  { icon: Send, href: "https://t.me/fira_tech_solution", label: "Telegram" },
];

const footerLinks = {
  company: [
    { name: "About Us", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Community", href: "#community" },
    { name: "Careers", href: "#" },
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

  return (
    <footer className="relative bg-secondary/50 border-t border-border/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 oromo-pattern opacity-5" />

      <div className="container-fira relative px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
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

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-forest hover:text-foreground transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
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

          {/* Products Links */}
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

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Fira Tech Solutions. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-accent fill-accent" /> in Ethiopia 🇪🇹
          </p>
        </div>
      </div>
    </footer>
  );
}
