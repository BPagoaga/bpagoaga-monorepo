# Mockups

Système de maquettage in-repo : composants et pages HTML/Nunjucks servis par
[Eleventy](https://www.11ty.dev/), stylés avec les **tokens réels** du design system
(`@bpagoaga/ui`) — sans jamais quitter le repo ni recopier une valeur à la main.

Il sert à concevoir et valider les écrans de `apps/portfolio` et `apps/calisthenics`
avant d'écrire le moindre code applicatif.

## Pourquoi ce système

- **Les tokens ne sont jamais copiés.** `src/tailwind.css` importe
  `@bpagoaga/ui/styles.css`, le même fichier que les apps. Un token qui change dans
  `packages/ui/src/theme.css` change ici au prochain build.
- **Un composant a une seule source de markup** : une macro Nunjucks dans
  `_includes/macros/`, importée par les pages qui la composent — jamais dupliquée. Le nom
  `macros/` (pas `components/`) est volontaire : `components/` est la _vitrine_ (la page
  ouverte dans le navigateur), `macros/` la _définition_.
- **Un catalogue auto-généré.** `_data/catalogue.mjs` liste composants et pages à partir
  de leurs `.meta.yml` et de leurs imports réels : l'index (`/`) n'est jamais tenu à jour
  à la main.
- **Référence vs proposition, explicitement séparés** (voir plus bas).

Ce que ça reste : pas de React, pas d'état, pas d'appel réseau, rien d'importé depuis le
code des apps — uniquement les tokens et le vocabulaire visuel.

## Structure

```
apps/mockups/
  README.md                 ce fichier
  eleventy.config.mjs
  src/tailwind.css          entrée Tailwind : importe @bpagoaga/ui + scanne les templates
  assets/                   JS/CSS servis tels quels (assets/tailwind.css est généré)
  _includes/
    layout.njk              gabarit commun (barre du catalogue, badge « mockup »)
    bare-layout.njk         gabarit nu pour les previews/ en <iframe>
    macros/
      reference/<slug>.njk  macro d'un composant qui existe déjà dans le vrai code
      proposals/<slug>.njk  macro d'un composant nouveau, pas (encore) implémenté
  _data/
    catalogue.mjs           dérive le catalogue des .meta.yml — jamais maintenu à la main
    portfolio.mjs           contenu de démo du portfolio
    calisthenics.mjs        données de démo de l'app Calisthenics
  components/
    reference/<slug>/       <slug>.html (démo de tous les états) + <slug>.meta.yml
    proposals/<slug>/       idem
  pages/<slug>/             <slug>.html (+ v2-<nom>.html…) + <slug>.meta.yml
  previews/                 pages nues à embarquer en <iframe> de largeur fixe
  dist/                     généré — jamais commité
```

**Versions / variantes** : plusieurs `.html` dans le même dossier sont listés comme
variantes (sélecteur « Version » dans la barre du haut). `<slug>.html` reste la version
par défaut, les autres se nomment `v2-<nom>.html`, `v3-<nom>.html`… Le libellé vient du
`title` du front-matter. Un seul `.meta.yml` pour toutes les variantes. Exemple :
`pages/portfolio-cv/` (une page / deux colonnes).

## Reference vs proposals

- **`reference/`** — transcription fidèle d'un composant qui existe dans le vrai code
  (`packages/ui`, `apps/*`). Réutilisable tel quel dans toute maquette qui représente
  l'app _telle qu'elle est_.
- **`proposals/`** — composant nouveau, inventé pour une maquette. Tant que les apps sont
  des coquilles vides, **tous les composants sont des propositions**.

**Promotion** : quand une proposition est portée dans le vrai code (`status:
implemented`, `implemented_in` renseigné), elle est déplacée vers `reference/` (macro
et vitrine) et son `.meta.yml` passe à `kind: reference`.

## Conventions

- **HTML sémantique** et accessible (landmarks, `aria-current`, `aria-pressed`,
  `aria-label` sur les boutons icône).
- **Aucune valeur brute** : couleurs, espacements, ombres, typo passent par les classes du
  thème (`bg-primary-100`, `text-body-s`, `shadow-elevation-2`…). La palette Tailwind par
  défaut est désactivée : une classe hors tokens ne produit rien. Si un token manque, le
  signaler dans `notes:` plutôt qu'en inventer un. Seule exception : une donnée
  (hauteur de barre, % de progression) en `style=""`.
- **Un composant s'écrit comme une macro** (`{% macro %}` / `{% from … import %}`),
  jamais comme un include qui lit des variables de la page.
- **Une page ne réécrit jamais le markup d'un composant** — elle l'importe.
- **Une même brique dans deux composants = une seule source**, extraite dès la deuxième
  occurrence.
- **Chaque composant documente ses états** (défaut, survol, désactivé, chargement, vide,
  contenu long…) dans sa page de démo.
- **JS uniquement pour illustrer un comportement local** — `assets/mockup-toggle.js`
  couvre les cas génériques : `data-mockup-toggle` / `data-mockup-panel` (ouvrir/fermer),
  `data-mockup-tab` / `data-mockup-tab-panel` (onglets), `data-mockup-chip`
  (`aria-pressed`). Portée : l'ancêtre `[data-mockup-scope]` le plus proche.
- **Un état dépendant d'un breakpoint (`md:`, `lg:`…) se démontre dans une `<iframe>` de
  largeur fixe**, pas dans une boîte rétrécie : ce sont de vraies media queries, évaluées
  sur la fenêtre. Créer `previews/<nom>.html` (`layout: bare-layout.njk`) et l'embarquer
  via `<iframe src="/previews/<nom>/" width="390" data-mockup-iframe-autoheight>`.
  Exemples : `site-header`, `app-nav`, `pages/calisthenics-journal/v2-seance-mobile`.
- **Écarts documentés** : si une macro s'écarte de ce que sera le vrai composant (ex. décalage
  `top-12` sous la barre du catalogue), le dire en commentaire en tête de la macro.
