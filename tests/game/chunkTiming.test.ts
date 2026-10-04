import { describe, expect, it } from 'vitest';
import {
  SPAWN_LOOKAHEAD_PX,
  advanceFrontier,
  shouldGenerateChunk,
} from '../../src/game/systems/chunkTiming';

describe('shouldGenerateChunk', () => {
  it('generates when the last chunk top is close to the screen', () => {
    expect(shouldGenerateChunk({ frontierY: -100, bossPending: false })).toBe(true);
  });

  it('waits while the last chunk is still far above the screen', () => {
    expect(shouldGenerateChunk({ frontierY: -900, bossPending: false })).toBe(false);
  });

  it('holds generation while a boss is pending, so no extra horde joins the fight', () => {
    expect(shouldGenerateChunk({ frontierY: -100, bossPending: true })).toBe(false);
  });
});

describe('advanceFrontier', () => {
  it('moves the frontier down with the scroll', () => {
    expect(advanceFrontier({ frontierY: -900, dy: 50, bossPending: false })).toBe(-850);
  });

  it('holds the frontier just above the screen while a boss is pending', () => {
    // Sem isso, o próximo trecho nasceria já dentro da tela depois do chefão.
    expect(advanceFrontier({ frontierY: -210, dy: 50, bossPending: true })).toBe(
      -SPAWN_LOOKAHEAD_PX,
    );
  });
});
