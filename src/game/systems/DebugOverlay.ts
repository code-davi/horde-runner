import type Phaser from 'phaser';

const POSITION = { x: 24, y: 140 };
const DEPTH = 200;

export interface DebugInfo {
  readonly fps: number;
  readonly heroes: number;
  readonly weaponLevel: number;
  readonly chunkIndex: number;
  readonly template: string;
  readonly seed: number;
}

/** Painel do `?debug`: números do estado atual e contornos dos corpos de física. */
export class DebugOverlay {
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const world = scene.physics.world;
    world.drawDebug = true;
    if (!world.debugGraphic) world.createDebugGraphic();
    this.label = scene.add
      .text(POSITION.x, POSITION.y, '', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#00ff88',
        backgroundColor: '#000000aa',
        padding: { x: 8, y: 6 },
      })
      .setDepth(DEPTH);
  }

  update(info: DebugInfo): void {
    this.label.setText(
      [
        `fps     ${Math.round(info.fps)}`,
        `heróis  ${info.heroes}`,
        `arma    nv ${info.weaponLevel}`,
        `trecho  ${info.chunkIndex} (${info.template})`,
        `seed    ${info.seed}`,
      ].join('\n'),
    );
  }
}
