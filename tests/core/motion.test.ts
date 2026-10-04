import { describe, expect, it } from 'vitest';
import { approach, clamp } from '../../src/core/motion';

describe('approach', () => {
  it('moves toward the target by at most the step', () => {
    expect(approach(100, 200, 30)).toBe(130);
    expect(approach(200, 100, 30)).toBe(170);
  });

  it('stops exactly at the target instead of overshooting', () => {
    expect(approach(100, 110, 30)).toBe(110);
    expect(approach(110, 100, 30)).toBe(100);
  });

  it('stays put when already at the target', () => {
    expect(approach(50, 50, 30)).toBe(50);
  });
});

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(10, 80, 640)).toBe(80);
    expect(clamp(700, 80, 640)).toBe(640);
    expect(clamp(300, 80, 640)).toBe(300);
  });
});
