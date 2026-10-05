// Todos os números de balanceamento do jogo vivem aqui (spec do subprojeto 1, §4).
// Ajustá-los durante os playtests é esperado; mudar uma regra exige atualizar o spec.

import type { TemplateKind } from './difficulty';
import type { EnemyDef } from './enemies';

/** Níveis de herói: o total da tropa é exibido decomposto nesses valores (ADR 0007). */
export const HERO_TIERS = [
  { name: 'Recruta', value: 1 },
  { name: 'Cavaleiro', value: 10 },
  { name: 'Campeão', value: 250 },
  { name: 'Lenda', value: 1000 },
] as const;

/** Bônus de dano por índice de nível de herói (Recruta 0, Cavaleiro 1, ...). */
export const TIER_DAMAGE_BONUS = 0.05;

export const WEAPON_LEVELS = [
  { name: 'Estilingue', damage: 1, shotsPerSecond: 1 },
  { name: 'Arco', damage: 1.5, shotsPerSecond: 1.5 },
  { name: 'Besta', damage: 2.25, shotsPerSecond: 1.5 },
  { name: 'Cajado', damage: 3.4, shotsPerSecond: 2 },
  { name: 'Canhão', damage: 5, shotsPerSecond: 2 },
] as const;

/** Multiplicador de dano por nível acima do último da tabela (+20% por nível). */
export const WEAPON_EXTRA_LEVEL_MULTIPLIER = 1.2;

/** O portão "+1 Cavaleiro" dá exatamente um Cavaleiro: acompanha o valor do nível. */
export const KNIGHT_GATE_VALUE = HERO_TIERS[1].value;
export const GATE_HIT_INCREMENT = 1;
/** Vida da caixa de arma, em acertos de projétil. */
export const WEAPON_CRATE_HP = 60;
export const MULTIPLY_VALUES = [2, 3] as const;
export const DIVIDE_VALUES = [2, 3] as const;
/** Teto de um portão de soma atingido por tiros: máx(MULTIPLIER × valor inicial, MIN_CAP) (ADR 0021). */
export const GATE_SHOT_CAP_MULTIPLIER = 2;
export const GATE_SHOT_MIN_CAP = 10;
/** Um portão -N tira entre 20% e 60% da tropa atual, se isso for maior que a faixa por distância (ADR 0020). */
export const NEGATIVE_GATE_TROOP_SHARE = [0.2, 0.6] as const;

/** Faixa [mínimo, máximo] do N de um portão `+N` no trecho informado. */
export function addGateRange(chunkIndex: number): [number, number] {
  return [3, 3 + chunkIndex];
}

/** Faixa [mínimo, máximo] do N de um portão `-N` no trecho informado. */
export function subtractGateRange(chunkIndex: number): [number, number] {
  return [5, 5 + chunkIndex];
}

/** Coordenada x que divide a faixa esquerda da direita. */
export const LANE_SPLIT_X = 360;
/** Centro horizontal de cada faixa. */
export const LANE_CENTER_X = { left: 180, right: 540 } as const;

/** Comprimento de um trecho do caminho, em px. */
export const CHUNK_LENGTH_PX = 1200;
export const GATE_WIDTH = 330;
export const GATE_HEIGHT = 70;
export const CRATE_SIZE = 70;

/** Linha (y) onde a tropa fica na tela. */
export const SQUAD_Y = 1100;
/** Limites horizontais do centro da tropa. */
export const SQUAD_MIN_X = 80;
export const SQUAD_MAX_X = 640;
/** Velocidade máxima com que a tropa segue o dedo, em px/s. */
export const SQUAD_FOLLOW_SPEED = 2200;

/** Velocidade dos projéteis, em px/s (para cima). */
export const PROJECTILE_SPEED = 300;
/** Máximo de projéteis ao mesmo tempo: comporta o pior caso (100 unidades × 2 tiros/s × ~4 s de voo). */
export const PROJECTILE_POOL_SIZE = 800;
/** Margem fora da tela a partir da qual objetos são reciclados, em px. */
export const OFFSCREEN_MARGIN_PX = 120;
/** Máximo de inimigos ao mesmo tempo; acima disso, novos spawns são ignorados. */
export const ENEMY_POOL_SIZE = 450;
/** Máximo de monstros gerados por trecho: tropas gigantes não podem travar a geração (revisão). */
export const MAX_HORDE_SPAWNS_PER_CHUNK = 180;

