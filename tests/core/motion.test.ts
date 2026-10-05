import { describe, expect, it } from 'vitest';
import { approach, chaseVelocityX, clamp } from '../../src/core/motion';

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

describe('chaseVelocityX', () => {
  it('moves sideways toward the target at the chase speed', () => {
    expect(chaseVelocityX({ x: 200, y: 500 }, 300, 30)).toBe(30);
    expect(chaseVelocityX({ x: 300, y: 500 }, 200, 30)).toBe(-30);
  });

  it('does not chase before entering the screen', () => {
    expect(chaseVelocityX({ x: 200, y: -10 }, 300, 30)).toBe(0);
  });

  it('stops chasing at the troop line', () => {
    expect(chaseVelocityX({ x: 200, y: 1100 }, 300, 30)).toBe(0);
  });

  it('does not jitter when already lined up', () => {
    expect(chaseVelocityX({ x: 299, y: 500 }, 300, 30)).toBe(0);
  });
});
