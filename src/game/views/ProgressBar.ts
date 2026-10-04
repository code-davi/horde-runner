import type Phaser from 'phaser';

const BACKGROUND_COLOR = 0x1b1b1b;
const BORDER = 2;

/** Barra de progresso reutilizável: acertos da caixa de arma e vida do chefão. */
export class ProgressBar {
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly innerWidth: number;

  constructor(scene: Phaser.Scene, options: { width: number; height: number; color: number }) {
    const { width, height, color } = options;
    this.innerWidth = width - BORDER * 2;
    this.background = scene.add.rectangle(0, 0, width, height, BACKGROUND_COLOR).setOrigin(0.5);
    this.fill = scene.add
      .rectangle(0, 0, this.innerWidth, height - BORDER * 2, color)
      .setOrigin(0, 0.5);
  }

  /** `ratio` em [0, 1]. */
  setRatio(ratio: number): void {
    this.fill.width = this.innerWidth * Math.min(Math.max(ratio, 0), 1);
  }

  setPosition(x: number, y: number): void {
    this.background.setPosition(x, y);
    this.fill.setPosition(x - this.innerWidth / 2, y);
  }

  setDepth(depth: number): void {
    this.background.setDepth(depth);
    this.fill.setDepth(depth + 0.1);
  }

  destroy(): void {
    this.background.destroy();
    this.fill.destroy();
  }
}
