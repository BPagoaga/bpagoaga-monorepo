# Modèle de données — CaliBuddy (app web)

Modèle de `apps/calisthenics`, à partir des maquettes validées MOCK-200 à 206 : journal, tableau de bord, tutoriels,
programme et test de niveau. La v1 gardait tout dans IndexedDB ; depuis l'API (`apps/calisthenics-api`), les données de
l'utilisateur sont dans Postgres, par compte. Les formes (types de `@bpagoaga/calisthenics-core`) n'ont pas changé.

## Principes

1. **Deux sortes de données.**
   - Le **contenu** (exercices, progressions, test de niveau) est écrit dans le code
     (`packages/calisthenics-core/src/content/`), versionné et identique pour tout le monde.
   - Les **données de l'utilisateur** (séances, modèles, programme, résultats) vivent dans Postgres, derrière l'API,
     rattachées à son compte.
2. **Ce qui se calcule ne se stocke pas.** Records, volume hebdomadaire, régularité, statut d'une étape et progression
   d'un objectif sont dérivés des séances. On ne stocke que ce qui ne peut pas être recalculé : le placement initial du
   test de niveau, et les étapes validées.
3. **Unités fixes.**
   - Charge : kilogrammes.
   - Durée : secondes.
   - Dates : chaînes ISO 8601 (`2026-10-23T18:42:00.000Z`) ; jour du programme : `0` = lundi … `6` = dimanche.
   - Identifiants :
     - contenu : slugs lisibles (`traction-explosive`) ;
     - données de l'utilisateur : UUID générés par Postgres (`gen_random_uuid()`) ; les comptes ont les identifiants
       de Better Auth.
4. **Les écrans ne parlent qu'aux hooks générés.** L'API décrit ses routes en OpenAPI ; Orval en génère les types, les
   fonctions `fetch` et les hooks React Query (`@bpagoaga/calisthenics-api-client`).

## Mesure d'une série

Une seule forme couvre tous les exercices des maquettes : répétitions, temps tenu, lest, et une valeur par jambe.

```ts
type Measure = 'reps' | 'hold'; // hold : exercice tenu, mesuré en secondes (L-sit, hollow, front lever)

interface SetValue {
  reps?: number; // measure 'reps'
  seconds?: number; // measure 'hold'
  loadKg?: number; // lest ; absent ou 0 = poids du corps
  side?: 'left' | 'right'; // exercices unilatéraux (pistol squat) : une série par côté
}

interface Target {
  sets: number;
  reps?: number | 'max'; // « 4 × max »
  seconds?: number;
  loadKg?: number;
}
```

`Target` sert à la fois d'objectif dans un modèle de séance et de critère de passage d'une étape. Le libellé affiché
(« 3 × 5 · +20 kg », « 3 × 5 / jambe ») est calculé, jamais stocké.

## Contenu (dans le code)

```ts
type Family = 'push' | 'pull' | 'legs' | 'core' | 'skill';

interface Exercise {
  id: string; // 'traction-explosive'
  name: string;
  family: Family;
  level: 1 | 2 | 3 | 4 | 5;
  measure: Measure;
  unilateral: boolean; // pistol squat : objectif et saisie « / jambe »
  weightable: boolean; // le set logger propose le lest
  summary: string;
  cues: string[]; // « Exécution » de la fiche
  mistakes: { title: string; text: string }[];
  muscles: string[];
  equipment: string;
  video?: { url: string; label: string; durationSeconds: number };
}

interface Progression {
  id: string; // 'muscle-up'
  name: string; // « Vers le muscle-up »
  figureName: string; // « Muscle-up »
  family: Family;
  figure: boolean; // proposée comme figure objectif (muscle-up, front lever, handstand, planche)
  prerequisite?: { label: string; exerciseId: string; target: Target }; // planche : 20 dips
  steps: { exerciseId: string; criterion: Target }[];
}

interface LevelTestItem {
  id: 'pull' | 'push' | 'dips' | 'core';
  exerciseId: string; // tractions strictes, pompes, dips, hollow body hold
  cues: string[];
}

// Le test place une progression à une étape selon des seuils (voir « Questions ouvertes »).
interface LevelPlacement {
  progressionId: string;
  rule: (results: Record<LevelTestItem['id'], number>) => number; // index d'étape (0-based)
}
```

