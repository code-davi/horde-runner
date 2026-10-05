import type Phaser from 'phaser';
import { BEAM, SQUAD_Y } from '../../core/balance';
import { PALETTE } from './palette';

const BEAM_ALPHA = 0.6;
/** Acima de monstros e tiros, abaixo do HUD. */
const DEPTH = 50;

/** A coluna luminosa do feixe, da tropa até o topo da tela (ADR 0024). */
export class BeamView {
  private readonly column: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.column = scene.add
      .rectangle(0, 0, BEAM.widthPx, SQUAD_Y, PALETTE.beam, BEAM_ALPHA)
      .setOrigin(0.5, 0)
      .setDepth(DEPTH)
      .setVisible(false);
  }

  show(x: number): void {
    this.column.setX(x).setVisible(true);
  }

  hide(): void {
    this.column.setVisible(false);
  }
}
