import { describe, expect, it } from 'vitest';
import { clampDelta } from '../../src/core/time';

describe('clampDelta', () => {
  it('keeps a normal frame delta', () => {
    expect(clampDelta(16)).toBe(16);
  });

  it('limits a huge delta after the app was in background', () => {
    expect(clampDelta(120_000)).toBe(50);
  });

  it('never returns a negative delta', () => {
    expect(clampDelta(-5)).toBe(0);
  });
});
