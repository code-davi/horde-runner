import { describe, expect, it } from 'vitest';
import { laneAt } from '../../src/core/lanes';

describe('laneAt', () => {
  it('everything left of the split is the left lane', () => {
    expect(laneAt(0)).toBe('left');
    expect(laneAt(359.9)).toBe('left');
  });

  it('the split itself and everything right of it is the right lane', () => {
    expect(laneAt(360)).toBe('right');
    expect(laneAt(720)).toBe('right');
  });
});
