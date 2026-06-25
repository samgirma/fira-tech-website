import { useRef, useState, ReactNode, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface Slide {
  title: string;
  description: string;
  image?: string;
  icon?: LucideIcon;
  highlight?: string;
  author?: string;
  role?: string;
  initial?: string;
}

interface SectionSlideshowProps {
  id: string;
  label: string;
  heading: ReactNode;
  subtitle: string;
  slides: Slide[];
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

/* ─── Mobile slide (viewport-triggered fade, no scroll lock) ─── */
function MobileSlide({ slide, index }: { slide: Slide; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full flex flex-col items-center gap-5 py-6"
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Image */}
      {slide.image ? (
        <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden border border-border/30">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        </div>
      ) : slide.icon ? (
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center shadow-lg">
          <slide.icon className="w-12 h-12 text-foreground" />
        </div>
      ) : null}

      {/* Text */}
      <div className="text-center px-2">
        {slide.highlight && (
          <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-2">
            {slide.highlight}
          </span>
        )}
        <h3 className="text-xl font-display font-bold text-foreground mb-2">
          {slide.title}
        </h3>
        {slide.author ? (
          <>
            <p className="text-muted-foreground text-sm leading-relaxed italic mb-4">
              &ldquo;{slide.description}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center shrink-0">
                <span className="text-foreground font-display font-bold text-sm">
                  {slide.initial || slide.author.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground text-sm">{slide.author}</div>
                {slide.role && (
                  <div className="text-xs text-muted-foreground">{slide.role}</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {slide.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Desktop slide (scroll-locked horizontal track) ─── */
function DesktopSlide({
  slide,
  isActive,
  isPast,
  index,
}: {
  slide: Slide;
  isActive: boolean;
  isPast: boolean;
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <div className="min-w-full h-full flex items-center justify-center px-8 lg:px-16">
      <div className="w-full max-w-7xl h-full flex flex-row items-center justify-center gap-12 lg:gap-16 py-8">
        {/* Image Side */}
        <motion.div
          initial={false}
          animate={{
            x: isActive ? 0 : isPast ? -100 : 100,
            opacity: isActive ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-1/2 flex items-center justify-center"
          style={{ willChange: 'transform, opacity' }}
        >
          {slide.image ? (
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden border border-border/30 group">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
          ) : slide.icon ? (
            <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center shadow-lg">
              <slide.icon className="w-18 h-18 text-foreground" />
            </div>
          ) : null}
        </motion.div>

        {/* Text Side */}
        <motion.div
          initial={false}
          animate={{
            x: isActive ? 0 : isPast ? 100 : -100,
            opacity: isActive ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.08 }}
          className="w-1/2 flex flex-col justify-center"
          style={{ willChange: 'transform, opacity' }}
        >
          {slide.highlight && (
            <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-4 self-start">
              {slide.highlight}
            </div>
          )}
          <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            {slide.title}
          </h3>
          {slide.author ? (
            <>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg italic mb-6">
                &ldquo;{slide.description}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center shrink-0">
                  <span className="text-foreground font-display font-bold">
                    {slide.initial || slide.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{slide.author}</div>
                  {slide.role && (
                    <div className="text-sm text-muted-foreground">{slide.role}</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              {slide.description}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main SectionSlideshow ─── */
export function SectionSlideshow({
  id,
  label,
  heading,
  subtitle,
  slides,
}: SectionSlideshowProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const slideX = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `-${(slides.length - 1) * 100}%`]
  );

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const rawIndex = latest * (slides.length - 1);
    setActiveSlide(Math.max(0, Math.min(slides.length - 1, Math.round(rawIndex))));
  });

  /* ─── MOBILE: vertical stack, no scroll lock ─── */
  if (isMobile) {
    return (
      <section
        id={id}
        className="relative bg-background/40 backdrop-blur-sm py-8 px-4"
      >
        {/* Sticky-ish header (regular sticky, no scroll lock) */}
        <div className="sticky top-20 z-20 py-4 px-4 border-b border-border/20 bg-background/70 backdrop-blur-xl rounded-xl mb-4">
          <div className="text-center">
            <span className="text-accent text-xs font-semibold tracking-wider uppercase">
              {label}
            </span>
            <div>{heading}</div>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Vertical stack of slides */}
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <MobileSlide key={slide.title} slide={slide} index={index} />
          ))}
        </div>
      </section>
    );
  }

  /* ─── DESKTOP: scroll-locked horizontal track ─── */
  return (
    <section
      id={id}
      ref={containerRef}
      className="relative bg-background/40 backdrop-blur-sm"
      style={{ height: `${100 + (slides.length - 1) * 150}vh` }}
    >
      <div className="sticky top-20 h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
        {/* Section Header */}
        <div className="shrink-0 py-7 px-8 border-b border-border/20 bg-background/60 backdrop-blur-xl z-20">
          <div className="container-fira text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-accent text-sm font-semibold tracking-wider uppercase"
            >
              {label}
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {heading}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto mt-2"
            >
              {subtitle}
            </motion.p>
          </div>
        </div>

        {/* Slide viewport */}
        <div className="relative flex-1 overflow-hidden">
          <motion.div className="flex h-full" style={{ x: slideX }}>
            {slides.map((slide, index) => (
              <DesktopSlide
                key={slide.title}
                slide={slide}
                index={index}
                isActive={activeSlide === index}
                isPast={activeSlide > index}
              />
            ))}
          </motion.div>

          {/* Progress Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSlide === index ? 'bg-accent scale-125' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