/** Máximo de unidades de herói desenhadas; acima disso as unidades do maior nível ganham peso extra. */
export const MAX_RENDERED_UNITS = 100;
/** Distância base entre heróis na formação, em px. */
export const FORMATION_SPACING = 22;
/** Maior delta de frame aceito, em ms (evita "teletransporte" ao voltar de outro app). */
export const MAX_FRAME_DELTA_MS = 50;

export const ENEMIES = {
  common: { hp: 10, speed: 1.1, heroesLost: 2, points: 10, cost: 1, radius: 18 },
  strong: { hp: 100, speed: 0.7, heroesLost: 20, points: 50, cost: 8, radius: 32 },
} as const satisfies Record<string, EnemyDef>;

export const BOSS = { baseHp: 1000, hpGrowth: 1.6, speed: 0.35, pointsPerBoss: 500, radius: 70 };

/** Velocidade de caminhada de um inimigo com `speed` 1, em px/s (somada à rolagem). */
export const ENEMY_BASE_WALK_SPEED = 50;
/** Quantos px de rolagem valem 1 metro no score. */
export const PX_PER_METER = 100;

/** Um chefão a cada N trechos (trechos 8, 16, 24...). */
export const BOSS_EVERY = 8;
/** Quando o chefão chega a este y, o caminho para até ele ser derrotado. */
export const BOSS_ARENA_Y = 220;
/** Primeiro trecho em que inimigos fortes podem aparecer. */
export const STRONG_ENEMY_MIN_CHUNK = 2;
/** Velocidade de rolagem do caminho no trecho 1, em px/s. */
export const BASE_SCROLL_SPEED = 120;
export const SPEED_GROWTH_PER_CHUNK = 0.02;
export const MAX_SPEED_BONUS = 0.5;
/** Trecho em que os pesos dos moldes chegam aos valores finais. */
export const WEIGHT_RAMP_CHUNKS = 30;

/** Peso de cada molde de trecho: [no início, a partir de WEIGHT_RAMP_CHUNKS] (spec §4.6). */
export const TEMPLATE_WEIGHTS: Record<TemplateKind, readonly [number, number]> = {
  classicPair: [30, 15],
  lesserEvil: [0, 12],
  bestOfGood: [15, 8],
  loneGate: [2, 15],
  obstacleCorridor: [0, 12],
  weaponCrate: [8, 8],
  hordeOnly: [15, 15],
};

/** Trechos iniciais que funcionam como tutorial implícito (trava 5). */
export const TUTORIAL_CHUNKS = 4;
/** Máximo de trechos punitivos seguidos (trava 3). */
export const PUNITIVE_STREAK_LIMIT = 2;
/** Tentativas de sortear um trecho justo antes de cair no molde seguro. */
export const MAX_GENERATION_ATTEMPTS = 20;
/** A horda que acompanha o chefão usa 1/N do orçamento, só com comuns. */
export const BOSS_HORDE_BUDGET_DIVISOR = 4;
/** A partir de qual trecho o portão "+1 Cavaleiro" pode aparecer. */
export const KNIGHT_GATE_MIN_CHUNK = 8;

/** Quanto "custo de inimigo" a horda de um trecho pode gastar. */
export function threatBudget(chunkIndex: number): number {
  return 8 + 3 * chunkIndex;
}

/** Tropa a partir da qual cada nível de pressão começa (ADR 0020). */
export const PRESSURE_THRESHOLDS = [50, 250, 1000] as const;
/** Por nível de pressão (0–3). */
export const STRONG_CHANCE_BY_PRESSURE = [0.25, 0.35, 0.45, 0.6] as const;
export const PUNITIVE_MULTIPLIER_BY_PRESSURE = [1, 1.5, 2, 3] as const;
/** Com pressão ≥ 1, a horda ganha essa fração da tropa como orçamento extra. */
export const HORDE_TROOP_SHARE = 0.1;
/** Quantidade de ondas por trecho e quanto do trecho (0–1) cada onda ocupa. */
export const HORDE_WAVES = [2, 3] as const;
export const HORDE_WAVE_SPREAD = 0.12;
