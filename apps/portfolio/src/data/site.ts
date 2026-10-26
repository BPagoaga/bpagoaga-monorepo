import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faCodepen, faFacebookF, faGithub, faLinkedinIn, faXTwitter } from '@fortawesome/free-brands-svg-icons';

export interface ISocialLink {
  label: string;
  href: string;
  icon: IconDefinition;
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

export const SOCIAL_LINKS: ISocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/people/Bernard-Pagoaga/100009005267393', icon: faFacebookF },
  { label: 'Twitter', href: 'https://twitter.com/bpagoaga', icon: faXTwitter },
  { label: 'LinkedIn', href: 'https://fr.linkedin.com/in/bernard-pagoaga-a7307470', icon: faLinkedinIn },
  { label: 'GitHub', href: 'https://github.com/BPagoaga', icon: faGithub },
  { label: 'CodePen', href: 'https://codepen.io/BPagoaga', icon: faCodepen },
];

// Display order of the project sections; projects reference them by id (src/content/projects.json).
export const SECTION_IDS = ['full-stack', 'front-end', 'freecodecamp-advanced', 'freecodecamp-intermediate'] as const;

export const SECTIONS: ISection[] = [
  { id: 'full-stack', title: 'Full-stack Web Development' },
  { id: 'front-end', title: 'Front-End Web Development' },
  { id: 'freecodecamp-advanced', title: 'FreeCodeCamp: Advanced' },
  { id: 'freecodecamp-intermediate', title: 'FreeCodeCamp: Intermediate' },
];
