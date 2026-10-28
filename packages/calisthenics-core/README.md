# @bpagoaga/calisthenics-core

Ce que l'app web, l'API (et plus tard l'app mobile) de CaliBuddy partagent, en TypeScript sans dépendance :

- `content/` : exercices, progressions, test de niveau, modèles de séance par défaut ;
- `domain/` : types du modèle de données et calculs purs (records, volume, semaine, critères de passage, placement du
  test de niveau), testés avec `pnpm --filter @bpagoaga/calisthenics-core test`.

Import par sous-chemin : `@bpagoaga/calisthenics-core/domain/records`, `@bpagoaga/calisthenics-core/content/exercises`.
Le package publie ses sources : chaque app les compile avec son bundler.
