import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/rng';

const SAMPLES = 10_000;

function sample(count: number, draw: () => number): number[] {
  return Array.from({ length: count }, draw);
}

describe('createRng', () => {
  it('same seed gives same sequence', () => {
    const a = createRng(42);
    const b = createRng(42);

    expect(sample(100, () => a.next())).toEqual(sample(100, () => b.next()));
  });

  it('different seeds differ', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });

  it('next is in [0, 1)', () => {
    const rng = createRng(7);

    const values = sample(SAMPLES, () => rng.next());

    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });

  it('int is inclusive on both ends', () => {
    const rng = createRng(3);

    const values = new Set(sample(SAMPLES, () => rng.int(1, 3)));

    expect([...values].sort()).toEqual([1, 2, 3]);
  });

  it('pick returns an element of the list', () => {
    const rng = createRng(5);
    const items = ['a', 'b', 'c'] as const;

    const picked = new Set(sample(1000, () => items.indexOf(rng.pick(items))));

    expect([...picked].sort()).toEqual([0, 1, 2]);
  });

  it('weighted never picks a zero weight', () => {
    const rng = createRng(11);

    const picks = new Set(Array.from({ length: 1000 }, () => rng.weighted({ a: 1, b: 0 })));

    expect([...picks]).toEqual(['a']);
  });

  it('weighted respects proportions', () => {
    const rng = createRng(13);
    const draws = 40_000;

    const picks = Array.from({ length: draws }, () => rng.weighted({ a: 3, b: 1 }));
    const share = picks.filter((key) => key === 'a').length / draws;

    expect(share).toBeGreaterThan(0.72);
    expect(share).toBeLessThan(0.78);
  });

  it('weighted throws when all weights are zero', () => {
    const rng = createRng(17);

    expect(() => rng.weighted({ a: 0, b: 0 })).toThrow();
  });
});
