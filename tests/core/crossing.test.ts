import { describe, expect, it } from 'vitest';
import type { GatePlacement } from '../../src/core/chunks';
import { resolveRowCrossing } from '../../src/core/crossing';

const left: GatePlacement = { lane: 'left', row: 1, gate: { kind: 'sum', value: 5 } };
const right: GatePlacement = { lane: 'right', row: 1, gate: { kind: 'divide', value: 2 } };

describe('resolveRowCrossing', () => {
  it('applies the gate on the lane the troop is in', () => {
    expect(resolveRowCrossing([left], 100)).toBe(left);
  });

  it('applies nothing when the troop passes the empty lane', () => {
    expect(resolveRowCrossing([left], 360)).toBeNull();
  });

  it('picks exactly one gate when standing on the split', () => {
    expect(resolveRowCrossing([left, right], 359)).toBe(left);
    expect(resolveRowCrossing([left, right], 360)).toBe(right);
  });

  it('an empty row applies nothing', () => {
    expect(resolveRowCrossing([], 200)).toBeNull();
  });
});
