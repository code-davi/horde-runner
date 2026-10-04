import { describe, expect, it } from 'vitest';
import { parseUrlOptions } from '../../src/game/urlOptions';

describe('parseUrlOptions', () => {
  it('reads the seed and the debug flag', () => {
    expect(parseUrlOptions('?seed=123&debug', 7)).toEqual({ seed: 123, debug: true });
  });

  it('falls back to the given seed without parameters', () => {
    expect(parseUrlOptions('', 7)).toEqual({ seed: 7, debug: false });
  });

  it('ignores a seed that is not a number', () => {
    expect(parseUrlOptions('?seed=abc', 7).seed).toBe(7);
  });
});
