import Phaser from 'phaser';
import { PROJECTILE_POOL_SIZE } from '../../core/balance';
import { clampDelta } from '../../core/time';
import { createBrowserSaveStore } from '../../platform/storage';
import { Projectile } from '../entities/Projectile';
import { Squad } from '../entities/Squad';
import { installPauseOnBlur } from '../pauseOnBlur';
import { markScene } from '../sceneMarker';
import { DragInput } from '../systems/DragInput';
import { FiringSystem } from '../systems/FiringSystem';
import { ObjectPool } from '../systems/ObjectPool';
import type { UrlOptions } from '../urlOptions';
import type { GameOverData } from './GameOverScene';

/** A partida. Cada Task 9–14 acrescenta um sistema; as regras moram em src/core. */
export class RunScene extends Phaser.Scene {
  private squad!: Squad;
  private drag!: DragInput;
  private firing!: FiringSystem;

  constructor() {
    super('Run');
  }

  create(_options: UrlOptions): void {
    this.squad = new Squad(this);
    this.drag = new DragInput(this, this.squad.x);
    const projectiles = new ObjectPool(this, {
      classType: Projectile,
      maxSize: PROJECTILE_POOL_SIZE,
    });
    this.firing = new FiringSystem(projectiles);
    installPauseOnBlur(this);
    markScene('Run');
  }

  override update(_time: number, delta: number): void {
    const dt = clampDelta(delta);
    this.squad.update(dt, this.drag.targetX);
    this.firing.update(dt, this.squad);
  }

  /** Encerra a partida, grava o recorde e vai para o fim de jogo. */
  protected finish(score: number): void {
    const store = createBrowserSaveStore();
    const previousBest = store.loadHighScore();
    const isNewRecord = score > previousBest;
    if (isNewRecord) store.saveHighScore(score);
    const data: GameOverData = { score, highScore: Math.max(score, previousBest), isNewRecord };
    this.scene.start('GameOver', data);
  }
}
