import { describe, expect, it } from 'vitest';
import { HERO_TIERS } from '../../src/core/balance';
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
    expect(applyGate(troop(1), { kind: 'sum', value: 5 }).count).toBe(6);
  });

  it('never goes below zero with a negative sum gate', () => {
    expect(applyGate(troop(5), { kind: 'sum', value: -8 }).count).toBe(0);
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

  it('knight gate adds 50 heroes', () => {
    expect(applyGate(troop(3), { kind: 'knight' }).count).toBe(53);
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
  it('shows 237 heroes as 4 knights followed by 37 recruits', () => {
    const units = renderUnits(237);

    expect(units).toEqual([
      ...Array.from({ length: 4 }, () => ({ tierIndex: 1, weight: 1 })),
      ...Array.from({ length: 37 }, () => ({ tierIndex: 0, weight: 1 })),
    ]);
  });

  it('shows nothing for an empty troop', () => {
    expect(renderUnits(0)).toEqual([]);
  });

  it('caps a giant troop at 120 units without losing heroes', () => {
    const units = renderUnits(2_000_000);

    expect(units.length).toBeLessThanOrEqual(120);
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

  it('a knight deals 50 recruits worth plus a 15% bonus', () => {
    expect(unitShotDamage(1, { tierIndex: 1, weight: 1 })).toBeCloseTo(57.5);
  });

  it('scales with weapon damage and unit weight', () => {
    expect(unitShotDamage(2, { tierIndex: 1, weight: 2 })).toBeCloseTo(1.5 * 50 * 1.15 * 2);
  });
});
