import { BEAM, ENEMIES, SQUAD_Y } from './balance';
import type { EnemyKind } from './enemies';
import type { Circle } from './geometry';
import type { Health } from './health';

/** Estado do feixe (ADR 0024): carga da barra (0–1) e quanto falta do disparo atual. */
export interface BeamState {
  readonly charge: number;
  readonly remainingMs: number;
  /** O disparo atual já tirou a sua parte da vida do chefão. */
  readonly bossHit: boolean;
}

export const initialBeam: BeamState = { charge: 0, remainingMs: 0, bossHit: false };

/** Somas de frações (ex.: 40 × 1/40) podem ficar um fio abaixo de 1 no ponto flutuante. */
const FULL_BAR_TOLERANCE = 1e-9;

/** Quanto da barra um monstro vale ao ser abatido: a barra enche com `hordesToCharge` hordas inteiras. */
export function killCharge(kind: EnemyKind, hordeBudget: number): number {
  return ENEMIES[kind].cost / (hordeBudget * BEAM.hordesToCharge);
}

export function isBeamActive(state: BeamState): boolean {
  return state.remainingMs > 0;
}

/** Soma carga de um abate; cheia, a barra dispara o feixe sozinha. Nada carrega com feixe ativo ou chefão. */
export function addCharge(state: BeamState, amount: number, bossPresent: boolean): BeamState {
  if (bossPresent || isBeamActive(state)) return state;
  const charge = state.charge + amount;
  if (charge < 1 - FULL_BAR_TOLERANCE) return { ...state, charge };
  return { charge: 0, remainingMs: BEAM.durationMs, bossHit: false };
}

/** Desconta o tempo do disparo atual. */
export function tickBeam(state: BeamState, deltaMs: number): BeamState {
  return { ...state, remainingMs: Math.max(0, state.remainingMs - deltaMs) };
}

/** Se o alvo toca a coluna do feixe centrada em `beamX`, acima da linha da tropa. */
export function beamCovers(beamX: number, target: Circle): boolean {
  return Math.abs(target.x - beamX) < BEAM.widthPx / 2 + target.radius && target.y < SQUAD_Y;
}

/** Dano do feixe no chefão: uma fração da vida máxima, sem nunca derrotá-lo. */
export function beamBossDamage(health: Health): number {
  return Math.max(0, Math.min(health.maxHp * BEAM.bossDamageShare, health.hp - 1));
}

export function markBossHit(state: BeamState): BeamState {
  return { ...state, bossHit: true };
}
