import { describe, expect, it } from 'vitest';
import { circlesOverlap } from '../../src/core/geometry';

const circle = (x: number, y: number, radius = 10) => ({ x, y, radius });

describe('circlesOverlap', () => {
  it('overlaps when centers are closer than the sum of radii', () => {
    expect(circlesOverlap(circle(0, 0), circle(19, 0))).toBe(true);
  });

  it('just touching does not count as overlap', () => {
    expect(circlesOverlap(circle(0, 0), circle(20, 0))).toBe(false);
  });

  it('same center overlaps', () => {
    expect(circlesOverlap(circle(5, 5), circle(5, 5))).toBe(true);
  });

  it('works on diagonals', () => {
    expect(circlesOverlap(circle(0, 0), circle(14, 14))).toBe(true);
    expect(circlesOverlap(circle(0, 0), circle(15, 15))).toBe(false);
  });
});
