import { describe, expect, it } from 'vitest';
import {
  bossHp,
  bossPoints,
  bossReachedTroop,
  bossWalkSpeed,
  enemyDef,
  enemyHp,
} from '../../src/core/enemies';

describe('enemyDef', () => {
  it('a strong enemy removes 20 heroes on contact', () => {
    expect(enemyDef('strong').heroesLost).toBe(20);
  });

  it('a common enemy removes 2 heroes and has 10 base hp', () => {
    expect(enemyDef('common')).toMatchObject({ heroesLost: 2, hp: 10 });
  });
});

describe('size and chase', () => {
  it('a common enemy is the size of a recruit and chases slowly', () => {
    expect(enemyDef('common')).toMatchObject({ radius: 10, steer: 30 });
  });

  it('a strong enemy chases faster', () => {
    expect(enemyDef('strong').steer).toBe(45);
  });

  it('the boss reaches the troop once it gets to the troop line', () => {
    expect(bossReachedTroop(1099)).toBe(false);
    expect(bossReachedTroop(1100)).toBe(true);
  });
});

describe('enemyHp', () => {
  it('starts at the base hp on chunk 1', () => {
    expect(enemyHp('common', 1)).toBe(10);
    expect(enemyHp('strong', 1)).toBe(100);
  });

  it('grows 5% of the base hp per chunk', () => {
    expect(enemyHp('common', 11)).toBeCloseTo(15);
    expect(enemyHp('strong', 21)).toBeCloseTo(200);
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
