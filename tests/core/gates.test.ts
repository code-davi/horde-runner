import { describe, expect, it } from 'vitest';
import { gateLabel, hitGate, isGoodGate, isShootable, type Gate } from '../../src/core/gates';

function hitTimes(gate: Gate, times: number): Gate {
  return Array.from({ length: times }).reduce<Gate>((current) => hitGate(current), gate);
}

describe('hitGate', () => {
  it('a -8 gate hit 10 times becomes +2', () => {
    expect(hitTimes({ kind: 'sum', value: -8 }, 10)).toEqual({ kind: 'sum', value: 2 });
  });

  it('does not change multiply gates', () => {
    const gate: Gate = { kind: 'multiply', value: 2 };

    expect(hitGate(gate)).toEqual(gate);
  });

  it('does not mutate the original gate', () => {
    const gate: Gate = { kind: 'sum', value: -3 };

    hitGate(gate);

    expect(gate).toEqual({ kind: 'sum', value: -3 });
  });
});

describe('isShootable', () => {
  it('only sum gates can be shot', () => {
    expect(isShootable({ kind: 'sum', value: -4 })).toBe(true);
    expect(isShootable({ kind: 'multiply', value: 2 })).toBe(false);
    expect(isShootable({ kind: 'divide', value: 2 })).toBe(false);
    expect(isShootable({ kind: 'weapon' })).toBe(false);
    expect(isShootable({ kind: 'knight' })).toBe(false);
  });
});

describe('isGoodGate', () => {
  it('positive sums, multipliers, weapon and knight gates are good', () => {
    expect(isGoodGate({ kind: 'sum', value: 1 })).toBe(true);
    expect(isGoodGate({ kind: 'multiply', value: 2 })).toBe(true);
    expect(isGoodGate({ kind: 'weapon' })).toBe(true);
    expect(isGoodGate({ kind: 'knight' })).toBe(true);
  });

  it('zero or negative sums and dividers are not good', () => {
    expect(isGoodGate({ kind: 'sum', value: 0 })).toBe(false);
    expect(isGoodGate({ kind: 'sum', value: -1 })).toBe(false);
    expect(isGoodGate({ kind: 'divide', value: 2 })).toBe(false);
  });
});

describe('gateLabel', () => {
  it('shows each gate the way the player reads it', () => {
    expect(gateLabel({ kind: 'sum', value: -8 })).toBe('-8');
    expect(gateLabel({ kind: 'sum', value: 5 })).toBe('+5');
    expect(gateLabel({ kind: 'sum', value: 0 })).toBe('+0');
    expect(gateLabel({ kind: 'multiply', value: 3 })).toBe('x3');
    expect(gateLabel({ kind: 'divide', value: 2 })).toBe('÷2');
    expect(gateLabel({ kind: 'weapon' })).toBe('Arma +1');
    expect(gateLabel({ kind: 'knight' })).toBe('+1 Cavaleiro');
  });
});
