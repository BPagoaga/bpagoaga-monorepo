# CaliBuddy — app web

App de calisthénie : test de niveau, programme de la semaine, séances, journal, tableau de bord et tutoriels en
progressions. Implémentée à partir des maquettes validées MOCK-200 à 206 (`apps/mockups`). Elle sera publiée sur
training.bernardpagoaga.net.

## Données

Pas de compte ni de serveur en v1 : tout est dans IndexedDB, dans le navigateur. Le modèle est décrit dans
[`docs/data-model.md`](docs/data-model.md).

- **Contenu** (exercices, progressions, test de niveau, modèles par défaut) : `src/content/`, versionné avec l'app.
- **Données de l'utilisateur** : `src/db/` (une fonction par lecture ou écriture, avec `idb`), exposées aux écrans par
  les hooks React Query de `src/queries/` (un dossier par domaine).
- **Calculs** (records, volume, semaine, critères de passage, placement du test) : fonctions pures dans
  `src/domain/`, testées unitairement.
- **Sauvegarde** : Journal › Exporter / Importer (JSON validé avec zod). C'est la seule copie des données : à faire
  de temps en temps.

## Écrans

| Route                    | Écran                                  | Maquette    |
| ------------------------ | -------------------------------------- | ----------- |
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

Écarts assumés par rapport aux maquettes : « Importer » remplace « Filtrer » dans le journal (sauvegarde des données
locales) ; les exercices d'un modèle se réordonnent avec des boutons monter / descendre (pas de glisser-déposer seul,
WCAG 2.5.7) ; la vidéo des fiches est un emplacement tant que les démonstrations n'existent pas ; un écran de fin de
séance propose de valider les étapes dont le critère est atteint.

## Commandes

Depuis la racine : `pnpm dev:calisthenics` (https://localhost:5173), `pnpm --filter @bpagoaga/calisthenics test`,
`pnpm --filter @bpagoaga/calisthenics build`.
