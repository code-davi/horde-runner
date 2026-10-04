import { HERO_TIERS, KNIGHT_GATE_VALUE, MAX_RENDERED_UNITS, TIER_DAMAGE_BONUS } from './balance';
import type { Gate } from './gates';
import { weaponStats } from './weapons';

/** Estado de regra da tropa. `count` é a vida da tropa (ADR 0006). */
export interface TroopState {
  readonly count: number;
  readonly weaponLevel: number;
}

export const initialTroop: TroopState = { count: 1, weaponLevel: 1 };

/** Efeito de passar por um portão. */
export function applyGate(state: TroopState, gate: Gate): TroopState {
  switch (gate.kind) {
    case 'sum':
      return withCount(state, state.count + gate.value);
    case 'multiply':
      return withCount(state, state.count * gate.value);
    case 'divide':
      return withCount(state, Math.floor(state.count / gate.value));
    case 'knight':
      return withCount(state, state.count + KNIGHT_GATE_VALUE);
    case 'weapon':
      return upgradeWeapon(state);
  }
}

/** Monstro encostou: a tropa perde heróis. */
export function takeHit(state: TroopState, heroesLost: number): TroopState {
  return withCount(state, state.count - heroesLost);
}

/** Sobe a arma da tropa um nível. */
export function upgradeWeapon(state: TroopState): TroopState {
  return { ...state, weaponLevel: state.weaponLevel + 1 };
}

/** A tropa acabou. */
export function isDefeated(state: TroopState): boolean {
  return state.count <= 0;
}

function withCount(state: TroopState, count: number): TroopState {
  return { ...state, count: Math.max(0, count) };
}

/** Uma unidade desenhada; `weight` = quantos heróis desse nível ela representa. */
export interface RenderUnit {
  readonly tierIndex: number;
  readonly weight: number;
}

/** Decompõe o total em unidades desenhadas, maior nível primeiro (ADR 0007). */
export function renderUnits(count: number, cap: number = MAX_RENDERED_UNITS): RenderUnit[] {
  const perTier = countPerTier(count);
  const topTier = perTier.findLastIndex((tierCount) => tierCount > 0);
  if (topTier < 0) return [];

  const lowerUnits = perTier.slice(0, topTier).reduce((sum, tierCount) => sum + tierCount, 0);
  const topSlots = Math.max(1, Math.min(perTier[topTier]!, cap - lowerUnits));
  const units = spreadWeight(topTier, perTier[topTier]!, topSlots);

  for (let tier = topTier - 1; tier >= 0; tier--) {
    units.push(...spreadWeight(tier, perTier[tier]!, perTier[tier]!));
  }
  return units;
}

/** Quantos heróis de cada nível, pela decomposição gulosa (índice = nível). */
function countPerTier(count: number): number[] {
  const perTier = HERO_TIERS.map(() => 0);
  let remaining = count;
  for (let tier = HERO_TIERS.length - 1; tier >= 0; tier--) {
    perTier[tier] = Math.floor(remaining / HERO_TIERS[tier]!.value);
    remaining -= perTier[tier]! * HERO_TIERS[tier]!.value;
  }
  return perTier;
}

/** Distribui `total` heróis-do-nível em `slots` unidades, o mais igual possível. */
function spreadWeight(tierIndex: number, total: number, slots: number): RenderUnit[] {
  const base = Math.floor(total / slots);
  const extra = total % slots;
  return Array.from({ length: slots }, (_, i) => ({
    tierIndex,
    weight: base + (i < extra ? 1 : 0),
  }));
}

/** Dano de um projétil disparado por uma unidade. */
export function unitShotDamage(weaponLevel: number, unit: RenderUnit): number {
  const heroes = HERO_TIERS[unit.tierIndex]!.value * unit.weight;
  const bonus = 1 + TIER_DAMAGE_BONUS * unit.tierIndex;
  return weaponStats(weaponLevel).damage * heroes * bonus;
}
