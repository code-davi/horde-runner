import {
  BOSS_HORDE_BUDGET_DIVISOR,
  DIVIDE_VALUE,
  ENEMIES,
  KNIGHT_GATE_MIN_CHUNK,
  MULTIPLY_VALUES,
  STRONG_ENEMY_CHANCE,
  STRONG_ENEMY_MIN_CHUNK,
  TUTORIAL_CHUNKS,
  addGateRange,
  subtractGateRange,
  threatBudget,
} from './balance';
import type { Chunk, EnemySpawn, GatePlacement } from './chunks';
import type { TemplateKind } from './difficulty';
import type { EnemyKind } from './enemies';
import type { Gate } from './gates';
import type { Lane } from './lanes';
import type { Rng } from './rng';

type ChunkContent = Pick<Chunk, 'gates' | 'crate'>;

const GATE_ROW = 1;
const CRATE_OFFSET = 0.5;

/** Preenche os portões/caixa de um molde com valores sorteados. */
export function fillTemplate(template: TemplateKind, index: number, rng: Rng): ChunkContent {
  const none: ChunkContent = { gates: [], crate: null };
  switch (template) {
    case 'classicPair':
      return { ...none, gates: pair(rng, goodGate(index, rng), badGate(index, rng)) };
    case 'lesserEvil':
      return { ...none, gates: pair(rng, negativeSum(index, rng), badGate(index, rng)) };
    case 'bestOfGood':
      return { ...none, gates: pair(rng, goodGate(index, rng), goodGate(index, rng)) };
    case 'loneGate':
      return {
        ...none,
        gates: [{ lane: randomLane(rng), row: GATE_ROW, gate: loneGate(index, rng) }],
      };
    case 'obstacleCorridor':
      return { ...none, gates: corridor(index, rng) };
    case 'weaponCrate':
      return { ...none, crate: { x: 0.3 + rng.next() * 0.4, offset: CRATE_OFFSET } };
    case 'hordeOnly':
      return none;
  }
}

/** Horda do trecho gastando o orçamento de ameaça. */
export function fillHorde(index: number, rng: Rng): EnemySpawn[] {
  const canSpawnStrong = index >= STRONG_ENEMY_MIN_CHUNK;
  const spawns: EnemySpawn[] = [];
  let budget = threatBudget(index);
  while (budget >= ENEMIES.common.cost) {
    const strong =
      canSpawnStrong && budget >= ENEMIES.strong.cost && rng.next() < STRONG_ENEMY_CHANCE;
    const kind: EnemyKind = strong ? 'strong' : 'common';
    spawns.push(spawn(kind, rng));
    budget -= ENEMIES[kind].cost;
  }
  return spawns;
}

/** Horda leve que acompanha o chefão: só comuns. */
export function bossHorde(index: number, rng: Rng): EnemySpawn[] {
  const count = Math.floor(threatBudget(index) / BOSS_HORDE_BUDGET_DIVISOR);
  return Array.from({ length: count }, () => spawn('common', rng));
}

function spawn(kind: EnemyKind, rng: Rng): EnemySpawn {
  return { kind, x: 0.1 + rng.next() * 0.8, offset: rng.next() };
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

function corridor(index: number, rng: Rng): GatePlacement[] {
  const length = rng.int(2, 4);
  let lane = randomLane(rng);
  return Array.from({ length }, (_, row) => {
    const placement = { lane, row, gate: badGate(index, rng) };
    lane = lane === 'left' ? 'right' : 'left';
    return placement;
  });
}

function loneGate(index: number, rng: Rng): Gate {
  const mustBeGood = index <= TUTORIAL_CHUNKS;
  return mustBeGood || rng.next() < 0.5 ? goodGate(index, rng) : badGate(index, rng);
}

function goodGate(index: number, rng: Rng): Gate {
  const options: Gate['kind'][] = ['sum', 'multiply', 'weapon'];
  if (index >= KNIGHT_GATE_MIN_CHUNK) options.push('knight');
  switch (rng.pick(options)) {
    case 'multiply':
      return { kind: 'multiply', value: rng.pick(MULTIPLY_VALUES) };
    case 'weapon':
      return { kind: 'weapon' };
    case 'knight':
      return { kind: 'knight' };
    default:
      return { kind: 'sum', value: rng.int(...addGateRange(index)) };
  }
}

function badGate(index: number, rng: Rng): Gate {
  return rng.next() < 0.5 ? negativeSum(index, rng) : { kind: 'divide', value: DIVIDE_VALUE };
}

function negativeSum(index: number, rng: Rng): Gate {
  return { kind: 'sum', value: -rng.int(...subtractGateRange(index)) };
}
