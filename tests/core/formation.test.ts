import { describe, expect, it } from 'vitest';
import { formationOffsets } from '../../src/core/formation';
import type { RenderUnit } from '../../src/core/troop';

const SPACING = 22;
const recruits = (count: number): RenderUnit[] =>
  Array.from({ length: count }, () => ({ tierIndex: 0, weight: 1 }));

describe('formationOffsets', () => {
  it('returns one offset per unit', () => {
    expect(formationOffsets(recruits(10), SPACING)).toHaveLength(10);
  });

  it('places the first unit at the center', () => {
    expect(formationOffsets(recruits(3), SPACING)[0]).toEqual({ x: 0, y: 0 });
  });

  it('keeps units from overlapping', () => {
    const offsets = formationOffsets(recruits(49), SPACING);

    const distances = offsets.flatMap((a, i) =>
      offsets.slice(i + 1).map((b) => Math.hypot(a.x - b.x, a.y - b.y)),
    );

    expect(Math.min(...distances)).toBeGreaterThanOrEqual(SPACING * 0.9);
  });

  it('keeps 49 units in a compact cluster', () => {
    const offsets = formationOffsets(recruits(49), SPACING);

    const radius = Math.max(...offsets.map((o) => Math.hypot(o.x, o.y)));

    expect(radius).toBeLessThan(SPACING * 8);
  });
});
