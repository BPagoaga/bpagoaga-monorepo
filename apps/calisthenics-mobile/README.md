# @bpagoaga/calisthenics-mobile

App mobile (iOS / Android) de calisthénie : [Expo](https://docs.expo.dev) SDK 58, React Native, Expo Router. Les
composants viennent de [`@bpagoaga/ui-native`](../../packages/ui-native), construit sur les tokens de `@bpagoaga/ui`.

## Développer

```bash
pnpm dev:mobile                                         # serveur Metro (QR code → Expo Go, ou i / a / w)
pnpm --filter @bpagoaga/calisthenics-mobile ios         # simulateur iOS
pnpm --filter @bpagoaga/calisthenics-mobile android     # émulateur Android
```

Expo Go suffit tant que l'app n'utilise que des modules natifs inclus dans Expo Go. Au-delà, installer un
_development build_ (profil EAS `development` ou `development-simulator`, voir plus bas).

Vérifications : `lint` (Oxlint), `check-types` (tsc), `build` (`expo export` iOS + Android, ce que fait la CI) et
`doctor` (expo-doctor : versions et doublons de modules natifs).

## Publier avec EAS

La config est dans [`eas.json`](eas.json) ; toutes les commandes se lancent **depuis ce dossier**.

| Profil                  | Usage                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| `development`           | Development build (expo-dev-client), distribution interne             |
| `development-simulator` | Idem, pour le simulateur iOS                                          |
| `preview`               | Build de test interne (APK sur Android)                               |
| `production`            | Build stores, numéro de build incrémenté par EAS (`appVersionSource`) |

Une seule fois, avec un compte Expo :

```bash
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest init        # crée le projet EAS, ajoute owner + extra.eas.projectId à app.json
```

Ensuite :

```bash
pnpm dlx eas-cli@latest build --profile preview --platform all
pnpm dlx eas-cli@latest build --profile production --platform all
pnpm dlx eas-cli@latest submit --profile production --platform ios   # TestFlight / App Store Connect
```

Identifiants : `net.bernardpagoaga.calisthenics` (iOS `bundleIdentifier`, Android `package`). La version affichée est
`expo.version` dans `app.json` ; les numéros de build sont gérés à distance par EAS.
