# @bpagoaga/ui

Design system partagé : tokens Tailwind CSS v4 et styles de base.

| Export                    | Contenu                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `@bpagoaga/ui/styles.css` | `tailwindcss` + tokens + couche `base` — à importer depuis le CSS d'entrée d'une app |
| `@bpagoaga/ui/theme.css`  | Les tokens seuls (bloc `@theme`)                                                     |

```css
/* apps/<app>/src/index.css */
@import '@bpagoaga/ui/styles.css';
```

## Tokens

- **Couleurs** : `primary`, `accent`, `neutral`, `green`, `orange`, `red`, `blue`, échelles 10 → 150 (100 = référence),
  en OKLCH. La palette Tailwind par défaut est désactivée (`--color-*: initial`).
- **Alias sémantiques** : `background`, `surface`, `surface-muted`, `border`, `foreground`, `muted`, `subtle`.
- **Typo** : `font-sans` (Inter), `font-display` (Space Grotesk), `font-mono` (JetBrains Mono) ; tailles `text-display`,
  `text-title-{xl,l,m,s}`, `text-body-{l,m,s,xs}` (interlignage et graisse inclus).
- **Élévations** : `shadow-elevation-{1,2,3}`. **Rayons** : `rounded-{sm…3xl}`.

Les polices ne sont pas embarquées : chaque app les charge (Google Fonts).
Aperçu de tous les tokens : `pnpm dev:mockups` → page _Design tokens_.
