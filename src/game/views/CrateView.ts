import type Phaser from 'phaser';
import { CRATE_SIZE } from '../../core/balance';
import { PALETTE } from './palette';
import { ProgressBar } from './ProgressBar';
import { centeredText } from './text';

const OUTLINE_WIDTH = 4;
const BAR_HEIGHT = 10;
const BAR_GAP = 14;

/** Caixa de arma: quadrado com "ARMA" e uma barra de acertos restantes. */
export class CrateView {
  private readonly box: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly bar: ProgressBar;

  constructor(scene: Phaser.Scene, x: number) {
    this.box = scene.add
      .rectangle(x, 0, CRATE_SIZE, CRATE_SIZE, PALETTE.crate)
      .setStrokeStyle(OUTLINE_WIDTH, PALETTE.heroOutline);
    this.label = centeredText(scene, 'ARMA', { x, y: 0, size: 20 });
    this.bar = new ProgressBar(scene, {
      width: CRATE_SIZE,
      height: BAR_HEIGHT,
      color: PALETTE.crate,
    });
  }

  render(x: number, y: number, ratio: number): void {
    this.box.setPosition(x, y);
    this.label.setPosition(x, y);
    this.bar.setPosition(x, y - CRATE_SIZE / 2 - BAR_GAP);
    this.bar.setRatio(ratio);
  }

  destroy(): void {
    this.box.destroy();
    this.label.destroy();
    this.bar.destroy();
  }
}
