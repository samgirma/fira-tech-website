import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { ShoppingCart, Smartphone, Sprout, GraduationCap, Cloud, ArrowRight, ChevronRight } from 'lucide-react';

const products = [
  {
    id: 1,
    title: 'Fira Retail',
    subtitle: 'Flagship SaaS',
    description: 'Streamlining inventory and sales for small-to-medium enterprises. Our flagship product revolutionizes how businesses manage operations.',
    icon: ShoppingCart,
    gradient: 'from-accent/20 via-gold-muted/10 to-accent/5',
    iconBg: 'from-accent to-gold-muted',
    iconColor: 'text-accent-foreground',
    features: ['Real-time Analytics', 'Multi-location', 'Offline-first'],
  },
  {
    id: 2,
    title: 'Agri-Tech',
    subtitle: 'Agricultural Platform',
    description: 'Scalable platforms empowering farmers and agricultural communities with modern technology solutions.',
    icon: Sprout,
    gradient: 'from-forest/20 via-forest-dark/10 to-forest/5',
    iconBg: 'from-forest to-forest-dark',
    iconColor: 'text-foreground',
    features: ['Market Access', 'Weather Data', 'Community Hub'],
  },
  {
    id: 3,
    title: 'Ed-Tech',
    subtitle: 'Educational Platform',
    description: 'Accessible educational technology bridging knowledge gaps across regions and empowering learners.',
    icon: GraduationCap,
    gradient: 'from-primary/20 via-primary-foreground/10 to-primary/5',
    iconBg: 'from-primary to-primary-foreground',
    iconColor: 'text-primary-foreground',
    features: ['Offline Learning', 'Local Content', 'Progress Tracking'],
  },
  {
    id: 4,
    title: 'Cloud Infrastructure',
    subtitle: 'Backend Solutions',
    description: 'Reliable and scalable backend solutions for modern applications. PostgreSQL, Supabase, Firebase.',
    icon: Cloud,
    gradient: 'from-secondary/20 via-muted/10 to-secondary/5',
    iconBg: 'from-secondary to-muted',
    iconColor: 'text-secondary-foreground',
    features: ['Auto-scaling', 'Global CDN', '99.9% Uptime'],
  },
];

interface ProgressDotProps {
  index: number;
  total: number;
  progress: MotionValue<number>;
  smoothProgress: MotionValue<number>;
}

function ProgressDot({ index, total, progress, smoothProgress }: ProgressDotProps) {
  const dotProgress = index / (total - 1);

  const scale = useTransform(
    smoothProgress,
    [Math.max(0, dotProgress - 0.15), dotProgress, Math.min(1, dotProgress + 0.15)],
    [1, 1.5, 1]
  );

  const backgroundColor = useTransform(
    smoothProgress,
    [Math.max(0, dotProgress - 0.15), dotProgress, Math.min(1, dotProgress + 0.15)],
    ['hsl(var(--muted))', 'hsl(var(--accent))', 'hsl(var(--muted))']
  );

  return (
    <motion.div className="relative" style={{ scale }}>
      <motion.div className="w-3 h-3 rounded-full" style={{ backgroundColor }} />
      {index < total - 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 left-full w-8 h-0.5 bg-border/50" />
      )}
    </motion.div>
  );
}

export function HorizontalScrollGallery() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth spring animation for horizontal movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Calculate horizontal translation
  const x = useTransform(
    smoothProgress,
    [0, 1],
    ['0%', `-${(products.length - 1) * 100}%`]
  );

  // Progress indicator opacity
  const progressOpacity = useTransform(
    smoothProgress,
    [0, 0.05, 0.95, 1],
    [0, 1, 1, 0]
  );

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Header */}
        <div className="absolute top-8 left-0 right-0 text-center z-10 pointer-events-none">
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">Our Products</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">
            Building <span className="text-gradient-gold">Digital Bridges</span>
          </h2>
        </div>

        {/* Horizontal Track */}
        <motion.div style={{ x }} className="flex h-full items-center">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="min-w-[85vw] md:min-w-[60vw] lg:min-w-[50vw] h-[70vh] flex-shrink-0 px-4 md:px-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true, margin: '-100px' }}
                className={`glass-card h-full flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br ${product.gradient} border border-border/30 relative overflow-hidden group`}
              >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${product.iconBg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <product.icon className={`w-10 h-10 ${product.iconColor}`} />
                </div>

                {/* Content */}
                <div className="text-center relative z-10">
                  <span className="text-accent text-sm font-semibold tracking-wider uppercase">{product.subtitle}</span>
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-4">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {product.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-4 py-2 rounded-full bg-background/50 border border-border/50 text-sm text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-center gap-2 text-accent font-semibold group-hover:gap-4 transition-all duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-32 h-32 bg-accent/5 rounded-full blur-[60px]" />
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-forest/5 rounded-full blur-[50px]" />
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          style={{ opacity: progressOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10"
        >
          {products.map((_, index) => (
            <ProgressDot
              key={index}
              index={index}
              total={products.length}
              progress={scrollYProgress}
              smoothProgress={smoothProgress}
            />
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: progressOpacity }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="w-5 h-5 text-accent rotate-90" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
