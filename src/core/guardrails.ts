import { BOSS_EVERY, PUNITIVE_STREAK_LIMIT, TUTORIAL_CHUNKS } from './balance';
import type { Chunk } from './chunks';
import { PUNITIVE_TEMPLATES, type TemplateKind } from './difficulty';
import { isGoodGate } from './gates';
import { applyGate } from './troop';

const TUTORIAL_TEMPLATES: readonly string[] = ['classicPair', 'loneGate', 'hordeOnly'];
const PRE_BOSS_TEMPLATES: readonly string[] = ['bestOfGood', 'weaponCrate'];

/**
 * Melhor tropa possível ao final do trecho, escolhendo a melhor faixa em cada fileira.
 * Escolher o melhor a cada fileira é ótimo porque todo portão é monotônico na contagem.
 */
export function bestPathResult(chunk: Chunk, startCount: number): number {
  const rows = [...new Set(chunk.gates.map((placement) => placement.row))].sort((a, b) => a - b);
  return rows.reduce((count, row) => {
    const inRow = chunk.gates.filter((placement) => placement.row === row);
    const outcomes = inRow.map(
      (placement) => applyGate({ count, weaponLevel: 1 }, placement.gate).count,
    );
    const hasEmptyLane = inRow.length < 2;
    return Math.max(...outcomes, hasEmptyLane ? count : 0);
  }, startCount);
}

/** Números das travas de justiça (1–5) que o candidato viola com a tropa atual; [] se estiver justo. */
export function violatedGuardrails(
  history: readonly Chunk[],
  candidate: Chunk,
  troopCount: number,
): number[] {
  const checks: [number, boolean][] = [
    [1, bestPathResult(candidate, troopCount) > 0],
    [2, lesserEvilIsImprovable(candidate)],
    [3, respectsPunitiveStreak(history, candidate)],
    [4, helpsBeforeBoss(candidate)],
    [5, isTutorialFriendly(candidate)],
  ];
  return checks.filter(([, ok]) => !ok).map(([rule]) => rule);
}

function lesserEvilIsImprovable(chunk: Chunk): boolean {
  if (chunk.template !== 'lesserEvil') return true;
  return chunk.gates.some(({ gate }) => gate.kind === 'sum' && gate.value < 0);
}

function isPunitive(chunk: Chunk): boolean {
  return chunk.template !== 'boss' && PUNITIVE_TEMPLATES.includes(chunk.template as TemplateKind);
}

function respectsPunitiveStreak(history: readonly Chunk[], candidate: Chunk): boolean {
  if (!isPunitive(candidate)) return true;
  const lastChunks = history.slice(-PUNITIVE_STREAK_LIMIT);
  return lastChunks.length < PUNITIVE_STREAK_LIMIT || !lastChunks.every(isPunitive);
}

function helpsBeforeBoss(chunk: Chunk): boolean {
  if (chunk.index % BOSS_EVERY !== BOSS_EVERY - 1) return true;
  return PRE_BOSS_TEMPLATES.includes(chunk.template);
}

function isTutorialFriendly(chunk: Chunk): boolean {
  if (chunk.index > TUTORIAL_CHUNKS) return true;
  if (!TUTORIAL_TEMPLATES.includes(chunk.template)) return false;
  return chunk.template !== 'loneGate' || chunk.gates.every(({ gate }) => isGoodGate(gate));
}
