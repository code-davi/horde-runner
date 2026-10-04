import { describe, expect, it } from 'vitest';
import {
  addBossKill,
  addDistance,
  addKill,
  initialScore,
  totalScore,
} from '../../src/core/scoring';

describe('scoring', () => {
  it('sums meters, monster points and boss bonus', () => {
    let score = addDistance(initialScore, 250);
    score = addKill(score, 'common');
    score = addKill(score, 'strong');
    score = addBossKill(score, 1);

    expect(totalScore(score)).toBe(2 + 10 + 50 + 500);
  });

  it('accumulates fractional distance across frames', () => {
    let score = initialScore;
    for (let frame = 0; frame < 300; frame++) {
      score = addDistance(score, 0.5);
    }

    expect(totalScore(score)).toBe(1);
  });

  it('starts at zero', () => {
    expect(totalScore(initialScore)).toBe(0);
  });
});