- **Nunjucks** : `selectattr` n'accepte pas de test (`'equalto'`) — filtrer dans une
  boucle. Une ré-affectation `{% set %}` ne survit pas à un `{% for %}` : utiliser un
  tableau et `.push()`.

### `.meta.yml`

```yaml
id: MOCK-XXX
title: Nom affiché
kind: reference | proposals # composants seulement — doit correspondre au dossier
status: draft | validated | implemented
app: portfolio | calisthenics | shared
area: Navigation # zone fonctionnelle, voir « Classement »
related_component: null # chemin du vrai composant (reference)
implemented_in: null # chemin réel une fois porté
states: [default, hover, ...]
channels: [web, mobile]
notes: >
  Compromis assumés, tokens manquants, questions ouvertes.
```

Plages d'ID : `MOCK-000…009` socle, `010…019` composants portfolio, `020…099` composants
calisthenics, `1xx` pages portfolio, `2xx` pages calisthenics.

## Principes UI/UX

Chaque maquette est relue contre cette liste avant d'être montrée.

- **Heuristiques de Nielsen**, **WCAG 2.2 AA** (contraste ≥ 4.5:1, focus visible, aucune
  information portée par la couleur seule, cibles ≥ 24 px, 44 px sur mobile), **lois de
  l'UX** (Fitts, Hick, Jakob), **Gestalt** (proximité et alignement avant bordures).
- **Une action principale par écran** (`primary`, ou `accent` dans Calisthenics).
- **L'essentiel d'abord, le détail à la demande.**
- **Cohérence avant nouveauté** : réutiliser un composant existant avant d'en créer un.
- **États au-delà du cas nominal** : vide, chargement, erreur, contenu long.
- **Copie** : verbes d'action (« Valider la série », pas « OK »), messages d'erreur qui
  disent quoi faire.
- **Pas seulement le desktop** : si `channels` contient `mobile`, ce canal est maquetté.

**Relecture** : impression à 2 secondes (l'œil tombe-t-il sur la bonne chose ?), puis
chaque point ci-dessus. Les compromis vont dans `notes:`.

## Classement et index

L'index (`/`) : recherche plein texte (sans accents), facettes (type, app, zone, canal,
statut), regroupement (app, zone, type, récents) et une fiche par maquette. L'état est
dans l'URL (`/#app=calisthenics&open=page/calisthenics-journal`). Raccourcis : `/` ou
`⌘K` pour chercher, `Entrée`, `Échap`.

**Saisi à la main** : `app`, `area`, `channels`, `status`. **Dérivé au build** : graphe
« utilise / utilisé dans » (depuis les `{% from "macros/…" %}` réels ; une macro annexe
nommée `<slug>-<suffixe>.njk` est rattachée à son composant), date de mise à jour (dernier
commit, mtime à défaut), alertes « à ranger ».

## Commandes

Depuis la racine du monorepo :

```bash
pnpm dev:mockups      # tailwind --watch + eleventy --serve, http://localhost:8080
pnpm build:mockups    # build one-shot dans apps/mockups/dist
```

`mockups` fait partie du pipeline `turbo build` (sortie `dist/**`) : le build casse si une
maquette ne compile plus.

## Workflow

1. **Nouveau composant** : macro dans `_includes/macros/proposals/<slug>.njk` + vitrine
   `components/proposals/<slug>/` (tous les états) + `.meta.yml`.
2. **Page** : `pages/<slug>/<slug>.html` qui importe les macros. Données de démo dans
   `_data/`.
3. **Itérer** en place ; pour comparer deux directions, ajouter une variante `v2-….html`.
4. **Validé** (`status: validated`) : porter dans l'app (React/Astro) en reprenant les
   classes Tailwind telles quelles, puis `implemented_in` + `status: implemented`.
5. **Promotion** en `reference/`.
6. Une maquette obsolète peut être supprimée : ce n'est pas un historique.
