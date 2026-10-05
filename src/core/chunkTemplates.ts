import {
  BOSS_HORDE_BUDGET_DIVISOR,
  DIVIDE_VALUES,
  ENEMIES,
  MAX_HORDE_SPAWNS_PER_CHUNK,
  HORDE_WAVES,
  HORDE_WAVE_SPREAD,
  KNIGHT_GATE_MIN_CHUNK,
  NEGATIVE_GATE_TROOP_SHARE,
  STRONG_ENEMY_MIN_CHUNK,
  TUTORIAL_CHUNKS,
  addGateRange,
  subtractGateRange,
  threatBudget,
} from './balance';
import type { Chunk, EnemySpawn, GatePlacement } from './chunks';
import {
  hordeBudget,
  multiplyGateWeight,
  multiplyValues,
  pressureLevel,
  strongEnemyChance,
  type TemplateKind,
} from './difficulty';
import { enemyHp, type EnemyKind } from './enemies';
import { createSumGate, type Gate } from './gates';
import type { Lane } from './lanes';
import type { Rng } from './rng';

/** O que o preenchimento de um trecho precisa saber: onde estamos e o tamanho da tropa. */
export interface ChunkContext {
  readonly index: number;
  readonly troopCount: number;
}

type ChunkContent = Pick<Chunk, 'gates' | 'crate'>;
type GoodGateKind = Exclude<Gate['kind'], 'divide'>;

const GATE_ROW = 1;
const CRATE_OFFSET = 0.5;

/** Preenche os portões/caixa de um molde com valores sorteados. */
export function fillTemplate(template: TemplateKind, ctx: ChunkContext, rng: Rng): ChunkContent {
  const none: ChunkContent = { gates: [], crate: null };
  switch (template) {
    case 'classicPair':
      return { ...none, gates: pair(rng, goodGate(ctx, rng), badGate(ctx, rng)) };
    case 'lesserEvil':
      return { ...none, gates: pair(rng, negativeSum(ctx, rng), badGate(ctx, rng)) };
    case 'bestOfGood':
      return { ...none, gates: pair(rng, goodGate(ctx, rng), goodGate(ctx, rng)) };
    case 'loneGate':
      return {
        ...none,
        gates: [{ lane: randomLane(rng), row: GATE_ROW, gate: loneGate(ctx, rng) }],
      };
    case 'obstacleCorridor':
      return { ...none, gates: corridor(ctx, rng) };
    case 'weaponCrate':
      return { ...none, crate: { x: 0.3 + rng.next() * 0.4, offset: CRATE_OFFSET } };
    case 'hordeOnly':
      return none;
  }
}

/** Horda do trecho: gasta o orçamento (distância + pressão) em 2–3 ondas, até um teto de monstros. */
export function fillHorde(ctx: ChunkContext, rng: Rng): EnemySpawn[] {
  const canSpawnStrong = ctx.index >= STRONG_ENEMY_MIN_CHUNK;
  const strongChance = strongEnemyChance(pressureLevel(ctx.troopCount));
  const waveCenters = createWaveCenters(rng);
  const spawns: EnemySpawn[] = [];
  let budget = hordeBudget(ctx.index, ctx.troopCount);
  while (budget >= ENEMIES.common.cost && spawns.length < MAX_HORDE_SPAWNS_PER_CHUNK) {
    const strong = canSpawnStrong && budget >= ENEMIES.strong.cost && rng.next() < strongChance;
    const kind: EnemyKind = strong ? 'strong' : 'common';
    spawns.push(spawnInWave({ kind, hp: enemyHp(kind, ctx.index) }, rng.pick(waveCenters), rng));
    budget -= ENEMIES[kind].cost;
  }
  return spawns;
}

/** Horda leve que acompanha o chefão: só comuns, numa onda. */
export function bossHorde(index: number, rng: Rng): EnemySpawn[] {
  const count = Math.floor(threatBudget(index) / BOSS_HORDE_BUDGET_DIVISOR);
  const common = { kind: 'common', hp: enemyHp('common', index) } as const;
  return Array.from({ length: count }, () => spawnInWave(common, 0.5, rng));
}

function createWaveCenters(rng: Rng): number[] {
  const waves = rng.int(...HORDE_WAVES);
  return Array.from({ length: waves }, (_, wave) => (wave + 0.5) / waves);
}

function spawnInWave(enemy: Pick<EnemySpawn, 'kind' | 'hp'>, center: number, rng: Rng): EnemySpawn {
  const offset = center + (rng.next() - 0.5) * HORDE_WAVE_SPREAD;
  return { ...enemy, x: 0.1 + rng.next() * 0.8, offset: Math.min(Math.max(offset, 0), 0.999) };
}

function randomLane(rng: Rng): Lane {
  return rng.next() < 0.5 ? 'left' : 'right';
}

function pair(rng: Rng, first: Gate, second: Gate): GatePlacement[] {
  const firstLane = randomLane(rng);
  const secondLane: Lane = firstLane === 'left' ? 'right' : 'left';
  return [
    { lane: firstLane, row: GATE_ROW, gate: first },
    { lane: secondLane, row: GATE_ROW, gate: second },
  ];
}

function corridor(ctx: ChunkContext, rng: Rng): GatePlacement[] {
  const length = rng.int(2, 4);
  let lane = randomLane(rng);
  return Array.from({ length }, (_, row) => {
    const placement = { lane, row, gate: badGate(ctx, rng) };
    lane = lane === 'left' ? 'right' : 'left';
    return placement;
  });
}

function loneGate(ctx: ChunkContext, rng: Rng): Gate {
  const mustBeGood = ctx.index <= TUTORIAL_CHUNKS;
  return mustBeGood || rng.next() < 0.5 ? goodGate(ctx, rng) : badGate(ctx, rng);
}

/** Peso de cada tipo de portão bom: o `xN` fica mais raro com a pressão (ADR 0023). */
function goodGateWeights(ctx: ChunkContext): Record<GoodGateKind, number> {
  return {
    sum: 1,
    multiply: multiplyGateWeight(pressureLevel(ctx.troopCount)),
    weapon: 1,
    knight: ctx.index >= KNIGHT_GATE_MIN_CHUNK ? 1 : 0,
  };
}

function goodGate(ctx: ChunkContext, rng: Rng): Gate {
  switch (rng.weighted(goodGateWeights(ctx))) {
    case 'multiply':
      return { kind: 'multiply', value: rng.pick(multiplyValues(pressureLevel(ctx.troopCount))) };
    case 'weapon':
      return { kind: 'weapon' };
    case 'knight':
      return { kind: 'knight' };
    default:
      return createSumGate(rng.int(...addGateRange(ctx.index)));
  }
}

function badGate(ctx: ChunkContext, rng: Rng): Gate {
  if (rng.next() < 0.5) return negativeSum(ctx, rng);
  return { kind: 'divide', value: rng.pick(DIVIDE_VALUES) };
}

/** `-N` com N = o maior entre a faixa por distância e 10–40% da tropa (ADR 0020). */
function negativeSum(ctx: ChunkContext, rng: Rng): Gate {
  const byDistance = rng.int(...subtractGateRange(ctx.index));
  const [minShare, maxShare] = NEGATIVE_GATE_TROOP_SHARE;
  const byTroop = Math.round(ctx.troopCount * (minShare + rng.next() * (maxShare - minShare)));
  return createSumGate(-Math.max(byDistance, byTroop));
}
