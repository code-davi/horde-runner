import { describe, expect, it } from 'vitest';
import { HORDE_WAVE_SPREAD, MAX_HORDE_SPAWNS_PER_CHUNK } from '../../src/core/balance';
import { fillHorde, fillTemplate } from '../../src/core/chunkTemplates';
import type { Gate } from '../../src/core/gates';
import { createRng } from '../../src/core/rng';

function gatesFrom(
  template: 'lesserEvil' | 'obstacleCorridor',
  troop: number,
  runs: number,
): Gate[] {
  const rng = createRng(4);
  return Array.from({ length: runs }, () =>
    fillTemplate(template, { index: 10, troopCount: troop }, rng),
  )
    .flatMap((content) => content.gates)
    .map((placement) => placement.gate);
}

describe('negative gates scale with the troop', () => {
  it('with 500 heroes every -N removes at least 10% of the troop', () => {
    const negatives = gatesFrom('obstacleCorridor', 500, 300).filter(
      (gate) => gate.kind === 'sum' && gate.value < 0,
    );

    expect(negatives.length).toBeGreaterThan(0);
    negatives.forEach((gate) => expect(gate.kind === 'sum' && gate.value).toBeLessThanOrEqual(-50));
  });

  it('with a tiny troop -N still follows the distance range', () => {
    const negatives = gatesFrom('obstacleCorridor', 2, 300).filter((gate) => gate.kind === 'sum');

    negatives.forEach((gate) =>
      expect(gate.kind === 'sum' && gate.value).toBeGreaterThanOrEqual(-13),
    );
  });

  it('can generate divide-by-3 gates', () => {
    const dividers = gatesFrom('lesserEvil', 100, 300).filter((gate) => gate.kind === 'divide');

    expect(dividers.some((gate) => gate.kind === 'divide' && gate.value === 3)).toBe(true);
    expect(dividers.some((gate) => gate.kind === 'divide' && gate.value === 2)).toBe(true);
  });
});

describe('fillHorde', () => {
  it('caps the horde size for giant troops (review: generation must not grow with the troop)', () => {
    const started = performance.now();

    const spawns = fillHorde({ index: 20, troopCount: 1e9 }, createRng(1));

    expect(spawns.length).toBeLessThanOrEqual(MAX_HORDE_SPAWNS_PER_CHUNK);
    expect(performance.now() - started).toBeLessThan(50);
  });

  it('groups the horde into at most 3 waves', () => {
    const rng = createRng(21);

    for (let run = 0; run < 50; run++) {
      const offsets = fillHorde({ index: 12, troopCount: 300 }, rng)
        .map((spawn) => spawn.offset)
        .sort((a, b) => a - b);
      const gaps = offsets.slice(1).filter((offset, i) => offset - offsets[i]! > HORDE_WAVE_SPREAD);

      expect(gaps.length).toBeLessThanOrEqual(2);
    }
  });

  it('sends more strong enemies to a bigger troop', () => {
    const strongShare = (troop: number): number => {
      const spawns = Array.from({ length: 200 }, (_, run) =>
        fillHorde({ index: 20, troopCount: troop }, createRng(run)),
      ).flat();
      return spawns.filter((spawn) => spawn.kind === 'strong').length / spawns.length;
    };

    expect(strongShare(2000)).toBeGreaterThan(strongShare(10));
  });
});
