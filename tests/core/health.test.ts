import { describe, expect, it } from 'vitest';
import { applyDamage, createHealth, healthRatio, isDepleted } from '../../src/core/health';

describe('health', () => {
  it('damage beyond the remaining hp stops at zero and depletes', () => {
    const health = applyDamage(createHealth(3), 5);

    expect(health.hp).toBe(0);
    expect(isDepleted(health)).toBe(true);
  });

  it('a fresh health is full and not depleted', () => {
    const health = createHealth(40);

    expect(healthRatio(health)).toBe(1);
    expect(isDepleted(health)).toBe(false);
  });

  it('ratio reflects the remaining hp', () => {
    expect(healthRatio(applyDamage(createHealth(40), 30))).toBe(0.25);
  });

  it('does not mutate the original health', () => {
    const health = createHealth(10);

    applyDamage(health, 4);

    expect(health.hp).toBe(10);
  });
});
