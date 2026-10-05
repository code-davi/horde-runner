import type Phaser from 'phaser';
import { GATE_HEIGHT, GATE_WIDTH } from '../../core/balance';
import { gateLabel, isGoodGate, type Gate } from '../../core/gates';
import { PALETTE } from './palette';
import { centeredText, fitScale } from './text';

const GATE_ALPHA = 0.75;
const OUTLINE_WIDTH = 4;
const LABEL_SIZE = 42;
/** Espaço livre entre o rótulo e cada lado do portão, em px. */
const LABEL_PADDING = 12;

/** Um portão: retângulo verde (bom) ou vermelho (ruim) com o efeito escrito. */
export class GateView {
  private readonly box: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, gate: Gate) {
    this.box = scene.add
      .rectangle(x, 0, GATE_WIDTH, GATE_HEIGHT)
      .setStrokeStyle(OUTLINE_WIDTH, PALETTE.heroOutline);
    this.label = centeredText(scene, '', { x, y: 0, size: LABEL_SIZE });
    this.show(gate);
  }

  /** Atualiza cor e texto (um `-N` atingido pode virar positivo e ficar verde). */
  show(gate: Gate): void {
    this.box.setFillStyle(isGoodGate(gate) ? PALETTE.goodGate : PALETTE.badGate, GATE_ALPHA);
    this.label.setText(gateLabel(gate));
    this.label.setScale(fitScale(this.label.width, GATE_WIDTH - 2 * LABEL_PADDING));
  }

  setY(y: number): void {
    this.box.setY(y);
    this.label.setY(y);
  }

  /** Portão já cruzado: fica apagado até sair da tela. */
  fade(): void {
    this.box.setAlpha(0.25);
    this.label.setAlpha(0.25);
  }

  destroy(): void {
    this.box.destroy();
    this.label.destroy();
  }
}
