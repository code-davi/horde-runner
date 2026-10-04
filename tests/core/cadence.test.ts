import { describe, expect, it } from 'vitest';
import { advanceCadence, staggeredStart } from '../../src/core/cadence';

describe('advanceCadence', () => {
  it('fires nothing before the interval is reached', () => {
    expect(advanceCadence(0, 400, 1000)).toEqual({ shots: 0, elapsedMs: 400 });
  });

  it('fires once and keeps the leftover time', () => {
    expect(advanceCadence(900, 150, 1000)).toEqual({ shots: 1, elapsedMs: 50 });
  });

  it('fires several shots when a frame spans several intervals', () => {
    expect(advanceCadence(0, 50, 20)).toEqual({ shots: 2, elapsedMs: 10 });
  });
});

describe('staggeredStart', () => {
  it('keeps every start inside one interval', () => {
    const starts = Array.from({ length: 50 }, (_, i) => staggeredStart(i, 500));

    expect(Math.min(...starts)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...starts)).toBeLessThan(500);
  });

  it('spreads neighbours apart so units do not fire in sync', () => {
    expect(staggeredStart(0, 1000)).not.toBe(staggeredStart(1, 1000));
  });

  it('is deterministic', () => {
    expect(staggeredStart(7, 333)).toBe(staggeredStart(7, 333));
  });
});
