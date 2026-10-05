import type Phaser from 'phaser';
import { ENEMY_BASE_WALK_SPEED, ENEMY_POOL_SIZE, OFFSCREEN_MARGIN_PX } from '../../core/balance';
import { enemyDef } from '../../core/enemies';
import { chaseVelocityX } from '../../core/motion';
import { GAME_HEIGHT } from '../dimensions';
import { Enemy, type EnemySpawnAt } from '../entities/Enemy';
import { ObjectPool } from './ObjectPool';

/** Cria, move e recicla os monstros: descem com a rolagem + a caminhada e perseguem a tropa (ADR 0025). */
export class EnemySystem {
  readonly pool: ObjectPool<Enemy>;

  constructor(scene: Phaser.Scene) {
    this.pool = new ObjectPool(scene, { classType: Enemy, maxSize: ENEMY_POOL_SIZE });
  }

  /** Um monstro novo, ou `null` se o pool estiver cheio (o spawn é ignorado). */
  spawn(at: EnemySpawnAt): Enemy | null {
    const enemy = this.pool.acquire();
    enemy?.spawn(at);
    return enemy;
  }

  /** `targetX` é o x da tropa, que os monstros perseguem de lado. */
  update(scrollSpeed: number, targetX: number): void {
    this.pool.forEachActive((enemy) => {
      if (enemy.y > GAME_HEIGHT + OFFSCREEN_MARGIN_PX) {
        enemy.kill();
        return;
      }
      const { steer, speed } = enemyDef(enemy.kind);
      enemy.move(
        chaseVelocityX(enemy, targetX, steer),
        scrollSpeed + ENEMY_BASE_WALK_SPEED * speed,
      );
    });
  }
}
