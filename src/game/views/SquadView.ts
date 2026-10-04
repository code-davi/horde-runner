import type Phaser from 'phaser';
import { formationOffsets } from '../../core/formation';
import type { RenderUnit } from '../../core/troop';
import { flash, punch } from './feedback';
import { PALETTE } from './palette';

/** Raio de cada nível de herói, em px. */
const TIER_RADIUS = [10, 16, 22, 28] as const;
const OUTLINE_WIDTH = 3;

/** Desenha a tropa com formas geométricas; só redesenha quando as unidades mudam. */
export class SquadView {
  private readonly scene: Phaser.Scene;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private drawnUnits: readonly RenderUnit[] = [];
  private boundingRadius = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
  }

  /** Raio do círculo que envolve a formação inteira. */
  get radius(): number {
    return this.boundingRadius;
  }

  render(position: { x: number; y: number }, units: readonly RenderUnit[]): void {
    if (units !== this.drawnUnits) this.redraw(units);
    this.graphics.setPosition(position.x, position.y);
  }

  /** A tropa tomou dano. */
  flash(): void {
    flash(this.scene, this.graphics);
  }

  /** A tropa mudou (portão, arma). */
  punch(): void {
    punch(this.scene, this.graphics);
  }

  destroy(): void {
    this.graphics.destroy();
  }

  private redraw(units: readonly RenderUnit[]): void {
    this.drawnUnits = units;
    this.graphics.clear();
    this.boundingRadius = 0;
    const offsets = formationOffsets(units);
    units.forEach((unit, index) => {
      const offset = offsets[index]!;
      const radius = TIER_RADIUS[unit.tierIndex] ?? TIER_RADIUS[0];
      this.graphics.fillStyle(PALETTE.hero[unit.tierIndex] ?? PALETTE.hero[0]);
      this.graphics.lineStyle(OUTLINE_WIDTH, PALETTE.heroOutline);
      this.graphics.fillCircle(offset.x, offset.y, radius);
      this.graphics.strokeCircle(offset.x, offset.y, radius);
      this.boundingRadius = Math.max(this.boundingRadius, Math.hypot(offset.x, offset.y) + radius);
    });
  }
}
