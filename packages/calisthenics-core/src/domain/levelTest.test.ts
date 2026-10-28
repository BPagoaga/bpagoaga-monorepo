import { describe, expect, it } from 'vite-plus/test';
import { getProgression } from '../content/progressions';
import { isFigureLocked, placements, recommendedFigure } from './levelTest';

describe('level test placements', () => {
  it('matches the thresholds of the data model', () => {
    const result = placements({ pull: 9, push: 32, dips: 14, core: 40 });
    expect(result['muscle-up']).toBe(2); // step 3/6: strict pull-up
    expect(result.hspu).toBe(2); // step 3/6: pike push-up
    expect(result['l-sit']).toBe(1); // step 2: tucked L-sit
    expect(result.handstand).toBe(0);
  });

  it('places beginners at the first step', () => {
    expect(placements({ pull: 0, push: 2, dips: 0, core: 10 })).toMatchObject({ 'muscle-up': 0, hspu: 0, 'l-sit': 0 });
  });

  it('recommends a figure and locks the planche below 20 dips', () => {
    const planche = getProgression('planche');
    expect(recommendedFigure({ pull: 9, push: 32, dips: 14, core: 40 })).toBe('muscle-up');
    expect(recommendedFigure({ pull: 2, push: 10, dips: 3, core: 15 })).toBe('handstand');
    expect(planche && isFigureLocked(planche, { pull: 9, push: 32, dips: 14, core: 40 })).toBe(true);
    expect(planche && isFigureLocked(planche, { pull: 9, push: 32, dips: 22, core: 40 })).toBe(false);
  });
});
