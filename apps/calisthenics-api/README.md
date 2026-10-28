# CaliBuddy — API

L'API de CaliBuddy : comptes, programme, séances, progression. Node + [Hono](https://hono.dev), Postgres avec
[Drizzle](https://orm.drizzle.team), comptes avec [Better Auth](https://www.better-auth.com) (e-mail et mot de passe,
cookie de session).

## Démarrer

```bash
cp apps/calisthenics-api/.env.example apps/calisthenics-api/.env   # une fois
pnpm db:up        # Postgres 18 dans Docker (compose.yaml)
pnpm dev:api      # http://localhost:3000, rechargé à chaque modification
pnpm dev:calisthenics
```

Sans Docker : `pnpm --filter @bpagoaga/calisthenics-api dev:memory` lance l'API sur un Postgres en mémoire (PGlite).
Tout est perdu à l'arrêt.

La documentation interactive de l'API est sur http://localhost:3000/api/docs (Scalar), le document OpenAPI sur
`/api/openapi.json`. Pour l'essayer, connecte-toi d'abord dans l'app : le cookie de session suit.

## Organisation

| Dossier / fichier       | Rôle                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/db/schema.ts`      | Tables Drizzle de l'app (une ligne par utilisateur, listes ordonnées en `jsonb`)                     |
| `src/db/auth-schema.ts` | Tables de Better Auth (`user`, `session`, `account`, `verification`)                                 |
| `src/schemas.ts`        | Schémas zod des requêtes et réponses : validation, et source du document OpenAPI                     |
| `src/routes/`           | Une route = `createRoute` (contrat OpenAPI) + son handler, un fichier par domaine                    |
| `src/auth.ts`           | Configuration Better Auth ; chaque compte reçoit son profil, les modèles par défaut et une semaine   |
| `src/app.ts`            | Assemblage : `/api/auth/*`, garde de session, routes, `/api/docs`, erreurs `{ message }` en français |
| `drizzle/`              | Migrations SQL, appliquées au démarrage du serveur                                                   |
| `openapi.json`          | Le contrat, versionné : le client est généré à partir de lui                                         |

Le contenu (exercices, progressions) et les calculs (placement du test de niveau) viennent de
[`@bpagoaga/calisthenics-core`](../../packages/calisthenics-core), partagé avec l'app web.

## Faire évoluer l'API

1. **Une table change** : modifier `src/db/schema.ts`, puis `pnpm --filter @bpagoaga/calisthenics-api db:generate`
   écrit la migration dans `drizzle/` (à relire et versionner). Le serveur l'applique au prochain démarrage.
2. **Une route change** : modifier `src/schemas.ts` et `src/routes/`, puis depuis la racine `pnpm generate:api`
   régénère `openapi.json` et le client ([`@bpagoaga/calisthenics-api-client`](../../packages/calisthenics-api-client)).
   La CI échoue si l'un des deux n'est pas à jour.

## Commandes

| Commande             | Effet                                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| `dev` / `dev:memory` | Serveur de dev (Postgres de `.env`, ou en mémoire)                       |
| `test`               | Tests d'API sur un Postgres en mémoire (PGlite) : pas besoin de Docker   |
| `build` / `start`    | Bundle Node dans `dist/` (`vp pack`), puis `node dist/index.mjs`         |
| `openapi`            | Écrit `openapi.json`                                                     |
| `db:up` / `db:down`  | Démarre / arrête le Postgres de dev (les données restent dans un volume) |
| `db:generate`        | Nouvelle migration à partir du schéma                                    |
| `db:studio`          | Drizzle Studio, pour parcourir la base                                   |

## Variables d'environnement

Lues et validées au démarrage (`src/env.ts`), voir `.env.example` :

- `DATABASE_URL` : Postgres.
- `BETTER_AUTH_SECRET` : signe les cookies de session, 32 caractères minimum (`openssl rand -base64 32`).
- `BETTER_AUTH_URL` : l'origine publique que voit le navigateur (l'app, qui relaie `/api`).
- `TRUSTED_ORIGINS` (facultatif) : autres origines autorisées à appeler l'API avec un cookie (CORS).
- `PORT` : 3000 par défaut.

Pas encore d'envoi d'e-mails : ni vérification d'adresse ni mot de passe oublié (voir TASKS.md).
