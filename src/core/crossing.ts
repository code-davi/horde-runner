import type { GatePlacement } from './chunks';
import { laneAt } from './lanes';

/** Portão aplicado quando a tropa cruza uma fileira na posição `squadX`; `null` se a faixa estiver vazia. */
export function resolveRowCrossing(
  row: readonly GatePlacement[],
  squadX: number,
): GatePlacement | null {
  const lane = laneAt(squadX);
  return row.find((placement) => placement.lane === lane) ?? null;
}
