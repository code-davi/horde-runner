import { WEAPON_EXTRA_LEVEL_MULTIPLIER, WEAPON_LEVELS } from './balance';

export interface WeaponStats {
  readonly name: string;
  readonly damage: number;
  readonly shotsPerSecond: number;
}

/** Estatísticas da arma da tropa em um nível (começa em 1). */
export function weaponStats(level: number): WeaponStats {
  const tableLevel = WEAPON_LEVELS[level - 1];
  if (tableLevel) return tableLevel;

  const strongest = WEAPON_LEVELS[WEAPON_LEVELS.length - 1]!;
  const extraLevels = level - WEAPON_LEVELS.length;
  return {
    name: `${strongest.name} +${extraLevels}`,
    damage: strongest.damage * WEAPON_EXTRA_LEVEL_MULTIPLIER ** extraLevels,
    shotsPerSecond: strongest.shotsPerSecond,
  };
}
