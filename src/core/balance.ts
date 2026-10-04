// Todos os números de balanceamento do jogo vivem aqui (spec do subprojeto 1, §4).
// Ajustá-los durante os playtests é esperado; mudar uma regra exige atualizar o spec.

import type { TemplateKind } from './difficulty';
import type { EnemyDef } from './enemies';

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

/** Linha (y) onde a tropa fica na tela. */
export const SQUAD_Y = 1100;
/** Limites horizontais do centro da tropa. */
export const SQUAD_MIN_X = 80;
export const SQUAD_MAX_X = 640;
/** Velocidade máxima com que a tropa segue o dedo, em px/s. */
export const SQUAD_FOLLOW_SPEED = 2200;

/** Velocidade dos projéteis, em px/s (para cima). */
export const PROJECTILE_SPEED = 900;
/** Máximo de projéteis ao mesmo tempo; acima disso, novos disparos são ignorados. */
export const PROJECTILE_POOL_SIZE = 400;
/** Margem fora da tela a partir da qual objetos são reciclados, em px. */
export const OFFSCREEN_MARGIN_PX = 120;

/** Máximo de unidades de herói desenhadas; acima disso as unidades do maior nível ganham peso extra. */
export const MAX_RENDERED_UNITS = 120;
/** Distância base entre heróis na formação, em px. */
export const FORMATION_SPACING = 22;
/** Maior delta de frame aceito, em ms (evita "teletransporte" ao voltar de outro app). */
export const MAX_FRAME_DELTA_MS = 50;

export const ENEMIES = {
  common: { hp: 3, speed: 1.0, heroesLost: 1, points: 10, cost: 1, radius: 18 },
  strong: { hp: 40, speed: 0.6, heroesLost: 5, points: 50, cost: 8, radius: 32 },
} as const satisfies Record<string, EnemyDef>;

export const BOSS = { baseHp: 400, hpGrowth: 1.6, speed: 0.35, pointsPerBoss: 500, radius: 70 };

/** Velocidade de caminhada de um inimigo com `speed` 1, em px/s (somada à rolagem). */
export const ENEMY_BASE_WALK_SPEED = 80;
/** Quantos px de rolagem valem 1 metro no score. */
export const PX_PER_METER = 100;

/** Um chefão a cada N trechos (trechos 8, 16, 24...). */
export const BOSS_EVERY = 8;
/** Primeiro trecho em que inimigos fortes podem aparecer. */
export const STRONG_ENEMY_MIN_CHUNK = 5;
/** Velocidade de rolagem do caminho no trecho 1, em px/s. */
export const BASE_SCROLL_SPEED = 120;
export const SPEED_GROWTH_PER_CHUNK = 0.01;
export const MAX_SPEED_BONUS = 0.5;
/** Trecho em que os pesos dos moldes chegam aos valores finais. */
export const WEIGHT_RAMP_CHUNKS = 30;

/** Peso de cada molde de trecho: [no início, a partir de WEIGHT_RAMP_CHUNKS] (spec §4.6). */
export const TEMPLATE_WEIGHTS: Record<TemplateKind, readonly [number, number]> = {
  classicPair: [30, 15],
  lesserEvil: [0, 12],
  bestOfGood: [15, 8],
  loneGate: [15, 15],
  obstacleCorridor: [0, 12],
  weaponCrate: [8, 8],
  hordeOnly: [20, 15],
};

/** Trechos iniciais que funcionam como tutorial implícito (trava 5). */
export const TUTORIAL_CHUNKS = 4;
/** Máximo de trechos punitivos seguidos (trava 3). */
export const PUNITIVE_STREAK_LIMIT = 2;
/** Tentativas de sortear um trecho justo antes de cair no molde seguro. */
export const MAX_GENERATION_ATTEMPTS = 20;
/** Chance de um inimigo da horda ser forte, quando permitido. */
export const STRONG_ENEMY_CHANCE = 0.25;
/** A horda que acompanha o chefão usa 1/N do orçamento, só com comuns. */
export const BOSS_HORDE_BUDGET_DIVISOR = 4;
/** A partir de qual trecho o portão "+1 Cavaleiro" pode aparecer. */
export const KNIGHT_GATE_MIN_CHUNK = 8;

/** Quanto "custo de inimigo" a horda de um trecho pode gastar. */
export function threatBudget(chunkIndex: number): number {
  return 8 + 3 * chunkIndex;
}

/** Menor tropa esperada num trecho; usada pela trava de justiça 1. */
export function minExpectedTroop(chunkIndex: number): number {
  return Math.max(1, 2 * chunkIndex);
}