Le contenu de départ reprend celui des maquettes : 12 exercices, 4 progressions avec leurs étapes, 4 tests. Les
progressions par famille du test (Tirage, Poussée, Gainage) sont des progressions comme les autres. Celle du tirage est
« Vers le muscle-up ».

## Données de l'utilisateur (Postgres)

Tables Drizzle dans `apps/calisthenics-api/src/db/schema.ts`, migrations SQL dans `apps/calisthenics-api/drizzle/`.
Chaque table a une colonne `user_id` (suppression en cascade avec le compte) ; l'API filtre toujours par l'utilisateur
de la session.

| Table                                        | Clé                          | Contenu                                                                       |
| -------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| `user`, `session`, `account`, `verification` | `id`                         | Tables de Better Auth ; `user.name` est le prénom                             |
| `profiles`                                   | `user_id`                    | figure objectif, date de fin du premier lancement                             |
| `templates`                                  | `id`                         | modèles de séance ; `items` (exercices et objectifs, dans l'ordre) en `jsonb` |
| `programme_days`                             | `user_id`, `day_index` (0–6) | un modèle par jour, `null` = repos ; clé étrangère `on delete set null`       |
| `sessions`                                   | `id`                         | séances ; `exercises` (avec leurs séries) en `jsonb` ; une seule en cours     |
| `progress`                                   | `user_id`, `progression_id`  | étape courante ; `history` (passages d'étape) en `jsonb`                      |
| `level_tests`                                | `id`                         | résultats bruts de chaque test de niveau, en `jsonb`                          |

Les formes exposées par l'API sont celles des types de `@bpagoaga/calisthenics-core/domain/types` (rappelées
ci-dessous) : chaque schéma de réponse de l'API les `satisfies`, donc un écart casse la compilation.

```ts
interface Profile {
  firstName?: string; // « Salut Bernard » : le prénom donné à l'inscription
  goalProgressionId?: string; // figure objectif, choisie à la fin du test
  onboardedAt?: string; // absent = premier lancement (MOCK-200 v2)
}

interface SessionTemplate {
  id: string;
  name: string;
  items: { exerciseId: string; target: Target }[]; // dans l'ordre de la séance
  createdAt: string;
  updatedAt: string;
}

interface Programme {
  days: [Day, Day, Day, Day, Day, Day, Day]; // lundi → dimanche
}
type Day = { templateId: string } | null; // null = repos

interface Session {
  id: string;
  templateId?: string; // absent : séance libre, ou modèle supprimé depuis
  title: string; // copié du modèle au démarrage : renommer le modèle ne change pas l'historique
  startedAt: string;
  endedAt?: string; // absent = séance en cours (une seule à la fois)
  rpe?: number; // 6–10, ressenti global
  feeling?: 'great' | 'ok' | 'hard';
  notes?: string;
  exercises: {
    exerciseId: string;
    target?: Target; // objectif au moment de la séance (copié, pas référencé)
    sets: (SetValue & { rpe?: number; doneAt: string })[];
  }[];
}

interface ProgressionProgress {
  progressionId: string;
  currentStep: number; // index 0-based
  history: { step: number; reachedAt: string; source: 'level-test' | 'criterion' | 'manual'; sessionId?: string }[];
}

interface LevelTestResult {
  id: string;
  takenAt: string;
  results: Record<LevelTestItem['id'], number>; // reps, ou secondes pour 'core'
}
```

**Choix à noter**

- **Une séance est une ligne**, ses exercices et séries en `jsonb`. Une séance pèse quelques Ko, et l'API écrit chaque
  série dans une transaction qui verrouille la ligne (deux appuis rapides ne perdent pas de série).
- **Les modèles sont copiés dans la séance, pas référencés.** Modifier ou supprimer un modèle ne réécrit pas le journal
  (comme l'indique MOCK-203).
- **Un seul modèle par jour**, et la même semaine se répète. Pas de cycles en v1.
- **Une seule séance en cours** : celle dont `endedAt` est absent, garanti par un index unique partiel. Fermer
  l'onglet ne la perd pas, et elle se retrouve sur un autre appareil.
- **Un nouveau compte** reçoit son profil, les trois modèles par défaut et une semaine de repos (hook de création
  d'utilisateur de Better Auth).

## Données dérivées

Ces valeurs sont calculées à partir des séances, dans des sélecteurs testables (fonctions pures de
`@bpagoaga/calisthenics-core/domain`), côté client.

| Affiché sur                           | Calcul                                                                                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Records personnels (MOCK-200)         | Meilleure série par exercice. Répétitions max, ou temps max pour un exercice tenu, à charge égale ou supérieure. Les résultats du test de niveau comptent aussi. |
| Indicateurs (tractions max, L-sit…)   | Record du mois, comparé au record du mois précédent                                                                                                              |
| Volume hebdomadaire                   | Somme des répétitions des séances de la semaine (lundi → dimanche). Les exercices tenus n'y entrent pas.                                                         |
| Semaine du programme (MOCK-200, 203)  | Pour chaque jour : faite s'il y a une séance terminée ce jour-là, manquée si un modèle était prévu sur un jour passé sans séance, sinon prévue ou repos          |
| « 12 jours de régularité »            | Jours écoulés depuis la dernière séance prévue et manquée (ou depuis la première séance)                                                                         |
| Statut d'une étape (fiche, tutoriels) | Avant l'étape courante : maîtrisée. L'étape courante : en cours. Après : verrouillée. Hors progression : à découvrir ou en cours selon le journal.               |
| Critère de passage (MOCK-205)         | Une séance contient `criterion.sets` séries qui atteignent l'objectif. Quand c'est le cas, on propose de valider l'étape, ce qui écrit `progress`.               |
| Objectif figure en % (MOCK-200)       | `currentStep / steps.length` de la progression objectif                                                                                                          |

La validation d'étape est **proposée, pas automatique**. L'app détecte le critère atteint en fin de séance et demande
confirmation, parce qu'une répétition peut avoir été saisie mais mal exécutée.

## Accès aux données

```
packages/calisthenics-core/     contenu et calculs purs, partagés (web, API, mobile)
apps/calisthenics-api/
  src/schemas.ts                schémas zod des requêtes et réponses → document OpenAPI
  src/routes/                   une route OpenAPI + son handler, par domaine
  openapi.json                  le contrat, versionné
packages/calisthenics-api-client/
  src/generated/                modèles, fonctions fetch et hooks React Query (Orval)
apps/calisthenics/src/queries/  session (Better Auth) et fichier de sauvegarde, hors OpenAPI
```

- **React Query** : les hooks générés portent leurs clés (`getFetchSessionsQueryKey()`), et chaque mutation invalide les
  requêtes qu'elle modifie (`mutationInvalidates`). Une page qui s'ouvre juste après une mutation et dépend de son
  résultat met d'abord le cache à jour avec la réponse (`setQueryData`).
- **Sauvegarde** : « Exporter » (MOCK-202) produit un JSON `{ app: 'calibuddy', schemaVersion, exportedAt, data }`,
  le même format que la v1 locale : un ancien export s'importe dans un compte. L'import est validé par l'API et remplace
  toutes les données du compte, avec de nouveaux identifiants.

## Dépendances

| Besoin               | Choix                                    | Pourquoi                                                               |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| Serveur              | `hono` + `@hono/zod-openapi`             | Léger, typé ; les schémas zod valident et produisent l'OpenAPI         |
| Base de données      | Postgres + `drizzle-orm` (`postgres.js`) | Schéma en TypeScript, migrations SQL générées, requêtes typées         |
| Comptes              | `better-auth`                            | E-mail et mot de passe, sessions en base, adaptateur Drizzle           |
| Client               | `orval`                                  | Types, fonctions `fetch` et hooks React Query générés depuis l'OpenAPI |
| Cache / état serveur | `@tanstack/react-query` 5                | Convention du repo (AGENTS.md)                                         |
| Tests de l'API       | `@electric-sql/pglite`                   | Un vrai Postgres en mémoire : pas de Docker en CI                      |
| Routage              | `react-router` 8 (mode déclaratif)       | Des URL partageables (fiche exercice), pas de chargement côté serveur  |

## Questions ouvertes

1. **Vidéos des tutoriels.** Des liens vers des vidéos externes (le plus simple), ou des vidéos hébergées. Le champ
   `video.url` couvre les deux cas.
2. **E-mails.** Sans service d'envoi, pas de vérification d'adresse ni de mot de passe oublié.

Tranché depuis : les seuils du test de niveau sont dans `domain/levelTest.ts` (et ses tests) ; le set logger a un mode
durée ; le prénom est demandé à l'inscription.
