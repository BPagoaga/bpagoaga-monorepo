# CaliBuddy — app web

App de calisthénie : test de niveau, programme de la semaine, séances, journal, tableau de bord et tutoriels en
progressions. Implémentée à partir des maquettes validées MOCK-200 à 206 (`apps/mockups`). Elle sera publiée sur
training.bernardpagoaga.net.

## Données

Les données vivent sur le serveur : l'API [`apps/calisthenics-api`](../calisthenics-api/README.md) (Hono, Postgres),
avec un compte par personne (e-mail et mot de passe). Le modèle est décrit dans [`docs/data-model.md`](docs/data-model.md).

- **Contenu** (exercices, progressions, test de niveau, modèles par défaut) et **calculs** (records, volume, semaine,
  critères de passage, placement du test) : le package partagé
  [`@bpagoaga/calisthenics-core`](../../packages/calisthenics-core) (`content/`, `domain/`), aussi utilisé par l'API.
- **Appels à l'API** : modèles, fonctions et hooks React Query générés par Orval dans
  [`@bpagoaga/calisthenics-api-client`](../../packages/calisthenics-api-client), importés tels quels par les écrans.
  Chaque mutation rafraîchit les requêtes qu'elle modifie. `src/queries/` ne garde que ce qui n'est pas dans
  l'OpenAPI : la session (Better Auth) et la sauvegarde (fichier JSON).
- **Connexion** : `src/queries/auth` (client Better Auth), `RequireAuth` protège les routes ; sans session, tout mène à
  `/connexion?retour=…`.
- **Sauvegarde** : Journal › Exporter / Importer. Un export de l'ancienne version locale (IndexedDB) s'importe dans un
  compte.

## Écrans

| Route                    | Écran                                  | Maquette    |
| ------------------------ | -------------------------------------- | ----------- |
| `/connexion`             | Connexion (`?retour=<chemin>`)         | MOCK-207    |
| `/inscription`           | Création de compte                     | MOCK-207 v2 |
| `/`                      | Tableau de bord, ou premier lancement  | MOCK-200    |
| `/bienvenue/test`        | Test de niveau                         | MOCK-206    |
| `/bienvenue/resultats`   | Résultats et choix de la figure        | MOCK-206 v2 |
| `/seance/nouvelle`       | Démarrer une séance (`?exercice=<id>`) | MOCK-204    |
| `/seance`                | Séance en cours                        | MOCK-202 v2 |
| `/seance/fin`            | Fin de séance, critères atteints       | —           |
| `/journal`               | Journal (séance en cours à côté en xl) | MOCK-202    |
| `/programme`             | Programme et modèles                   | MOCK-203    |
| `/programme/modeles/:id` | Édition d'un modèle (`nouveau`)        | MOCK-203 v2 |
| `/tutoriels`             | Progression en cours et bibliothèque   | MOCK-201    |
| `/tutoriels/:exerciseId` | Fiche exercice                         | MOCK-205    |

Écarts assumés par rapport aux maquettes : « Importer » remplace « Filtrer » dans le journal (sauvegarde, et reprise des
exports de la version locale) ; la déconnexion est dans la barre latérale (lg) et dans le journal (mobile) en attendant
un écran Profil ; les exercices d'un modèle se réordonnent avec des boutons monter / descendre (pas de glisser-déposer seul,
WCAG 2.5.7) ; la vidéo des fiches est un emplacement tant que les démonstrations n'existent pas ; un écran de fin de
séance propose de valider les étapes dont le critère est atteint.

## Commandes

Depuis la racine, avec l'API lancée (voir son README) :

```bash
pnpm dev:calisthenics
```

L'app est servie sur https://localhost:5173 ; `vp dev` et `vp preview` relaient `/api` vers l'API
(`http://localhost:3000`, ou `API_PROXY_TARGET`). En production, le plus simple est la même chose : l'app et l'API
sur la même origine, `/api` relayé vers l'API. Une API sur une autre origine se donne avec `VITE_API_URL` au build,
mais demande aussi `TRUSTED_ORIGINS` côté API et des cookies `SameSite=None` (à régler au déploiement).

`pnpm --filter @bpagoaga/calisthenics build` construit l'app ; les tests du domaine sont dans le package core.
