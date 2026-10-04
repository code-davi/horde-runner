import { describe, expect, it } from 'vitest';
import { bossHp, bossPoints, enemyDef } from '../../src/core/enemies';

describe('enemyDef', () => {
  it('a strong enemy removes 5 heroes on contact', () => {
    expect(enemyDef('strong').heroesLost).toBe(5);
  });

  it('a common enemy removes 1 hero and has 6 hp', () => {
    expect(enemyDef('common')).toMatchObject({ heroesLost: 1, hp: 6 });
  });
});

describe('boss', () => {
  it('hp grows 60% per boss starting from 800', () => {
    expect(bossHp(1)).toBeCloseTo(1280);
    expect(bossHp(2)).toBeCloseTo(2048);
  });

  it('is worth 500 points per boss number', () => {
    expect(bossPoints(3)).toBe(1500);
  });
});
