import { describe, expect, it } from 'vitest';
import {
  createSumGate,
  gateLabel,
  hitGate,
  isGoodGate,
  isShootable,
  type Gate,
} from '../../src/core/gates';

function hitTimes(gate: Gate, times: number): Gate {
  return Array.from({ length: times }).reduce<Gate>((current) => hitGate(current), gate);
}

describe('createSumGate', () => {
  it('caps a positive gate at twice its starting value', () => {
    expect(createSumGate(45)).toEqual({ kind: 'sum', value: 45, max: 90 });
  });

  it('lets small and negative gates grow up to +10', () => {
    expect(createSumGate(-8).max).toBe(10);
    expect(createSumGate(3).max).toBe(10);
  });
});

describe('hitGate', () => {
  it('a -8 gate hit 10 times becomes +2', () => {
    expect(hitTimes(createSumGate(-8), 10)).toMatchObject({ kind: 'sum', value: 2 });
  });

  it('stops at the cap no matter how many hits', () => {
    expect(hitTimes(createSumGate(-8), 30)).toMatchObject({ value: 10 });
    expect(hitTimes(createSumGate(45), 100)).toMatchObject({ value: 90 });
  });

  it('does not change multiply gates', () => {
    const gate: Gate = { kind: 'multiply', value: 2 };

    expect(hitGate(gate)).toEqual(gate);
  });

  it('does not mutate the original gate', () => {
    const gate = createSumGate(-3);

    hitGate(gate);

    expect(gate.kind === 'sum' && gate.value).toBe(-3);
  });
});

describe('isShootable', () => {
  it('only sum gates can be shot', () => {
    expect(isShootable(createSumGate(-4))).toBe(true);
    expect(isShootable({ kind: 'multiply', value: 2 })).toBe(false);
    expect(isShootable({ kind: 'divide', value: 2 })).toBe(false);
    expect(isShootable({ kind: 'weapon' })).toBe(false);
    expect(isShootable({ kind: 'knight' })).toBe(false);
  });
});

describe('isGoodGate', () => {
  it('positive sums, multipliers, weapon and knight gates are good', () => {
    expect(isGoodGate(createSumGate(1))).toBe(true);
    expect(isGoodGate({ kind: 'multiply', value: 2 })).toBe(true);
    expect(isGoodGate({ kind: 'weapon' })).toBe(true);
    expect(isGoodGate({ kind: 'knight' })).toBe(true);
  });

  it('zero or negative sums and dividers are not good', () => {
    expect(isGoodGate(createSumGate(0))).toBe(false);
    expect(isGoodGate(createSumGate(-1))).toBe(false);
    expect(isGoodGate({ kind: 'divide', value: 3 })).toBe(false);
  });
});

describe('gateLabel', () => {
  it('shows each gate the way the player reads it', () => {
    expect(gateLabel(createSumGate(-8))).toBe('-8');
    expect(gateLabel(createSumGate(5))).toBe('+5');
    expect(gateLabel(createSumGate(0))).toBe('+0');
    expect(gateLabel({ kind: 'multiply', value: 3 })).toBe('x3');
    expect(gateLabel({ kind: 'divide', value: 3 })).toBe('÷3');
    expect(gateLabel({ kind: 'weapon' })).toBe('Arma +1');
    expect(gateLabel({ kind: 'knight' })).toBe('+1 Cavaleiro');
  });
});
