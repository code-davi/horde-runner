import Phaser from 'phaser';
import { PROJECTILE_SPEED } from '../../core/balance';
import type { Poolable } from '../systems/ObjectPool';
import { PALETTE } from '../views/palette';

const PROJECTILE_RADIUS = 5;

/** Um tiro da tropa. Vive no ObjectPool e é reciclado ao acertar algo ou sair da tela. */
export class Projectile extends Phaser.GameObjects.Arc implements Poolable {
  damage = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, PROJECTILE_RADIUS, 0, 360, false, PALETTE.projectile);
  }

  fire(x: number, y: number, damage: number): void {
    this.damage = damage;
    this.setActive(true).setVisible(true);
    const body = this.arcadeBody();
    body.enable = true;
    body.reset(x, y);
    body.setVelocity(0, -PROJECTILE_SPEED);
  }

  kill(): void {
    this.setActive(false).setVisible(false);
    const body = this.arcadeBody();
    body.stop();
    body.enable = false;
  }

  private arcadeBody(): Phaser.Physics.Arcade.Body {
    // O pool é um grupo de física, então todo membro ganha um corpo Arcade dinâmico.
    return this.body as Phaser.Physics.Arcade.Body;
  }
}
