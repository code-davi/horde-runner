import { describe, expect, it } from 'vitest';
import { weaponStats } from '../../src/core/weapons';

describe('weaponStats', () => {
  it('level 1 is the slingshot with 1 damage and 1 shot per second', () => {
    expect(weaponStats(1)).toEqual({ name: 'Estilingue', damage: 1, shotsPerSecond: 1 });
  });

  it('level 2 is the bow firing 1.5 shots per second', () => {
    expect(weaponStats(2)).toEqual({ name: 'Arco', damage: 1.5, shotsPerSecond: 1.5 });
  });

  it('level 5 is the cannon with 5 damage', () => {
    expect(weaponStats(5).damage).toBe(5);
  });

  it('levels above 5 keep the cannon and add 20% damage each', () => {
    expect(weaponStats(6)).toMatchObject({ name: 'Canhão +1', shotsPerSecond: 2 });
    expect(weaponStats(6).damage).toBeCloseTo(6);
    expect(weaponStats(7).damage).toBeCloseTo(7.2);
  });
});
