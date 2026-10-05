import { describe, expect, it } from 'vitest';
import {
  BRIDGE_LEFT_X,
  BRIDGE_RIGHT_X,
  GATE_WIDTH,
  LANE_CENTER_X,
  LANE_SPLIT_X,
  SQUAD_MAX_X,
  SQUAD_MIN_X,
} from '../../src/core/balance';
import { bridgeX } from '../../src/core/bridge';

describe('bridgeX', () => {
  it('maps a fraction of the bridge to a screen x', () => {
    expect(bridgeX(0)).toBe(150);
    expect(bridgeX(0.5)).toBe(360);
    expect(bridgeX(1)).toBe(570);
  });
});

describe('bridge layout', () => {
  it('is 420 px wide and centered on the 720 px screen', () => {
    expect(BRIDGE_LEFT_X).toBe(150);
    expect(BRIDGE_RIGHT_X).toBe(570);
    expect(LANE_SPLIT_X).toBe(360);
  });

  it('fits both gates of a row on the bridge without overlapping', () => {
    expect(LANE_CENTER_X.left - GATE_WIDTH / 2).toBeGreaterThanOrEqual(BRIDGE_LEFT_X);
    expect(LANE_CENTER_X.left + GATE_WIDTH / 2).toBeLessThan(LANE_SPLIT_X);
    expect(LANE_CENTER_X.right - GATE_WIDTH / 2).toBeGreaterThan(LANE_SPLIT_X);
    expect(LANE_CENTER_X.right + GATE_WIDTH / 2).toBeLessThanOrEqual(BRIDGE_RIGHT_X);
  });

  it('keeps the troop center on the bridge while reaching both lanes', () => {
    expect(SQUAD_MIN_X).toBeGreaterThan(BRIDGE_LEFT_X);
    expect(SQUAD_MAX_X).toBeLessThan(BRIDGE_RIGHT_X);
    expect(SQUAD_MIN_X).toBeLessThanOrEqual(LANE_CENTER_X.left);
    expect(SQUAD_MAX_X).toBeGreaterThanOrEqual(LANE_CENTER_X.right);
  });
});
