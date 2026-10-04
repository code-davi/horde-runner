import { PX_PER_METER } from './balance';
import { bossPoints, enemyDef, type EnemyKind } from './enemies';

export interface ScoreState {
  readonly pixelsTravelled: number;
  readonly monsterPoints: number;
  readonly bossBonus: number;
}

export const initialScore: ScoreState = { pixelsTravelled: 0, monsterPoints: 0, bossBonus: 0 };

export function addDistance(state: ScoreState, px: number): ScoreState {
  return { ...state, pixelsTravelled: state.pixelsTravelled + px };
}

export function addKill(state: ScoreState, kind: EnemyKind): ScoreState {
  return { ...state, monsterPoints: state.monsterPoints + enemyDef(kind).points };
}

export function addBossKill(state: ScoreState, bossNumber: number): ScoreState {
  return { ...state, bossBonus: state.bossBonus + bossPoints(bossNumber) };
}

/** Score exibido: metros inteiros + pontos de monstros + bônus de chefões. */
export function totalScore(state: ScoreState): number {
  return Math.floor(state.pixelsTravelled / PX_PER_METER) + state.monsterPoints + state.bossBonus;
}
