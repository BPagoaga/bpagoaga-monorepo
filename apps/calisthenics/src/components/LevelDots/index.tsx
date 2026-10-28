import type { ILevelDots } from './types';

export type * from './types';

/** Difficulty 1–5 as five dashes; the label carries it for screen readers. */
const LevelDots = ({ level }: ILevelDots) => (
  <span className="flex gap-0.5" role="img" aria-label={`Niveau ${level} sur 5`}>
    {[1, 2, 3, 4, 5].map((dot) => (
      <span key={dot} className={`h-1.5 w-3 rounded-full ${dot <= level ? 'bg-accent-100' : 'bg-neutral-30'}`} />
    ))}
  </span>
);

export default LevelDots;
