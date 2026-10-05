import { describe, expect, it } from 'vitest';
import {
  addCharge,
  beamBossDamage,
  beamCovers,
  initialBeam,
  isBeamActive,
  killCharge,
  markBossHit,
  tickBeam,
  type BeamState,
} from '../../src/core/beam';

const charged = (charge: number): BeamState => ({ ...initialBeam, charge });

describe('killCharge', () => {
  it('fills the bar after two whole hordes', () => {
    expect(killCharge('common', 20)).toBe(1 / 40);
    expect(killCharge('strong', 20)).toBe(8 / 40);
  });
});

describe('addCharge', () => {
  it('accumulates charge below a full bar', () => {
    const state = addCharge(initialBeam, 0.4, false);

    expect(state.charge).toBeCloseTo(0.4);
    expect(isBeamActive(state)).toBe(false);
  });

  it('fires the beam as soon as the bar is full', () => {
    const state = addCharge(charged(0.9), 0.2, false);

    expect(isBeamActive(state)).toBe(true);
    expect(state).toMatchObject({ charge: 0, remainingMs: 1500 });
  });

  it('fires after two whole hordes even when the float sum lands just below 1', () => {
    // Uma horda de orçamento 23 (trecho 2) abatida duas vezes: 46 × 1/46 soma 0,9999999999999994.
    const perKill = killCharge('common', 23);
    const rawSum = Array.from({ length: 46 }, () => perKill).reduce((sum, value) => sum + value, 0);
    let state = initialBeam;
    for (let kill = 0; kill < 46; kill++) state = addCharge(state, perKill, false);

    expect(rawSum).toBeLessThan(1);
    expect(isBeamActive(state)).toBe(true);
  });

  it('does not charge while the beam is firing', () => {
    const firing = addCharge(charged(0.9), 0.2, false);

    expect(addCharge(firing, 0.5, false)).toEqual(firing);
  });

  it('does not charge while the boss is present', () => {
    expect(addCharge(charged(0.5), 0.6, true)).toEqual(charged(0.5));
  });
});

describe('tickBeam', () => {
  it('keeps the beam for 1.5 s', () => {
    const firing = addCharge(charged(0.9), 0.2, false);

    expect(isBeamActive(tickBeam(firing, 1499))).toBe(true);
    expect(isBeamActive(tickBeam(firing, 1500))).toBe(false);
  });

  it('never counts below zero', () => {
    expect(tickBeam(initialBeam, 100).remainingMs).toBe(0);
  });
});

describe('beamCovers', () => {
  it('hits targets touching the 100 px column above the troop', () => {
    expect(beamCovers(300, { x: 350, y: 500, radius: 10 })).toBe(true);
    expect(beamCovers(300, { x: 361, y: 500, radius: 10 })).toBe(false);
  });

  it('stops at the top of the screen (review: it reached ~1400 px above it)', () => {
    expect(beamCovers(300, { x: 300, y: -50, radius: 10 })).toBe(false);
    expect(beamCovers(300, { x: 300, y: -5, radius: 10 })).toBe(true);
  });

  it('ignores targets that already reached the troop line', () => {
    expect(beamCovers(300, { x: 300, y: 1100, radius: 10 })).toBe(false);
  });
});

describe('beamBossDamage', () => {
  it('takes 25% of the max hp', () => {
    expect(beamBossDamage({ hp: 1000, maxHp: 1000 })).toBe(250);
  });

  it('never defeats the boss', () => {
    expect(beamBossDamage({ hp: 100, maxHp: 1000 })).toBe(99);
    expect(beamBossDamage({ hp: 1, maxHp: 1000 })).toBe(0);
  });
});

describe('markBossHit', () => {
  it('hits the boss once per beam', () => {
    const firing = addCharge(charged(0.9), 0.2, false);

    expect(markBossHit(firing).bossHit).toBe(true);
    expect(addCharge(tickBeam(markBossHit(firing), 1500), 1, false).bossHit).toBe(false);
  });
});
