/**
 * Contenu de démonstration du portfolio (CV en ligne). Fictif : à remplacer par le vrai
 * parcours au moment de l'implémentation dans apps/portfolio (collection de contenu Astro).
 */
export default {
  name: 'Bernard Pagoaga',
  headline: 'Développeur front-end React & TypeScript',
  pitch:
    "Je conçois des interfaces web et mobiles rapides, accessibles et faciles à faire évoluer — du design system jusqu'à la mise en production.",
  location: 'France',
  availability: 'Ouvert aux échanges',
  links: [
    { label: 'Parcours', href: '#parcours' },
    { label: 'Compétences', href: '#competences' },
    { label: 'Projets', href: '#projets' },
    { label: 'Contact', href: '#contact' },
  ],
  socials: [
    { label: 'GitHub', icon: 'github', href: '#' },
    { label: 'LinkedIn', icon: 'linkedin', href: '#' },
  ],
  highlights: [
    { value: '8+', label: "années d'expérience" },
    { value: '4', label: 'apps en production' },
    { value: '1', label: 'design system maintenu' },
  ],
  skills: [
    { group: 'Front-end', items: ['React', 'TypeScript', 'Astro', 'Tailwind CSS', 'React Query', 'Zustand'] },
    { group: 'Mobile', items: ['React Native', 'Expo', 'NativeWind'] },
    { group: 'Outillage', items: ['Vite', 'Turborepo', 'Vitest', 'Storybook', 'GitHub Actions'] },
    { group: 'Pratiques', items: ['Design system', 'Accessibilité', 'Tests', 'Revue de code'] },
  ],
  experiences: [
    {
      role: 'Développeur front-end',
      company: 'Jooxter',
      period: '20XX — aujourd’hui',
      location: 'Paris · hybride',
      current: true,
      summary:
        "Applications de réservation d'espaces de travail (web, add-in Outlook, tablette, mobile) dans un monorepo Turborepo.",
      highlights: [
        'Mise en place d’un système de maquettes in-repo branché sur les vrais tokens du design system.',
        'Migration Tailwind CSS v4 et React 19 sur l’ensemble des apps.',
        'Refonte de l’accueil collaborateur, de la maquette à la production.',
      ],
      tags: ['React', 'TypeScript', 'Tailwind', 'Turborepo'],
    },
    {
      role: 'Développeur web',
      company: 'Entreprise précédente',
      period: '20XX — 20XX',
      location: 'Ville',
      summary: 'Développement de fonctionnalités front et back pour une plateforme SaaS B2B.',
      highlights: ['Exemple de réalisation à remplacer.', 'Autre réalisation chiffrée à remplacer.'],
      tags: ['JavaScript', 'Node.js'],
    },
    {
      role: 'Formation',
      company: 'École / université',
      period: '20XX — 20XX',
      location: 'Ville',
      summary: 'Diplôme à renseigner.',
      highlights: [],
      tags: [],
    },
  ],
  projects: [
    {
      title: 'CaliBuddy',
      description: 'Suivi de calisthénie : tutoriels par progression, journal de séances et records.',
      icon: 'person-running',
      tone: 'accent',
      tags: ['React', 'Vite+'],
      href: '#',
      repo: '#',
    },
    {
      title: 'Ce portfolio',
      description: 'Site statique Astro, design system partagé via un monorepo Turborepo.',
      icon: 'id-card',
      tone: 'primary',
      tags: ['Astro', 'Tailwind'],
      href: '#',
      repo: '#',
    },
    {
      title: 'Mockups',
      description: 'Catalogue de maquettes 11ty branché sur les vrais tokens, avec recherche et facettes.',
      icon: 'object-group',
      tone: 'blue',
      tags: ['Eleventy', 'Nunjucks'],
      repo: '#',
    },
  ],
};
