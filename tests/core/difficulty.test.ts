import { describe, expect, it } from 'vitest';
import {
  bossNumberAt,
  hordeBudget,
  isBossChunk,
  multiplyGateWeight,
  multiplyValues,
  pressureLevel,
  scrollSpeed,
  strongEnemyChance,
  templateWeights,
} from '../../src/core/difficulty';

describe('boss chunks', () => {
  it('every 8th chunk is a boss chunk', () => {
    expect(isBossChunk(8)).toBe(true);
    expect(isBossChunk(16)).toBe(true);
    expect(isBossChunk(7)).toBe(false);
    expect(isBossChunk(1)).toBe(false);
  });

  it('numbers bosses from 1', () => {
    expect(bossNumberAt(8)).toBe(1);
    expect(bossNumberAt(24)).toBe(3);
  });
});

describe('pressureLevel', () => {
  it('follows the hero tier milestones', () => {
    expect(pressureLevel(1)).toBe(0);
    expect(pressureLevel(49)).toBe(0);
    expect(pressureLevel(50)).toBe(1);
    expect(pressureLevel(249)).toBe(1);
    expect(pressureLevel(250)).toBe(2);
    expect(pressureLevel(1000)).toBe(3);
    expect(pressureLevel(2_000_000)).toBe(3);
  });

  it('makes strong enemies more common', () => {
    expect(strongEnemyChance(0)).toBe(0.25);
    expect(strongEnemyChance(3)).toBe(0.6);
  });
});

describe('templateWeights', () => {
  it('punitive templates do not appear at the start', () => {
    expect(templateWeights(1, 0).lesserEvil).toBe(0);
    expect(templateWeights(1, 3).obstacleCorridor).toBe(0);
  });

  it('reaches the late-game weights at chunk 30', () => {
    expect(templateWeights(30, 0).classicPair).toBe(15);
    expect(templateWeights(30, 0).lesserEvil).toBe(12);
  });

  it('multiplies only the punitive weights by the troop pressure', () => {
    expect(templateWeights(30, 3).lesserEvil).toBe(36);
    expect(templateWeights(30, 3).obstacleCorridor).toBe(36);
    expect(templateWeights(30, 3).classicPair).toBe(15);
  });

  it('stays at the late-game weights after chunk 30', () => {
    expect(templateWeights(100, 1)).toEqual(templateWeights(30, 1));
  });

  it('interpolates between start and end', () => {
    const weight = templateWeights(16, 0).classicPair;

    expect(weight).toBeGreaterThan(15);
    expect(weight).toBeLessThan(30);
  });
});

describe('hordeBudget', () => {
  it('uses only the distance while the troop is small', () => {
    expect(hordeBudget(1, 10)).toBe(18);
  });

  it('adds 25% of the troop once the pressure starts', () => {
    expect(hordeBudget(1, 500)).toBe(143);
  });

  it('never decreases along the run', () => {
    const budgets = Array.from({ length: 500 }, (_, i) => hordeBudget(i + 1, 30));

    budgets.slice(1).forEach((budget, i) => expect(budget).toBeGreaterThanOrEqual(budgets[i]!));
  });
});

describe('multiplier gates', () => {
  it('get rarer as the troop pressure grows', () => {
    expect(multiplyGateWeight(0)).toBe(1);
    expect(multiplyGateWeight(1)).toBe(1 / 2);
    expect(multiplyGateWeight(2)).toBe(1 / 3);
    expect(multiplyGateWeight(3)).toBe(1 / 4);
  });

  it('only double from 250 heroes on', () => {
    expect(multiplyValues(0)).toEqual([2, 3]);
    expect(multiplyValues(1)).toEqual([2, 3]);
    expect(multiplyValues(2)).toEqual([2]);
    expect(multiplyValues(3)).toEqual([2]);
  });
});

describe('scrollSpeed', () => {
  it('starts at 120 px/s', () => {
    expect(scrollSpeed(1)).toBe(120);
  });

  it('grows 2% per chunk', () => {
    expect(scrollSpeed(11)).toBeCloseTo(144);
  });

  it('caps at +50%', () => {
    expect(scrollSpeed(1000)).toBe(180);
  });
});
