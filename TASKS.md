# Tasks

## Current Sprint

### Portfolio

- [ ] Remplacer le contenu de démo des mockups (`apps/mockups/_data/portfolio.mjs`) par le vrai parcours
- [ ] Choisir entre la version une page et la version deux colonnes (MOCK-100)
- [ ] Compléter le portfolio : parcours, compétences, contact
- [ ] Section CV (`#cv`) : vrai parcours (pour l'instant un renvoi vers LinkedIn)
- [ ] Projets FreeCodeCamp : les vignettes pointent toujours vers des pens CodePen (seul le lien de profil a été retiré)
- [ ] Image Open Graph (l'ancien `og:image` pointait vers un `BPAGOAGA.svg` inexistant)
- [~] Déployer `apps/portfolio` sur bernardpagoaga.net (remplace le site Nuxt 2) — workflow GitHub Pages prêt ; reste :
  domaine vérifié, domaine perso dans les réglages Pages, DNS (Netlify DNS) vers GitHub, HTTPS forcé, arrêt du site Netlify

Notes : contenu migré depuis `BPagoaga/portfolio` (branche `master`, = site en ligne). Vignettes récupérées dans
l'historique (commit `49c506c`). Écartés : bandeau « Work In Progress », contenu 2015-2018 (CV PDF, certificats).

### Calisthenics (CaliBuddy)

Décisions (2026-10-28) : l'app web (`apps/calisthenics`) d'abord, données locales (IndexedDB derrière des hooks React
Query, sans compte), v1 = journal + tableau de bord + tutoriels + programme simple (un modèle de séance par jour de la
semaine) + test de niveau au premier lancement. Nom : CaliBuddy (le lien du portfolio reste « Training »).

Décisions (2026-10-28, backend) : API `apps/calisthenics-api` en Node + Hono + Postgres (Drizzle), comptes e-mail et
mot de passe (Better Auth), données sur le serveur uniquement (plus d'IndexedDB ; les anciens exports s'importent),
client généré par Orval depuis l'OpenAPI (`packages/calisthenics-api-client`), contenu et calculs partagés dans
`packages/calisthenics-core`.

- [ ] Promouvoir les composants calisthenics de `apps/mockups` en `reference/` (macros + vitrines), maintenant que les
      écrans sont implémentés
- [ ] Mettre à jour la maquette du set logger (MOCK-026) : mode durée, déjà implémenté dans l'app
- [ ] Vidéos de démonstration des exercices (liens externes ou hébergées) : le champ `video` est prêt
- [ ] Valider les maquettes Connexion / Inscription (MOCK-207, MOCK-033), implémentées avec l'API
- [ ] Choisir l'hébergement de l'API et de Postgres, puis déployer : app web sur training.bernardpagoaga.net (build
      statique, repli SPA sur `index.html`) et `/api` relayé vers l'API sur la même origine (sinon cookies
      `SameSite=None` + `TRUSTED_ORIGINS`) ; `BETTER_AUTH_SECRET` propre à l'environnement
- [ ] Envoi d'e-mails (fournisseur à choisir) : vérification d'adresse et mot de passe oublié (Better Auth)
- [ ] Écran Profil (maquette d'abord) : prénom, déconnexion, suppression du compte, export
- [ ] App mobile : brancher `@bpagoaga/calisthenics-api-client` et Better Auth (plugin Expo) sur l'API
- [ ] App mobile : `eas init` (compte Expo), icône et splash screen propres, premiers écrans à partir des maquettes
- [ ] App mobile : EAS Update (`expo-updates`, canaux) si on veut des mises à jour OTA

### Design system

- [ ] Thème sombre à partir des alias sémantiques
- [ ] Premiers composants React dans `packages/ui` une fois les maquettes validées (avec leur story)
- [ ] Thème sombre aussi dans `ui-native` (générer les alias sémantiques par schéma de couleurs)
- [ ] CI : vérifier `build-storybook` et le lint de `packages/ui` (workflow `checks-ui.yml`) et ajouter `packages/dev-certs/**` aux `paths` des checks d'apps, après la PR #2

## Completed Tasks

- [x] 2026-10-26 — Monorepo Turborepo + pnpm, apps portfolio (Astro) et calisthenics (React) bootstrapées avec Vite+
- [x] 2026-10-26 — Package `@bpagoaga/ui` (tokens Tailwind v4)
- [x] 2026-10-26 — App `mockups` (Eleventy) : catalogue, 11 composants, 5 pages
- [x] 2026-10-26 — Migration du contenu de bernardpagoaga.net dans `apps/portfolio` (17 projets, réseaux, SEO)
- [x] 2026-10-26 — App `calisthenics-mobile` (Expo SDK 58, EAS), package `ui-native` (tokens générés depuis `ui`)
- [x] 2026-10-28 — Maquettes calisthenics révisées et validées (MOCK-200 à 206), modèle de données (`apps/calisthenics/docs/data-model.md`)
- [x] 2026-10-28 — App web CaliBuddy : test de niveau, programme, séances, journal, tableau de bord, tutoriels (IndexedDB, 26 tests)
- [x] 2026-10-28 — API CaliBuddy (Hono, Drizzle, Postgres, Better Auth), client Orval, app web branchée dessus, packages
      `calisthenics-core` et `calisthenics-api-client`
- [x] 2026-10-27 — Portfolio : menu (À propos, Portfolio, CV, Training externe via `TRAINING_URL`), retrait Facebook / X / CodePen
- [x] 2026-10-26 — Serveurs de dev en HTTPS (`@bpagoaga/dev-certs`) et Storybook pour `@bpagoaga/ui` (fondations)
