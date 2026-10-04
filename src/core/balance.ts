// Todos os números de balanceamento do jogo vivem aqui (spec do subprojeto 1, §4).
// Ajustá-los durante os playtests é esperado; mudar uma regra exige atualizar o spec.

/** Níveis de herói: o total da tropa é exibido decomposto nesses valores (ADR 0007). */
export const HERO_TIERS = [
  { name: 'Recruta', value: 1 },
  { name: 'Cavaleiro', value: 50 },
  { name: 'Campeão', value: 250 },
  { name: 'Lenda', value: 1000 },
] as const;

/** Bônus de dano por índice de nível de herói (Recruta 0, Cavaleiro 1, ...). */
export const TIER_DAMAGE_BONUS = 0.15;

export const WEAPON_LEVELS = [
  { name: 'Estilingue', damage: 1, shotsPerSecond: 1 },
  { name: 'Arco', damage: 1.5, shotsPerSecond: 2 },
  { name: 'Besta', damage: 2.25, shotsPerSecond: 3 },
  { name: 'Cajado', damage: 3.4, shotsPerSecond: 3 },
  { name: 'Canhão', damage: 5, shotsPerSecond: 3 },
] as const;

/** Multiplicador de dano por nível acima do último da tabela. */
export const WEAPON_EXTRA_LEVEL_MULTIPLIER = 1.5;

export const KNIGHT_GATE_VALUE = 50;
export const GATE_HIT_INCREMENT = 1;
/** Vida da caixa de arma, em acertos de projétil. */
export const WEAPON_CRATE_HP = 20;
export const MULTIPLY_VALUES = [2, 3] as const;
export const DIVIDE_VALUE = 2;

/** Faixa [mínimo, máximo] do N de um portão `+N` no trecho informado. */
export function addGateRange(chunkIndex: number): [number, number] {
  return [5, 5 + chunkIndex];
}

/** Faixa [mínimo, máximo] do N de um portão `-N` no trecho informado. */
export function subtractGateRange(chunkIndex: number): [number, number] {
  return [3, 3 + chunkIndex];
}

/** Coordenada x que divide a faixa esquerda da direita. */
export const LANE_SPLIT_X = 360;
