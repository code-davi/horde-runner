import type Phaser from 'phaser';
import { enemyDef, type EnemyKind } from '../../core/enemies';
import { circlesOverlap } from '../../core/geometry';
import type { Enemy } from '../entities/Enemy';
import type { Projectile } from '../entities/Projectile';
import type { Squad } from '../entities/Squad';
import type { EnemySystem } from './EnemySystem';
import type { ObjectPool } from './ObjectPool';

/** O que a cena quer saber das colisões; as regras de cada efeito ficam no core. */
export interface CollisionEvents {
  onEnemyKilled(kind: EnemyKind, at: { x: number; y: number }): void;
  onSquadHit(heroesLost: number): void;
}

interface CollisionDeps {
  readonly projectiles: ObjectPool<Projectile>;
  readonly enemies: EnemySystem;
  readonly squad: Squad;
  readonly events: CollisionEvents;
}

/**
 * Projétil × monstro usa o "overlap" da física Arcade (otimizado com árvore espacial).
 * Tropa × monstro é checado por distância entre círculos a cada frame.
 */
export class CollisionSystem {
  private readonly deps: CollisionDeps;

  constructor(scene: Phaser.Scene, deps: CollisionDeps) {
    this.deps = deps;
    scene.physics.add.overlap(deps.projectiles.group, deps.enemies.pool.group, (a, b) =>
      // Fronteira com o Phaser: os grupos só contêm Projectile e Enemy, nesta ordem.
      this.onProjectileHitsEnemy(a as Projectile, b as Enemy),
    );
  }

  update(): void {
    const { enemies, squad, events } = this.deps;
    enemies.pool.forEachActive((enemy) => {
      if (!circlesOverlap(squad.circle, enemy.circle)) return;
      enemy.kill();
      events.onSquadHit(enemyDef(enemy.kind).heroesLost);
    });
  }

  private onProjectileHitsEnemy(projectile: Projectile, enemy: Enemy): void {
    if (!projectile.active || !enemy.active) return;
    projectile.kill();
    const at = { x: enemy.x, y: enemy.y };
    if (enemy.damage(projectile.damage)) this.deps.events.onEnemyKilled(enemy.kind, at);
  }
}
