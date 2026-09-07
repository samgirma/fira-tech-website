import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { site } from "@/lib/api";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navData, setNavData] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    site.getNavigation().then(setNavData).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const links = [
    { label: "Home", url: "/" },
    { label: "Work", url: "/work" },
    { label: "Services", url: "/services" },
    { label: "Insights", url: "/insights" },
    { label: "About", url: "/about" },
    { label: "Careers", url: "/careers" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-border/30"
          : "bg-transparent"
      }`}
    >
      <nav className="container-fira flex items-center justify-between h-[72px] px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-forest to-forest-light rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            <img src="/android-chrome-192x192.png" alt="Fira Tech" className="relative w-full h-full object-contain rounded-xl" />
          </div>
          <span className="text-lg font-display font-bold tracking-tight">
            <span className="text-foreground">Fira</span>
            <span className="text-accent ml-0.5">Tech</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.url}
              className={`px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === link.url || location.pathname.startsWith(link.url + "/")
                  ? "text-foreground bg-muted/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/contact"
            className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Let's Talk
          </Link>
          <Link
            to="/start-a-project"
            className="px-5 py-2.5 text-[13px] font-semibold bg-gradient-to-r from-accent to-amber-500 text-obsidian rounded-full hover:shadow-md hover:shadow-accent/15 transition-all duration-300"
          >
            Start a Project
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-foreground p-2 -mr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border/30"
          >
            <div className="px-6 py-6 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.url}
                  className={`block py-3 text-base font-medium transition-colors ${
                    location.pathname === link.url
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-5 mt-5 border-t border-border/30 space-y-3">
                <Link
                  to="/contact"
                  className="block text-center py-3 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Let's Talk
                </Link>
                <Link
                  to="/start-a-project"
                  className="block text-center py-3.5 bg-gradient-to-r from-accent to-amber-500 text-obsidian font-semibold rounded-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start a Project
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
