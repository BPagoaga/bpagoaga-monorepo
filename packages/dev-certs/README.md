# @bpagoaga/dev-certs

Certificat HTTPS local partagé par tous les serveurs de dev (`.certs/` à la racine, ignoré par git), créé au premier
lancement :

- avec [mkcert](https://github.com/FiloSottile/mkcert) s'il est installé → certificat reconnu par le navigateur ;
- sinon avec openssl → certificat auto-signé, à accepter une fois dans le navigateur.

```bash
brew install mkcert && mkcert -install   # une fois par machine
pnpm certs --force                       # régénère le certificat avec mkcert
```

| Usage                     | API                                                                    |
| ------------------------- | ---------------------------------------------------------------------- |
| App Vite / Astro          | `plugins: [devHttps()]` (Vite) ou `vite: { plugins: [devHttps()] }`    |
| Eleventy                  | `ensureDevCerts()` → `{ cert, key }` (chemins) pour `setServerOptions` |
| CLI (Storybook, scripts…) | `dev-certs [--force]`                                                  |
