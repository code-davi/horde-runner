import { BOSS, ENEMIES, ENEMY_BASE_WALK_SPEED, ENEMY_HP_GROWTH_PER_CHUNK } from './balance';

/** Definição de um tipo de monstro (uma linha em `ENEMIES`, ADR 0017). */
export interface EnemyDef {
  readonly hp: number;
  /** Multiplicador da velocidade de caminhada base. */
  readonly speed: number;
  readonly heroesLost: number;
  readonly points: number;
  /** Custo no orçamento de ameaça do trecho. */
  readonly cost: number;
  readonly radius: number;
}

/** Tipos de monstro, derivados da tabela: adicionar uma linha cria um tipo novo. */
export type EnemyKind = keyof typeof ENEMIES;

export function enemyDef(kind: EnemyKind): EnemyDef {
  return ENEMIES[kind];
}

/** Vida de um monstro nascido no trecho `chunkIndex` (começa em 1): cresce com a distância. */
export function enemyHp(kind: EnemyKind, chunkIndex: number): number {
  return ENEMIES[kind].hp * (1 + ENEMY_HP_GROWTH_PER_CHUNK * (chunkIndex - 1));
}

/** Vida do chefão número `bossNumber` (começa em 1). */
export function bossHp(bossNumber: number): number {
  return BOSS.baseHp * BOSS.hpGrowth ** bossNumber;
}

/** Pontos por derrotar o chefão número `bossNumber`. */
export function bossPoints(bossNumber: number): number {
  return BOSS.pointsPerBoss * bossNumber;
}

/** Velocidade própria do chefão, em px/s (com o caminho parado, é só ela que conta). */
export function bossWalkSpeed(): number {
  return ENEMY_BASE_WALK_SPEED * BOSS.speed;
}
