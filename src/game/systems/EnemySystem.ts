import type Phaser from 'phaser';
import { ENEMY_BASE_WALK_SPEED, ENEMY_POOL_SIZE, OFFSCREEN_MARGIN_PX } from '../../core/balance';
import { enemyDef, type EnemyKind } from '../../core/enemies';
import { GAME_HEIGHT } from '../dimensions';
import { Enemy } from '../entities/Enemy';
import { ObjectPool } from './ObjectPool';

/** Cria, move e recicla os monstros. Eles descem com a rolagem + a própria caminhada. */
export class EnemySystem {
  readonly pool: ObjectPool<Enemy>;

  constructor(scene: Phaser.Scene) {
    this.pool = new ObjectPool(scene, { classType: Enemy, maxSize: ENEMY_POOL_SIZE });
  }

  /** Um monstro novo, ou `null` se o pool estiver cheio (o spawn é ignorado). */
  spawn(kind: EnemyKind, x: number, y: number): Enemy | null {
    const enemy = this.pool.acquire();
    enemy?.spawn(kind, x, y);
    return enemy;
  }

  update(scrollSpeed: number): void {
    this.pool.forEachActive((enemy) => {
      if (enemy.y > GAME_HEIGHT + OFFSCREEN_MARGIN_PX) {
        enemy.kill();
        return;
      }
      enemy.setFallSpeed(scrollSpeed + ENEMY_BASE_WALK_SPEED * enemyDef(enemy.kind).speed);
    });
  }
}
