import {
  BASE_SCROLL_SPEED,
  BOSS_EVERY,
  MAX_SPEED_BONUS,
  SPEED_GROWTH_PER_CHUNK,
  TEMPLATE_WEIGHTS,
  WEIGHT_RAMP_CHUNKS,
} from './balance';

/** Moldes de trecho sorteáveis (ADR 0010). */
export type TemplateKind =
  | 'classicPair'
  | 'lesserEvil'
  | 'bestOfGood'
  | 'loneGate'
  | 'obstacleCorridor'
  | 'weaponCrate'
  | 'hordeOnly';

/** Moldes que punem o jogador; no máximo 2 seguidos (trava 3). */
export const PUNITIVE_TEMPLATES: readonly TemplateKind[] = ['lesserEvil', 'obstacleCorridor'];

/** Trechos começam em 1; os múltiplos de BOSS_EVERY são de chefão. */
export function isBossChunk(chunkIndex: number): boolean {
  return chunkIndex > 0 && chunkIndex % BOSS_EVERY === 0;
}

export function bossNumberAt(chunkIndex: number): number {
  return chunkIndex / BOSS_EVERY;
}

/** Pesos dos moldes no trecho, interpolando do início ao fim da rampa. */
export function templateWeights(chunkIndex: number): Record<TemplateKind, number> {
  const progress = Math.min(Math.max((chunkIndex - 1) / (WEIGHT_RAMP_CHUNKS - 1), 0), 1);
  const entries = Object.entries(TEMPLATE_WEIGHTS) as [TemplateKind, readonly [number, number]][];
  return Object.fromEntries(
    entries.map(([kind, [start, end]]) => [kind, start + (end - start) * progress]),
  ) as Record<TemplateKind, number>;
}

/** Velocidade de rolagem do caminho, em px/s. */
export function scrollSpeed(chunkIndex: number): number {
  const bonus = Math.min(SPEED_GROWTH_PER_CHUNK * (chunkIndex - 1), MAX_SPEED_BONUS);
  return BASE_SCROLL_SPEED * (1 + bonus);
}
