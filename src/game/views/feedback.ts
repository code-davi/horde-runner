import type Phaser from 'phaser';

/** Máximo de textos flutuantes ao mesmo tempo (centenas de mortes não viram centenas de textos). */
const MAX_ACTIVE_POPS = 25;
const POP_RISE_PX = 60;
const POP_DURATION_MS = 700;
const POP_FONT_SIZE = 34;
const POP_DEPTH = 50;

/** Números e palavras que sobem e somem: "+5", "-12", "Arma +1". */
export class PopTexts {
  private readonly scene: Phaser.Scene;
  private active = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(at: { x: number; y: number }, text: string, color: string): void {
    if (this.active >= MAX_ACTIVE_POPS) return;
    this.active += 1;
    const label = this.scene.add
      .text(at.x, at.y, text, {
        fontFamily: 'sans-serif',
        fontSize: `${POP_FONT_SIZE}px`,
        fontStyle: 'bold',
        color,
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(POP_DEPTH);
    this.scene.tweens.add({
      targets: label,
      y: at.y - POP_RISE_PX,
      alpha: 0,
      duration: POP_DURATION_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        label.destroy();
        this.active -= 1;
      },
    });
  }
}

/** Pisca o alvo (ao tomar dano). */
export function flash(scene: Phaser.Scene, target: { alpha: number }): void {
  // Um tween começa do valor atual: sem reiniciar, flashes seguidos deixariam a tropa apagada.
  scene.tweens.killTweensOf(target);
  target.alpha = 1;
  scene.tweens.add({ targets: target, alpha: 0.3, duration: 70, yoyo: true, repeat: 1 });
}

/** "Squash" curto: estica e volta (ao mudar de tamanho ou passar por um portão). */
export function punch(scene: Phaser.Scene, target: { scaleX: number; scaleY: number }): void {
  scene.tweens.killTweensOf(target);
  target.scaleX = 1;
  target.scaleY = 1;
  scene.tweens.add({
    targets: target,
    scaleX: 1.15,
    scaleY: 0.88,
    duration: 90,
    yoyo: true,
    ease: 'Quad.easeOut',
  });
}
