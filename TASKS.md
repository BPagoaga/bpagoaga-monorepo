# Tasks

## Current Sprint

### Portfolio

- [ ] Remplacer le contenu de démo des mockups (`apps/mockups/_data/portfolio.mjs`) par le vrai parcours
- [ ] Choisir entre la version une page et la version deux colonnes (MOCK-100)
- [ ] Compléter le portfolio : parcours, compétences, à propos (texte de la branche `nuxt3` de l'ancien repo), contact
- [ ] Image Open Graph (l'ancien `og:image` pointait vers un `BPAGOAGA.svg` inexistant)
- [ ] Déployer `apps/portfolio` sur bernardpagoaga.net (remplace le site Nuxt 2)

Notes : contenu migré depuis `BPagoaga/portfolio` (branche `master`, = site en ligne). Vignettes récupérées dans
l'historique (commit `49c506c`). Écartés : bandeau « Work In Progress », contenu 2015-2018 (CV PDF, certificats).

### Calisthenics

- [ ] Valider les maquettes tableau de bord / tutoriels / journal (MOCK-200 à 202)
- [ ] Définir le modèle de données (exercices, progressions, séances, séries)

### Design system

- [ ] Thème sombre à partir des alias sémantiques
- [ ] Premiers composants React dans `packages/ui` une fois les maquettes validées

## Completed Tasks

- [x] 2026-10-26 — Monorepo Turborepo + pnpm, apps portfolio (Astro) et calisthenics (React) bootstrapées avec Vite+
- [x] 2026-10-26 — Package `@bpagoaga/ui` (tokens Tailwind v4)
- [x] 2026-10-26 — App `mockups` (Eleventy) : catalogue, 11 composants, 5 pages
- [x] 2026-10-26 — Migration du contenu de bernardpagoaga.net dans `apps/portfolio` (17 projets, réseaux, SEO)
