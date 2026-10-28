# @bpagoaga/calisthenics-api-client

Client de l'API CaliBuddy généré par [Orval](https://orval.dev) à partir de
[`apps/calisthenics-api/openapi.json`](../../apps/calisthenics-api/openapi.json) :

- `src/generated/models/` : un type par schéma de l'API (`Session`, `Template`…) ;
- `src/generated/endpoints.ts` : une fonction `fetch` et un hook React Query par route (`useFetchSessions`,
  `useLogSet`…). Les mutations rafraîchissent elles-mêmes les requêtes qu'elles modifient (`mutationInvalidates` dans
  `orval.config.ts`) ;
- `src/apiFetch.ts` (écrit à la main) : l'URL de l'API (`setApiBaseUrl`), le cookie de session, et les erreurs en
  `ApiError` (`status`, `message` en français).

`src/generated/` ne se modifie jamais à la main. Après un changement de l'API, depuis la racine :

```bash
pnpm generate:api
```
