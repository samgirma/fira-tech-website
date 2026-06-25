import { SectionSlideshow } from './SectionSlideshow';
import retailImg from '@/assets/services/retail-saas.gif';
import webAppsImg from '@/assets/services/web_and_apps.gif';
import agriImg from '@/assets/services/agri-tech.gif';
import eduImg from '@/assets/services/edu-tech.gif';
import fullStackImg from '@/assets/services/full-satck.gif';
import cloudImg from '@/assets/services/cloud-infrastructure.gif';

const services = [
  {
    title: 'Retail SaaS',
    description:
      'Streamlining inventory and sales for small-to-medium enterprises with Fira Retail — our flagship product.',
    highlight: 'Flagship Product',
    image: retailImg,
  },
  {
    title: 'Custom Web & Mobile Apps',
    description:
      'Building robust, offline-first applications tailored for the African market and beyond.',
    image: webAppsImg,
  },
  {
    title: 'Agri-Tech Solutions',
    description:
      'Developing scalable platforms that empower farmers and agricultural communities.',
    image: agriImg,
  },
  {
    title: 'Ed-Tech Platforms',
    description:
      'Creating accessible educational technology that bridges knowledge gaps across regions.',
    image: eduImg,
  },
  {
    title: 'Full-Stack Development',
    description:
      'React Native, Flutter, Next.js, Node.js — we build with the best modern technologies.',
    image: fullStackImg,
  },
  {
    title: 'Cloud Infrastructure',
    description:
      'PostgreSQL, Supabase, Firebase — reliable and scalable backend solutions.',
    image: cloudImg,
  },
];

export function ServicesSection() {
  return (
    <SectionSlideshow
      id="services"
      label="What We Do"
      heading={
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-2">
          Building{' '}
          <span className="text-gradient-gold">Digital Bridges</span>
        </h2>
      }
      subtitle="We bridge the gap between traditional business and modern technology, creating solutions that work for our communities."
      slides={services}
    />
  );
}
