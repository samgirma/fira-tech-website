import { SectionSlideshow } from './SectionSlideshow';
import odaTreeImg from '@/assets/our_story/oda-tree.webp';
import kinshipImg from '@/assets/our_story/kininship.jpg';
import visionImg from '@/assets/our_story/global-local-vision.avif';
import collaborativeImg from '@/assets/our_story/collaborative-spirit.png';

const values = [
  {
    title: 'Rooted in Community',
    description:
      'Like the Oda tree that shelters our people, we build technology that nurtures and protects the communities we serve.',
    image: odaTreeImg,
  },
  {
    title: 'Kinship First',
    description:
      'Fira means family. Every client becomes part of our extended family, receiving the care and dedication that bond brings.',
    image: kinshipImg,
  },
  {
    title: 'Local-Global Vision',
    description:
      'We think globally while acting locally, creating solutions that work offline-first for Africa while meeting world-class standards.',
    image: visionImg,
  },
  {
    title: 'Collaborative Spirit',
    description:
      'True innovation comes from working together. We partner with businesses, not just serve them.',
    image: collaborativeImg,
  },
];

export function AboutSection() {
  return (
    <SectionSlideshow
      id="about"
      label="Our Story"
      heading={
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-2">
          Innovation. Community.{' '}
          <span className="text-gradient-green">Value.</span>
        </h2>
      }
      subtitle="We are a software engineering startup based in Adama, Ethiopia, dedicated to building high-impact digital solutions for local businesses and the global market."
      slides={values}
    />
  );
}
