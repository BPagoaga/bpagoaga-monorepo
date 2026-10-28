# Modèle de données — CaliBuddy (app web)

Proposition pour la v1 de `apps/calisthenics`, à partir des maquettes validées MOCK-200 à 206. Elle couvre le journal,
le tableau de bord, les tutoriels, le programme et le test de niveau.

## Principes

1. **Deux sortes de données.**
   - Le **contenu** (exercices, progressions, test de niveau) est écrit dans le code (`src/content/`), versionné avec
     l'app et identique pour tout le monde.
   - Les **données de l'utilisateur** (séances, modèles, programme, résultats) vivent dans IndexedDB, dans son
     navigateur.
2. **Ce qui se calcule ne se stocke pas.** Records, volume hebdomadaire, régularité, statut d'une étape et progression
   d'un objectif sont dérivés des séances. On ne stocke que ce qui ne peut pas être recalculé : le placement initial du
   test de niveau, et les étapes validées.
3. **Unités fixes.**
   - Charge : kilogrammes.
   - Durée : secondes.
   - Dates : chaînes ISO 8601 (`2026-10-23T18:42:00.000Z`) ; jour du programme : `0` = lundi … `6` = dimanche.
   - Identifiants :
     - contenu : slugs lisibles (`traction-explosive`) ;
     - données de l'utilisateur : UUID (`crypto.randomUUID()`).
4. **Les écrans ne parlent pas à IndexedDB.** Ils passent par des hooks React Query qui appellent des fonctions de
   `src/db/`. Un backend pourra remplacer ces fonctions plus tard sans toucher aux écrans.

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

## Données de l'utilisateur (IndexedDB)

Base `calibuddy`, une version de schéma par migration. Les stores :

| Store        | Clé             | Index                     | Contenu                                                         |
| ------------ | --------------- | ------------------------- | --------------------------------------------------------------- |
| `profile`    | `'me'` (unique) | —                         | prénom, figure objectif, date de fin du premier lancement       |
| `templates`  | `id`            | `name`                    | modèles de séance                                               |
| `programme`  | `'current'`     | —                         | la semaine : un modèle ou repos par jour                        |
| `sessions`   | `id`            | `startedAt`, `templateId` | séances, avec leurs exercices et leurs séries (un document)     |
| `progress`   | `progressionId` | —                         | étape courante de chaque progression et historique des passages |
| `levelTests` | `id`            | `takenAt`                 | résultats bruts de chaque test de niveau passé                  |

```ts
interface Profile {
  id: 'me';
  firstName?: string; // « Salut Bernard » ; facultatif
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
  id: 'current';
  days: [Day, Day, Day, Day, Day, Day, Day]; // lundi → dimanche
}
type Day = { templateId: string } | null; // null = repos

interface Session {
  id: string;
  templateId?: string; // absent : séance libre ou refaite depuis une séance passée
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

- **Une séance est un seul document**, séries comprises. Le volume reste petit (une séance pèse quelques Ko), et
  l'écriture d'une série reste atomique.
- **Les modèles sont copiés dans la séance, pas référencés.** Modifier ou supprimer un modèle ne réécrit pas le journal
  (comme l'indique MOCK-203).
- **Un seul modèle par jour**, et la même semaine se répète. Pas de cycles en v1.
- **Une seule séance en cours** : celle dont `endedAt` est absent. Fermer l'onglet ne la perd pas.

## Données dérivées

Ces valeurs sont calculées à partir des séances, dans des sélecteurs testables (fonctions pures dans `src/domain/`).

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
src/
  content/          exercices, progressions, test de niveau (TypeScript, typé)
  domain/           calculs purs : libellés de Target, records, volume, semaine, critères (testés unitairement)
  db/
    schema.ts       ouverture de la base, version, migrations
    sessions.ts     getSessions, getSession, startSession, logSet, finishSession…
    templates.ts    …
    backup.ts       export / import JSON
  queries/
    sessions/       useFetchSessions, useFetchCurrentSession, SessionsQueryKeys, SessionsStaleTimeEnum
    templates/ …    (un dossier par domaine, conventions de AGENTS.md › React Query)
```

- **React Query** : les données locales ne changent que par nos propres mutations. Les requêtes ont donc
  `staleTime: Infinity`, et chaque mutation invalide les clés de son domaine.
- **Sauvegarde** : « Exporter » (MOCK-202) produit un JSON `{ app: 'calibuddy', schemaVersion, exportedAt, data }`.
  L'import valide le fichier avant d'écrire quoi que ce soit, et remplace les données après confirmation.
- **Persistance** : au premier lancement, appeler `navigator.storage.persist()` pour que le navigateur n'efface pas la
  base quand l'espace manque. Rappeler l'export de temps en temps, puisque c'est la seule sauvegarde.

## Dépendances proposées

| Besoin                 | Choix                              | Pourquoi                                                                                         |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| IndexedDB              | `idb` 8                            | Enveloppe typée en promesses, ~1 Ko. Six stores n'ont pas besoin du moteur de requêtes de Dexie. |
| Cache / état serveur   | `@tanstack/react-query` 5          | Convention du repo (AGENTS.md). Fera le lien avec un backend plus tard.                          |
| Validation de l'import | `zod` 4                            | Un fichier importé est une entrée non fiable.                                                    |
| Routage                | `react-router` 8 (mode déclaratif) | 7 écrans, des URL partageables (fiche exercice), pas besoin de chargement côté serveur.          |

## Questions ouvertes

1. **Seuils du test de niveau.** Proposition, cohérente avec les maquettes (9 tractions → étape 3/6, 32 pompes et
   14 dips → 3/6, 40 s de hollow → 2/5) :

   | Progression         | Étape 1 | Étape 2 | Étape 3                | Étape 4    |
   | ------------------- | ------- | ------- | ---------------------- | ---------- |
   | Muscle-up (tirage)  | 0       | 1–4     | 5–11 tractions         | 12+        |
   | Poussée (vers HSPU) | < 5     | 5–19    | 20+ pompes et 10+ dips | 40+ et 20+ |
   | L-sit (gainage)     | < 20 s  | 20–59 s | 60 s+                  | —          |

2. **Vidéos des tutoriels.** Des liens vers des vidéos externes (le plus simple en v1), ou des vidéos hébergées par toi.
   Le champ `video.url` couvre les deux cas.
3. **Saisie des exercices tenus.** Le set logger doit avoir un mode durée (déjà dans TASKS.md). Le modèle le gère déjà
   avec `seconds`.
4. **Prénom.** Pas d'écran pour le saisir dans les maquettes. Je propose une question au début du test de niveau ; sinon
   le tableau de bord dit simplement « Salut 👋 ».
