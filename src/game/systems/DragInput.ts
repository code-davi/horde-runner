import type Phaser from 'phaser';
import { SQUAD_MAX_X, SQUAD_MIN_X } from '../../core/balance';
import { clamp } from '../../core/motion';

/**
 * Controle por arrasto relativo: arrastar o dedo 100 px para a direita, em qualquer lugar
 * da tela, move o alvo 100 px para a direita. Assim o dedo não cobre a tropa.
 * Cada movimento soma ao alvo já limitado, então empurrar contra a borda não cria "folga".
 * Só segue um dedo que encostou NESTA cena: o toque que iniciou a partida não conta.
 */
export class DragInput {
  private target: number;
  private lastPointerX = 0;
  private dragging = false;

  constructor(scene: Phaser.Scene, initialX: number) {
    this.target = initialX;
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragging = true;
      this.lastPointerX = pointer.x;
    });
    scene.input.on('pointerup', () => {
      this.dragging = false;
    });
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging || !pointer.isDown) return;
      this.target = clamp(this.target + pointer.x - this.lastPointerX, SQUAD_MIN_X, SQUAD_MAX_X);
      this.lastPointerX = pointer.x;
    });
  }

  get targetX(): number {
    return this.target;
  }
}
