# BPagoaga

Monorepo personnel — [Turborepo](https://turborepo.com) + pnpm workspaces, outillage [Vite+](https://viteplus.dev).

| Workspace                                              | Stack               | Rôle                                                                       |
| ------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------- |
| [`apps/portfolio`](apps/portfolio)                     | Astro               | CV en ligne                                                                |
| [`apps/calisthenics`](apps/calisthenics)               | React + Vite+       | Calisthénie / street workout : tutoriels, performances, journal de séances |
| [`apps/calisthenics-mobile`](apps/calisthenics-mobile) | Expo + React Native | App mobile de calisthénie (iOS / Android), publiée avec EAS                |
| [`apps/mockups`](apps/mockups)                         | Eleventy            | Maquettes des deux apps, sur les vrais tokens du design system             |
| [`packages/ui`](packages/ui)                           | Tailwind CSS v4     | Design system (tokens + styles de base), documenté dans Storybook          |
| [`packages/ui-native`](packages/ui-native)             | React Native        | Composants React Native sur les tokens de `packages/ui`                    |
| [`packages/dev-certs`](packages/dev-certs)             | Node                | Certificat HTTPS local des serveurs de dev                                 |

## Démarrer

Prérequis : Node ≥ 24 et pnpm (fourni par Vite+, version fixée par `packageManager`).

```bash
pnpm install
pnpm dev:mockups        # https://localhost:8080
pnpm dev:portfolio      # https://localhost:4321
pnpm dev:calisthenics   # https://localhost:5173
pnpm storybook          # https://localhost:6006 (design system)
pnpm dev:mobile         # Expo : QR code pour Expo Go, ou i / a pour simulateur / émulateur
```

Tous les serveurs de dev sont en HTTPS, avec un certificat local partagé (`.certs/`) créé au premier lancement. Pour
éviter l'avertissement du navigateur, installer [mkcert](https://github.com/FiloSottile/mkcert) une fois puis régénérer
le certificat :

```bash
brew install mkcert && mkcert -install
pnpm certs --force
```

## Commandes

```bash
pnpm build          # build de toutes les apps (Turborepo, avec cache)
pnpm lint           # Oxlint via vp lint
pnpm check-types    # tsc / astro check
pnpm fmt            # Oxfmt via vp fmt
```

## Design system

Les tokens vivent dans [`packages/ui/src/theme.css`](packages/ui/src/theme.css) (bloc `@theme` Tailwind v4). Chaque app
importe `@bpagoaga/ui/styles.css` depuis son CSS d'entrée. La palette Tailwind par défaut est désactivée : seuls les
tokens existent. Aperçu : `pnpm storybook` (section _Fondations_, générée depuis `theme.css`) ou page _Design tokens_ du
catalogue de mockups.

## Agents

Consignes pour les agents de code : [`AGENTS.md`](AGENTS.md). Skills Claude Code dans [`.claude/skills`](.claude/skills) :
`mockup`, `fix-react-deps`, `resolve-pnpm-audit`.
