import { describe, expect, it } from 'vitest';
import { fitScale } from '../../src/game/views/text';

describe('fitScale', () => {
  it('keeps text that already fits at full size', () => {
    expect(fitScale(150, 200)).toBe(1);
  });

  it('shrinks text that is wider than the space', () => {
    expect(fitScale(280, 196)).toBeCloseTo(0.7);
  });
});
