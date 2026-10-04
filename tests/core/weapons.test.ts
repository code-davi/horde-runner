import { describe, expect, it } from 'vitest';
import { weaponStats } from '../../src/core/weapons';

describe('weaponStats', () => {
  it('level 1 is the slingshot with 1 damage and 1 shot per second', () => {
    expect(weaponStats(1)).toEqual({ name: 'Estilingue', damage: 1, shotsPerSecond: 1 });
  });

  it('level 2 is the bow firing 2 shots per second', () => {
    expect(weaponStats(2)).toEqual({ name: 'Arco', damage: 1.5, shotsPerSecond: 2 });
  });

  it('level 5 is the cannon with 5 damage', () => {
    expect(weaponStats(5).damage).toBe(5);
  });

  it('levels above 5 keep the cannon and multiply damage by 1.5 each', () => {
    expect(weaponStats(6)).toEqual({ name: 'Canhão +1', damage: 7.5, shotsPerSecond: 3 });
    expect(weaponStats(7).damage).toBe(11.25);
  });
});
