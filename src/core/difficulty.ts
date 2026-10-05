import {
  BASE_SCROLL_SPEED,
  BOSS_EVERY,
  DOUBLE_ONLY_PRESSURE,
  HORDE_TROOP_SHARE,
  MAX_SPEED_BONUS,
  MULTIPLY_VALUES,
  PRESSURE_THRESHOLDS,
  PUNITIVE_MULTIPLIER_BY_PRESSURE,
  SPEED_GROWTH_PER_CHUNK,
  STRONG_CHANCE_BY_PRESSURE,
  TEMPLATE_WEIGHTS,
  WEIGHT_RAMP_CHUNKS,
  threatBudget,
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

/** Nível de pressão pela tropa: 0 (< 50 heróis) a 3 (≥ 1000), ADR 0020. */
export type Pressure = 0 | 1 | 2 | 3;

/** Trechos começam em 1; os múltiplos de BOSS_EVERY são de chefão. */
export function isBossChunk(chunkIndex: number): boolean {
  return chunkIndex > 0 && chunkIndex % BOSS_EVERY === 0;
}

export function bossNumberAt(chunkIndex: number): number {
  return chunkIndex / BOSS_EVERY;
}

export function pressureLevel(troopCount: number): Pressure {
  // Fronteira de tipo: a contagem de marcos atingidos vai de 0 a PRESSURE_THRESHOLDS.length (3).
  return PRESSURE_THRESHOLDS.filter((threshold) => troopCount >= threshold).length as Pressure;
}

export function strongEnemyChance(pressure: Pressure): number {
  return STRONG_CHANCE_BY_PRESSURE[pressure];
}

/** Orçamento de ameaça da horda: distância + (com pressão) uma fração da tropa. */
export function hordeBudget(chunkIndex: number, troopCount: number): number {
  const troopExtra = pressureLevel(troopCount) > 0 ? HORDE_TROOP_SHARE * troopCount : 0;
  return threatBudget(chunkIndex) + Math.floor(troopExtra);
}

/** Peso do `xN` no sorteio do portão bom (os demais tipos pesam 1): mais raro com tropa grande. */
export function multiplyGateWeight(pressure: Pressure): number {
  return 1 / (1 + pressure);
}

/** Valores possíveis do `xN`: com tropa grande, só x2 (ADR 0023). */
export function multiplyValues(pressure: Pressure): readonly number[] {
  return pressure >= DOUBLE_ONLY_PRESSURE ? [MULTIPLY_VALUES[0]] : MULTIPLY_VALUES;
}

/** Pesos dos moldes no trecho: rampa pela distância e punitivos multiplicados pela pressão. */
export function templateWeights(
  chunkIndex: number,
  pressure: Pressure,
): Record<TemplateKind, number> {
  const progress = Math.min(Math.max((chunkIndex - 1) / (WEIGHT_RAMP_CHUNKS - 1), 0), 1);
  const punitiveMultiplier = PUNITIVE_MULTIPLIER_BY_PRESSURE[pressure];
  const entries = Object.entries(TEMPLATE_WEIGHTS) as [TemplateKind, readonly [number, number]][];
  return Object.fromEntries(
    entries.map(([kind, [start, end]]) => {
      const multiplier = PUNITIVE_TEMPLATES.includes(kind) ? punitiveMultiplier : 1;
      return [kind, (start + (end - start) * progress) * multiplier];
    }),
  ) as Record<TemplateKind, number>;
}

/** Velocidade de rolagem do caminho, em px/s. */
export function scrollSpeed(chunkIndex: number): number {
  const bonus = Math.min(SPEED_GROWTH_PER_CHUNK * (chunkIndex - 1), MAX_SPEED_BONUS);
  return BASE_SCROLL_SPEED * (1 + bonus);
}
