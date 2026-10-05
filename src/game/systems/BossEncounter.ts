import type Phaser from 'phaser';
import { BOSS_ARENA_Y } from '../../core/balance';
import { bossReachedTroop } from '../../core/enemies';
import { circlesOverlap } from '../../core/geometry';
import { GAME_WIDTH } from '../dimensions';
import { Boss } from '../entities/Boss';
import type { Projectile } from '../entities/Projectile';
import type { Squad } from '../entities/Squad';
import type { ChunkSpawner } from './ChunkSpawner';
import type { ObjectPool } from './ObjectPool';

/** O que a cena quer saber do chefão. */
export interface BossEvents {
  onBossDefeated(bossNumber: number): void;
  onBossReachedSquad(): void;
}

interface BossDeps {
  readonly spawner: ChunkSpawner;
  readonly projectiles: ObjectPool<Projectile>;
  readonly squad: Squad;
  readonly events: BossEvents;
}

/**
 * Ciclo de vida do chefão: nasce no trecho de chefão, para o caminho ao chegar na arena,
 * recebe tiros, e ao morrer devolve o caminho. Se encostar na tropa ou alcançar a linha dela, é fim de jogo.
 */
export class BossEncounter {
  private readonly scene: Phaser.Scene;
  private readonly deps: BossDeps;
  private boss: Boss | null = null;

  constructor(scene: Phaser.Scene, deps: BossDeps) {
    this.scene = scene;
    this.deps = deps;
    deps.spawner.onBossChunk = (bossNumber, chunkTop) => this.start(bossNumber, chunkTop);
  }

  /** O chefão vivo, do surgimento até a derrota; `null` fora do encontro. */
  get activeBoss(): Boss | null {
    return this.boss;
  }

  update(deltaMs: number): void {
    const boss = this.boss;
    if (!boss) return;
    const { spawner, squad, events } = this.deps;
    boss.update(deltaMs, spawner.scrollSpeed, squad.x);
    if (!spawner.isBossActive && boss.y >= BOSS_ARENA_Y) spawner.startBoss();
    if (this.takeShots(boss)) return;
    if (circlesOverlap(squad.circle, boss.circle) || bossReachedTroop(boss.y)) {
      events.onBossReachedSquad();
    }
  }

  private start(bossNumber: number, chunkTop: number): void {
    this.boss = new Boss(this.scene, bossNumber, { x: GAME_WIDTH / 2, y: chunkTop });
  }

  /** Projéteis que acertam o chefão; devolve `true` se ele foi derrotado neste frame. */
  private takeShots(boss: Boss): boolean {
    let defeated = false;
    this.deps.projectiles.forEachActive((projectile) => {
      if (defeated) return;
      const shot = { x: projectile.x, y: projectile.y, radius: projectile.radius };
      if (!circlesOverlap(shot, boss.circle)) return;
      projectile.kill();
      defeated = boss.damage(projectile.damage);
    });
    if (defeated) this.finish(boss);
    return defeated;
  }

  private finish(boss: Boss): void {
    boss.destroy();
    this.boss = null;
    this.deps.spawner.endBoss();
    this.deps.events.onBossDefeated(boss.bossNumber);
  }
}
