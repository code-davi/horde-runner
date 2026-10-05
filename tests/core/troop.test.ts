import { describe, expect, it } from 'vitest';
import { HERO_TIERS } from '../../src/core/balance';
import { createSumGate } from '../../src/core/gates';
import {
  applyGate,
  initialTroop,
  isDefeated,
  renderUnits,
  takeHit,
  unitShotDamage,
  upgradeWeapon,
  type RenderUnit,
  type TroopState,
} from '../../src/core/troop';

const troop = (count: number): TroopState => ({ count, weaponLevel: 1 });

function representedHeroes(units: readonly RenderUnit[]): number {
  return units.reduce((sum, unit) => sum + HERO_TIERS[unit.tierIndex]!.value * unit.weight, 0);
}

describe('initialTroop', () => {
  it('starts with one recruit and the level 1 weapon', () => {
    expect(initialTroop).toEqual({ count: 1, weaponLevel: 1 });
  });
});

describe('applyGate', () => {
  it('adds heroes with a positive sum gate', () => {
    expect(applyGate(troop(1), createSumGate(5)).count).toBe(6);
  });

  it('never goes below zero with a negative sum gate', () => {
    expect(applyGate(troop(5), createSumGate(-8)).count).toBe(0);
  });

  it('multiplies heroes', () => {
    expect(applyGate(troop(7), { kind: 'multiply', value: 3 }).count).toBe(21);
  });

  it('divide gate rounds down', () => {
    expect(applyGate(troop(7), { kind: 'divide', value: 2 }).count).toBe(3);
  });

  it('divide gate can defeat a single hero', () => {
    const result = applyGate(troop(1), { kind: 'divide', value: 2 });

    expect(result.count).toBe(0);
    expect(isDefeated(result)).toBe(true);
  });

  it('weapon gate raises the weapon level and keeps the heroes', () => {
    expect(applyGate(troop(4), { kind: 'weapon' })).toEqual({ count: 4, weaponLevel: 2 });
  });

  it('knight gate adds exactly one knight worth of heroes (10)', () => {
    expect(applyGate(troop(3), { kind: 'knight' }).count).toBe(13);
  });
});

describe('takeHit and upgradeWeapon', () => {
  it('losing more heroes than the troop has leaves zero', () => {
    expect(takeHit(troop(3), 5).count).toBe(0);
  });

  it('upgradeWeapon raises the level by one', () => {
    expect(upgradeWeapon(troop(2)).weaponLevel).toBe(2);
  });
});

describe('renderUnits', () => {
  it('shows 237 heroes as 23 knights followed by 7 recruits', () => {
    const units = renderUnits(237);

    expect(units).toEqual([
      ...Array.from({ length: 23 }, () => ({ tierIndex: 1, weight: 1 })),
      ...Array.from({ length: 7 }, () => ({ tierIndex: 0, weight: 1 })),
    ]);
  });

  it('shows nothing for an empty troop', () => {
    expect(renderUnits(0)).toEqual([]);
  });

  it('caps a giant troop at 100 units without losing heroes', () => {
    const units = renderUnits(2_000_000);

    expect(units.length).toBeLessThanOrEqual(100);
    expect(representedHeroes(units)).toBe(2_000_000);
  });

  it('always represents exactly the troop count', () => {
    for (let count = 0; count <= 5000; count++) {
      expect(representedHeroes(renderUnits(count))).toBe(count);
    }
  });
});

describe('unitShotDamage', () => {
  it('a recruit with the slingshot deals 1', () => {
    expect(unitShotDamage(1, { tierIndex: 0, weight: 1 })).toBe(1);
  });

  it('a knight deals 10 recruits worth plus a 5% bonus', () => {
    expect(unitShotDamage(1, { tierIndex: 1, weight: 1 })).toBeCloseTo(10.5);
  });

  it('scales with weapon damage and unit weight', () => {
    expect(unitShotDamage(2, { tierIndex: 1, weight: 2 })).toBeCloseTo(1.5 * 10 * 1.05 * 2);
  });
});
