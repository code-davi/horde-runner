import { FORMATION_SPACING } from './balance';
import type { RenderUnit } from './troop';

/** Ângulo de ouro: espalha pontos de forma uniforme sem formar raios visíveis. */
const GOLDEN_ANGLE_RAD = (137.508 * Math.PI) / 180;

/**
 * Posição de cada unidade em relação ao centro da tropa, em espiral de girassol.
 * A primeira unidade (a de maior nível) fica no centro.
 */
export function formationOffsets(
  units: readonly RenderUnit[],
  spacing: number = FORMATION_SPACING,
): { x: number; y: number }[] {
  return units.map((_, index) => {
    const radius = spacing * Math.sqrt(index);
    const angle = index * GOLDEN_ANGLE_RAD;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
}
