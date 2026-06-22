import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Fira Tech didn't just build us software — they became partners in our growth. Their understanding of local business challenges is unmatched.",
    author: "Lelise Bekele",
    role: "Retail Store Owner, Adama",
    initial: "L",
  },
  {
    quote: "The offline-first approach they brought to our agricultural platform has been transformative for farmers in rural areas.",
    author: "Dawit Tadesse",
    role: "AgriCoop Director",
    initial: "D",
  },
  {
    quote: "Working with Fira feels like working with family. They truly care about the success of your business.",
    author: "Hana Girma",
    role: "E-commerce Entrepreneur",
    initial: "H",
  },
];

export function CommunitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="community" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 oromo-pattern opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forest/5 rounded-full blur-[200px]" />

      <div ref={ref} className="container-fira relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">Our Community Partners</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-6">
            Voices From <span className="text-gradient-green">Our Family</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We don't have clients — we have community partners who trust us with their digital transformation.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="glass-card p-8 flex flex-col"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-accent/30 mb-4" />

              {/* Quote Text */}
              <p className="text-foreground/90 leading-relaxed flex-grow italic mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center">
                  <span className="text-foreground font-display font-bold">
                    {testimonial.initial}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
