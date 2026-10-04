import { describe, expect, it } from 'vitest';
import type { Chunk, GatePlacement } from '../../src/core/chunks';
import type { TemplateKind } from '../../src/core/difficulty';
import { bestPathResult, violatedGuardrails } from '../../src/core/guardrails';

function chunk(index: number, template: TemplateKind, gates: GatePlacement[] = []): Chunk {
  return { index, template, gates, crate: null, enemies: [], bossNumber: null };
}

const minus = (value: number) => ({ kind: 'sum', value: -value }) as const;
const plus = (value: number) => ({ kind: 'sum', value }) as const;
const halve = { kind: 'divide', value: 2 } as const;
const double = { kind: 'multiply', value: 2 } as const;

describe('bestPathResult', () => {
  it('can dodge a lone bad gate through the empty lane', () => {
    const lone = chunk(9, 'loneGate', [{ lane: 'left', row: 0, gate: minus(4) }]);

    expect(bestPathResult(lone, 2)).toBe(2);
  });

  it('picks the lesser evil when both lanes are bad', () => {
    const pair = chunk(9, 'lesserEvil', [
      { lane: 'left', row: 0, gate: minus(4) },
      { lane: 'right', row: 0, gate: halve },
    ]);

    expect(bestPathResult(pair, 2)).toBe(1);
  });

  it('takes the best gate on each row in order', () => {
    const twoRows = chunk(9, 'classicPair', [
      { lane: 'left', row: 0, gate: plus(5) },
      { lane: 'right', row: 0, gate: double },
      { lane: 'left', row: 1, gate: minus(3) },
      { lane: 'right', row: 1, gate: minus(10) },
    ]);

    expect(bestPathResult(twoRows, 1)).toBe(3);
  });
});

describe('violatedGuardrails', () => {
  it('accepts a fair chunk', () => {
    const fair = chunk(10, 'classicPair', [
      { lane: 'left', row: 1, gate: plus(5) },
      { lane: 'right', row: 1, gate: minus(5) },
    ]);

    expect(violatedGuardrails([], fair)).toEqual([]);
  });

  it('rule 1: rejects a chunk where every path wipes out the expected troop', () => {
    const deadly = chunk(10, 'classicPair', [
      { lane: 'left', row: 1, gate: minus(25) },
      { lane: 'right', row: 1, gate: minus(30) },
    ]);

    expect(violatedGuardrails([], deadly)).toEqual([1]);
  });

  it('rule 2: a lesser-evil pair needs a negative sum gate that shots can improve', () => {
    const twoDividers = chunk(10, 'lesserEvil', [
      { lane: 'left', row: 1, gate: halve },
      { lane: 'right', row: 1, gate: halve },
    ]);

    expect(violatedGuardrails([], twoDividers)).toContain(2);
  });

  it('rule 3: no more than two punitive chunks in a row', () => {
    const history = [chunk(10, 'lesserEvil'), chunk(11, 'obstacleCorridor')];

    expect(violatedGuardrails(history, chunk(12, 'obstacleCorridor'))).toContain(3);
    expect(violatedGuardrails(history, chunk(12, 'hordeOnly'))).not.toContain(3);
  });

  it('rule 4: the chunk before a boss helps the player', () => {
    expect(violatedGuardrails([], chunk(7, 'hordeOnly'))).toContain(4);
    expect(violatedGuardrails([], chunk(7, 'weaponCrate'))).not.toContain(4);
  });

  it('rule 5: the first chunks only use simple templates with good lone gates', () => {
    expect(violatedGuardrails([], chunk(3, 'lesserEvil'))).toContain(5);

    const badLone = chunk(3, 'loneGate', [{ lane: 'left', row: 1, gate: minus(5) }]);
    expect(violatedGuardrails([], badLone)).toContain(5);
  });
});
