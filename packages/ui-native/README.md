# @bpagoaga/ui-native

Composants React Native construits sur les tokens de [`@bpagoaga/ui`](../ui) — même source de vérité que le web.

## Tokens

[`src/tokens.ts`](src/tokens.ts) est **généré** depuis `packages/ui/src/theme.css` par
[`scripts/generate-tokens.mjs`](scripts/generate-tokens.mjs) : couleurs OKLCH → hex (React Native ne connaît pas
OKLCH, conversion dans le gamut sRGB), rem → dp, alias sémantiques résolus, ombres en `boxShadow` CSS.

```bash
pnpm --filter @bpagoaga/ui-native tokens   # après chaque modification de theme.css
```

Le lint (`--check`) échoue si le fichier n'est plus à jour. Les noms reprennent ceux des classes web :

```tsx
import { colors, radii, shadows, space, typography } from '@bpagoaga/ui-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    boxShadow: shadows['elevation-2'],
    padding: space(4),
  },
  label: { ...typography['body-s'], color: colors.muted },
});
```

`space(n)` reprend la grille de 4 dp de Tailwind (`space(4)` = `p-4`).

## Polices

Inter, Space Grotesk et JetBrains Mono (`@expo-google-fonts/*`), dans les graisses chargées par le web.
`useUiFonts()` les charge (à appeler dans le layout racine, splash screen affiché en attendant) ; `fontFace(famille,
graisse)` donne le nom de la police chargée — React Native ne sait pas synthétiser une graisse d'une police custom.

## Composants

| Composant | Props principales                                                    |
| --------- | -------------------------------------------------------------------- |
| `Text`    | `variant` (token typo), `color` (token couleur), `family`, `weight`  |
| `Button`  | `label`, `variant` (`primary`, `accent`, `secondary`), hauteur ≥ 44  |
| `Card`    | `elevation` (1 à 3)                                                  |
| `Badge`   | `label`, `tone` (`primary`, `accent`, `neutral`, `green`, `orange`…) |

Le package est consommé en TypeScript source par Metro (pas de build). `react`, `react-native` et `expo-font` sont des
peer dependencies : leurs versions de dev doivent rester identiques à celles de l'app.
