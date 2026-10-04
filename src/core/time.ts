import { MAX_FRAME_DELTA_MS } from './balance';

/** Limita o delta de um frame a [0, MAX_FRAME_DELTA_MS] ms. */
export function clampDelta(ms: number): number {
  return Math.min(Math.max(ms, 0), MAX_FRAME_DELTA_MS);
}
