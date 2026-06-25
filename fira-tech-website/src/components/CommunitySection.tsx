import { Quote } from 'lucide-react';
import { SectionSlideshow } from './SectionSlideshow';

const testimonials = [
  {
    title: 'Lelise Bekele',
    description:
      "Fira Tech didn't just build us software — they became partners in our growth. Their understanding of local business challenges is unmatched.",
    author: 'Lelise Bekele',
    role: 'Retail Store Owner, Adama',
    initial: 'L',
    icon: Quote,
  },
  {
    title: 'Dawit Tadesse',
    description:
      'The offline-first approach they brought to our agricultural platform has been transformative for farmers in rural areas.',
    author: 'Dawit Tadesse',
    role: 'AgriCoop Director',
    initial: 'D',
    icon: Quote,
  },
  {
    title: 'Hana Girma',
    description:
      'Working with Fira feels like working with family. They truly care about the success of your business.',
    author: 'Hana Girma',
    role: 'E-commerce Entrepreneur',
    initial: 'H',
    icon: Quote,
  },
];

export function CommunitySection() {
  return (
    <SectionSlideshow
      id="community"
      label="Our Community Partners"
      heading={
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-2">
          Voices From{' '}
          <span className="text-gradient-green">Our Family</span>
        </h2>
      }
      subtitle="We don't have clients — we have community partners who trust us with their digital transformation."
      slides={testimonials}
    />
  );
}
