import { describe, expect, it } from 'vitest';
import { bossHp, bossPoints, bossWalkSpeed, enemyDef } from '../../src/core/enemies';

describe('enemyDef', () => {
  it('a strong enemy removes 20 heroes on contact', () => {
    expect(enemyDef('strong').heroesLost).toBe(20);
  });

  it('a common enemy removes 2 heroes and has 10 base hp', () => {
    expect(enemyDef('common')).toMatchObject({ heroesLost: 2, hp: 10 });
  });
});

describe('boss', () => {
  it('hp grows 60% per boss starting from 1000', () => {
    expect(bossHp(1)).toBeCloseTo(1600);
    expect(bossHp(2)).toBeCloseTo(2560);
  });

  it('walks at 35% of the base enemy walk speed', () => {
    expect(bossWalkSpeed()).toBeCloseTo(17.5);
  });

  it('is worth 500 points per boss number', () => {
    expect(bossPoints(3)).toBe(1500);
  });
});
