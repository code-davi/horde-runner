import type Phaser from 'phaser';
import { BOSS } from '../../core/balance';
import { PALETTE } from './palette';
import { ProgressBar } from './ProgressBar';

const OUTLINE_WIDTH = 6;
const BAR_WIDTH = 180;
const BAR_HEIGHT = 16;
const BAR_GAP = 24;
const DEPTH = 10;

/** Chefão no subprojeto 1: círculo grande com barra de vida acima. */
export class BossView {
  private readonly body: Phaser.GameObjects.Arc;
  private readonly bar: ProgressBar;

  constructor(scene: Phaser.Scene) {
    this.body = scene.add
      .circle(0, 0, BOSS.radius, PALETTE.boss)
      .setStrokeStyle(OUTLINE_WIDTH, PALETTE.enemyOutline)
      .setDepth(DEPTH);
    this.bar = new ProgressBar(scene, {
      width: BAR_WIDTH,
      height: BAR_HEIGHT,
      color: PALETTE.boss,
    });
    this.bar.setDepth(DEPTH);
  }

  render(x: number, y: number, healthRatio: number): void {
    this.body.setPosition(x, y);
    this.bar.setPosition(x, y - BOSS.radius - BAR_GAP);
    this.bar.setRatio(healthRatio);
  }

  destroy(): void {
    this.body.destroy();
    this.bar.destroy();
  }
}
