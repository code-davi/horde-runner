import Phaser from 'phaser';
import { PROJECTILE_POOL_SIZE } from '../../core/balance';
import { scrollSpeed } from '../../core/difficulty';
import type { EnemyKind } from '../../core/enemies';
import {
  addDistance,
  addKill,
  initialScore,
  totalScore,
  type ScoreState,
} from '../../core/scoring';
import { clampDelta } from '../../core/time';
import { isDefeated, takeHit } from '../../core/troop';
import { createBrowserSaveStore } from '../../platform/storage';
import { GAME_WIDTH } from '../dimensions';
import { Projectile } from '../entities/Projectile';
import { Squad } from '../entities/Squad';
import { installPauseOnBlur } from '../pauseOnBlur';
import { markScene } from '../sceneMarker';
import { CollisionSystem } from '../systems/Collisions';
import { DragInput } from '../systems/DragInput';
import { EnemySystem } from '../systems/EnemySystem';
import { FiringSystem } from '../systems/FiringSystem';
import { ObjectPool } from '../systems/ObjectPool';
import type { UrlOptions } from '../urlOptions';
import type { GameOverData } from './GameOverScene';

/** Spawn temporário do Task 11 (substituído pelos trechos procedurais no Task 12). */
const TEST_ROW_EVERY_MS = 2000;
const TEST_ROW_SIZE = 5;
const SPAWN_Y = -40;

/** A partida. Cada Task 9–14 acrescenta um sistema; as regras moram em src/core. */
export class RunScene extends Phaser.Scene {
  private squad!: Squad;
  private drag!: DragInput;
  private firing!: FiringSystem;
  private enemies!: EnemySystem;
  private collisions!: CollisionSystem;
  private score: ScoreState = initialScore;
  private finished = false;

  constructor() {
    super('Run');
  }

  create(_options: UrlOptions): void {
    this.score = initialScore;
    this.finished = false;
    this.squad = new Squad(this);
    this.drag = new DragInput(this, this.squad.x);
    const projectiles = new ObjectPool(this, {
      classType: Projectile,
      maxSize: PROJECTILE_POOL_SIZE,
    });
    this.firing = new FiringSystem(projectiles);
    this.enemies = new EnemySystem(this);
    this.collisions = new CollisionSystem(this, {
      projectiles,
      enemies: this.enemies,
      squad: this.squad,
      events: {
        onEnemyKilled: (kind) => this.onEnemyKilled(kind),
        onSquadHit: (heroesLost) => this.onSquadHit(heroesLost),
      },
    });
    this.time.addEvent({
      delay: TEST_ROW_EVERY_MS,
      loop: true,
      callback: () => this.spawnTestRow(),
    });
    installPauseOnBlur(this);
    markScene('Run');
  }

  override update(_time: number, delta: number): void {
    const dt = clampDelta(delta);
    const speed = scrollSpeed(1);
    this.score = addDistance(this.score, (speed * dt) / 1000);
    this.squad.update(dt, this.drag.targetX);
    this.firing.update(dt, this.squad);
    this.enemies.update(speed);
    this.collisions.update();
  }

  private spawnTestRow(): void {
    const gap = GAME_WIDTH / (TEST_ROW_SIZE + 1);
    for (let i = 1; i <= TEST_ROW_SIZE; i++) this.enemies.spawn('common', gap * i, SPAWN_Y);
  }

  private onEnemyKilled(kind: EnemyKind): void {
    this.score = addKill(this.score, kind);
  }

  private onSquadHit(heroesLost: number): void {
    this.squad.setState(takeHit(this.squad.state, heroesLost));
    if (isDefeated(this.squad.state)) this.finish(totalScore(this.score));
  }

  /** Encerra a partida uma única vez, grava o recorde e vai para o fim de jogo. */
  private finish(score: number): void {
    if (this.finished) return;
    this.finished = true;
    const store = createBrowserSaveStore();
    const previousBest = store.loadHighScore();
    const isNewRecord = score > previousBest;
    if (isNewRecord) store.saveHighScore(score);
    const data: GameOverData = { score, highScore: Math.max(score, previousBest), isNewRecord };
    this.scene.start('GameOver', data);
  }
}
