import { LANE_SPLIT_X } from './balance';

export type Lane = 'left' | 'right';

/** Faixa em que uma coordenada x está; a divisa exata pertence à direita. */
export function laneAt(x: number): Lane {
  return x < LANE_SPLIT_X ? 'left' : 'right';
}
