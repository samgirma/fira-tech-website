import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Users, Briefcase, Star, X, MapPin, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-oda-tree.jpg";

interface StatItem {
  id: string
  name: string
  description: string
  logo?: string
  location?: string
  website?: string
  preview?: string
  link?: string
}

interface StatCategory {
  id: string
  key: string
  label: string
  icon: string
  items: StatItem[]
  dynamicItems?: { id: string; partner_name: string; rating: number; feedback: string }[]
  dynamicValue?: number
  dynamicLabel?: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  Users, Briefcase, Star,
}

function PartnerCard({ item }: { item: StatItem }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-forest/5 border border-forest/10">
      {item.logo && (
        <img
          src={item.logo}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-background"
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-foreground font-semibold">{item.name}</h4>
        {item.description && (
          <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-2">
          {item.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {item.location}
            </span>
          )}
          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <Globe className="w-3 h-3" />
              Website
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ item }: { item: StatItem }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-forest/5 border border-forest/10">
      {item.preview && (
        <img
          src={item.preview}
          alt={item.name}
          className="w-24 h-16 rounded-lg object-cover flex-shrink-0 bg-background"
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-foreground font-semibold">{item.name}</h4>
        {item.description && (
          <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
        )}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors mt-2"
          >
            <ExternalLink className="w-3 h-3" />
            View Project
          </a>
        )}
      </div>
    </div>
  )
}

function TestimonialCard({ item }: { item: StatItem }) {
  return (
    <div className="p-4 rounded-xl bg-forest/5 border border-forest/10">
      <p className="text-muted-foreground text-sm italic leading-relaxed">
        "{item.description}"
      </p>
      <p className="text-foreground font-medium text-sm mt-3">— {item.name}</p>
    </div>
  )
}

export function HeroSection() {
  const [categories, setCategories] = useState<StatCategory[]>([])
  const [selected, setSelected] = useState<StatCategory | null>(null)

  useEffect(() => {
    fetch('/api/site-stats')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const StatIcon = ({ icon }: { icon: string }) => {
    const Icon = ICON_MAP[icon]
    return Icon ? <Icon className="w-5 h-5" /> : null
  }

  const renderItem = (item: StatItem) => {
    switch (selected?.key) {
      case 'community_partners':
        return <PartnerCard item={item} />
      case 'projects_delivered':
        return <ProjectCard item={item} />
      default:
        return <TestimonialCard item={item} />
    }
  }

  const getCount = (cat: StatCategory) => {
    const base = cat.items.length
    const extra = cat.dynamicItems?.length || 0
    const total = base + extra
    return total > 50 ? `${total}+` : total
  }

  const getLabel = (cat: StatCategory) => {
    if (cat.dynamicLabel) return cat.dynamicLabel
    return cat.label
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Digital Oda Tree - Technology meets Heritage"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 oromo-pattern opacity-30" />
      </div>

      {/* Floating Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest/20 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 container-fira px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/20 border border-forest/30 text-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Based in Adama, Ethiopia</span>
            <span className="text-accent">🇪🇹</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6"
          >
            <span className="text-foreground">Technology</span>
            <br />
            <span className="text-gradient-gold">Meets Heritage</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            We are <span className="text-accent font-semibold">Fira</span> — meaning 
            <em> kinship</em> in Oromo. We build digital solutions that connect communities 
            and empower local businesses across Africa and beyond.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="hero" size="xl" className="group">
              Start a Conversation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Explore Our Work
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 flex flex-wrap justify-center gap-8 max-w-lg mx-auto"
          >
            {categories.filter(cat => cat.items.length > 0 || (cat.dynamicItems && cat.dynamicItems.length > 0)).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelected(cat)}
                className="text-center group cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                <div className="text-2xl md:text-3xl font-bold text-accent group-hover:text-foreground transition-colors">
                  {getCount(cat)}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1 group-hover:text-accent transition-colors flex items-center justify-center gap-1">
                  <StatIcon icon={cat.icon} />
                  {getLabel(cat)}
                </div>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Stat Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-forest/20 rounded-2xl p-8 max-w-xl w-full shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  {selected.dynamicValue ? (
                    <>
                      <div className="text-4xl font-bold text-accent mb-1">{selected.dynamicValue}%</div>
                      <h3 className="text-xl font-semibold text-foreground">{selected.dynamicLabel || selected.label}</h3>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-accent mb-1">
                        {selected.items.length > 50 ? `${selected.items.length}+` : selected.items.length}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{selected.label}</h3>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1 rounded-full hover:bg-forest/10 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {selected.key === 'client_satisfaction' && selected.dynamicItems ? (
                <div className="space-y-4">
                  {selected.dynamicItems.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-xl bg-forest/5 border border-forest/10">
                      <div className="flex items-center gap-1 text-accent mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={`text-lg ${star <= item.rating ? 'text-accent' : 'text-muted-foreground/20'}`}>★</span>
                        ))}
                      </div>
                      {item.feedback && (
                        <p className="text-muted-foreground text-sm italic">"{item.feedback}"</p>
                      )}
                      <p className="text-foreground font-medium text-xs mt-2">— {item.partner_name}</p>
                    </div>
                  ))}
                  {selected.items.map((item) => (
                    <div key={item.id}>{renderItem(item)}</div>
                  ))}
                </div>
              ) : (
                <>
                  {selected.items.length === 0 ? (
                    <p className="text-muted-foreground">No entries yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {selected.items.map((item) => (
                        <div key={item.id}>
                          {renderItem(item)}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-accent rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
