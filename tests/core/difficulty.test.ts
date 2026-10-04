import { describe, expect, it } from 'vitest';
import { threatBudget } from '../../src/core/balance';
import { bossNumberAt, isBossChunk, scrollSpeed, templateWeights } from '../../src/core/difficulty';

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

describe('templateWeights', () => {
  it('punitive templates do not appear at the start', () => {
    expect(templateWeights(1).lesserEvil).toBe(0);
    expect(templateWeights(1).obstacleCorridor).toBe(0);
  });

  it('reaches the late-game weights at chunk 30', () => {
    expect(templateWeights(30).classicPair).toBe(15);
    expect(templateWeights(30).lesserEvil).toBe(12);
  });

  it('stays at the late-game weights after chunk 30', () => {
    expect(templateWeights(100)).toEqual(templateWeights(30));
  });

  it('interpolates between start and end', () => {
    const weight = templateWeights(16).classicPair;

    expect(weight).toBeGreaterThan(15);
    expect(weight).toBeLessThan(30);
  });
});

describe('scrollSpeed', () => {
  it('starts at the base speed', () => {
    expect(scrollSpeed(1)).toBe(120);
  });

  it('caps at +50%', () => {
    expect(scrollSpeed(1000)).toBe(180);
  });
});

describe('threatBudget', () => {
  it('never decreases', () => {
    const budgets = Array.from({ length: 500 }, (_, i) => threatBudget(i + 1));

    budgets.slice(1).forEach((budget, i) => expect(budget).toBeGreaterThanOrEqual(budgets[i]!));
  });
});
