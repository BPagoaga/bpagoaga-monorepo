import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

export interface ISocialLink {
  label: string;
  href: string;
  icon: IconDefinition;
}

export interface INavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ISection {
  id: (typeof SECTION_IDS)[number];
  title: string;
}

export const SITE = {
  name: 'Bernard Pagoaga',
  headline: 'PHP & Javascript Web Developer in Lille',
  title: 'Bernard Pagoaga, Javascript & PHP Web Developer in Lille',
  description: 'Bernard Pagoaga, Javascript & PHP Web Developer in Lille : Symfony, Angular, Vue, ApiPlatform',
  ogDescription:
    'Bernard Pagoaga, Javascript & PHP Web Developer in Lille, using Symfony, Angular, Vue, ApiPlatform & Co',
  keywords: 'web development, front-end, responsive design, Lille, javascript, html, css, php, symfony, angular, vue',
  url: 'https://bernardpagoaga.net',
  since: 2015,
} as const;

export const ABOUT =
  'I am a web developer based in Lille, France. I have a passion for web development and design, and I love to create websites that are both beautiful and functional. I have experience with a variety of technologies, including JavaScript, PHP, and MySQL. I am always looking for new challenges and opportunities to learn and grow as a developer.';

// Anchors of the home page sections; the external Training link is added by SiteNav (its URL comes from the env).
export const NAV_LINKS: INavLink[] = [
  { label: 'About me', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'CV', href: '#cv' },
];

export const SOCIAL_LINKS: ISocialLink[] = [
  { label: 'LinkedIn', href: 'https://fr.linkedin.com/in/bernard-pagoaga-a7307470', icon: faLinkedinIn },
  { label: 'GitHub', href: 'https://github.com/BPagoaga', icon: faGithub },
];

// Display order of the project sections; projects reference them by id (src/content/projects.json).
export const SECTION_IDS = ['full-stack', 'front-end', 'freecodecamp-advanced', 'freecodecamp-intermediate'] as const;

export const SECTIONS: ISection[] = [
  { id: 'full-stack', title: 'Full-stack Web Development' },
  { id: 'front-end', title: 'Front-End Web Development' },
  { id: 'freecodecamp-advanced', title: 'FreeCodeCamp: Advanced' },
  { id: 'freecodecamp-intermediate', title: 'FreeCodeCamp: Intermediate' },
];
