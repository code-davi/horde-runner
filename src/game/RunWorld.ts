import type Phaser from 'phaser';
import { PROJECTILE_POOL_SIZE } from '../core/balance';
import { createRng } from '../core/rng';
import { Projectile } from './entities/Projectile';
import { Squad } from './entities/Squad';
import { BossEncounter, type BossEvents } from './systems/BossEncounter';
import { ChunkSpawner } from './systems/ChunkSpawner';
import { CollisionSystem, type CollisionEvents } from './systems/Collisions';
import { DragInput } from './systems/DragInput';
import { EnemySystem } from './systems/EnemySystem';
import { FiringSystem } from './systems/FiringSystem';
import { ObjectPool } from './systems/ObjectPool';
import { PathCollisionSystem, type PathEvents } from './systems/PathCollisions';
import { drawBridge } from './views/BridgeView';

/** Tudo que acontece no mundo e que a cena precisa saber. */
export type RunEvents = CollisionEvents & PathEvents & BossEvents;

/** Monta e atualiza, na ordem certa, todos os sistemas de uma partida. */
export class RunWorld {
  readonly squad: Squad;
  readonly spawner: ChunkSpawner;
  private readonly drag: DragInput;
  private readonly firing: FiringSystem;
  private readonly enemies: EnemySystem;
  private readonly collisions: CollisionSystem;
  private readonly path: PathCollisionSystem;
  private readonly boss: BossEncounter;

  constructor(scene: Phaser.Scene, seed: number, events: RunEvents) {
    drawBridge(scene); // primeiro: fica atrás de todo o resto
    this.squad = new Squad(scene);
    this.drag = new DragInput(scene, this.squad.x);
    const projectiles = new ObjectPool(scene, {
      classType: Projectile,
      maxSize: PROJECTILE_POOL_SIZE,
    });
    this.firing = new FiringSystem(projectiles);
    this.enemies = new EnemySystem(scene);
    this.spawner = new ChunkSpawner(scene, createRng(seed), {
      enemies: this.enemies,
      troopCount: () => this.squad.state.count,
    });
    const squad = this.squad;
    this.collisions = new CollisionSystem(scene, {
      projectiles,
      enemies: this.enemies,
      squad,
      events,
    });
    this.path = new PathCollisionSystem({ projectiles, spawner: this.spawner, squad, events });
    this.boss = new BossEncounter(scene, { spawner: this.spawner, projectiles, squad, events });
  }

  get scrollSpeed(): number {
    return this.spawner.scrollSpeed;
  }

  update(deltaMs: number): void {
    this.spawner.update(deltaMs);
    this.squad.update(deltaMs, this.drag.targetX);
    this.firing.update(deltaMs, this.squad);
    this.enemies.update(this.spawner.scrollSpeed);
    this.collisions.update();
    this.path.update();
    this.boss.update(deltaMs);
  }
}
