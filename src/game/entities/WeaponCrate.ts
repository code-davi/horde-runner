import type Phaser from 'phaser';
import { CRATE_SIZE, WEAPON_CRATE_HP } from '../../core/balance';
import type { Circle } from '../../core/geometry';
import { applyDamage, createHealth, healthRatio, isDepleted, type Health } from '../../core/health';
import { CrateView } from '../views/CrateView';

/** Caixa de arma: sobe a arma ao ser destruída por tiros ou tocada pela tropa. */
export class WeaponCrate {
  readonly x: number;
  y: number;
  consumed = false;
  health: Health = createHealth(WEAPON_CRATE_HP);
  private readonly view: CrateView;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.view = new CrateView(scene, x);
    this.moveTo(y);
  }

  get circle(): Circle {
    return { x: this.x, y: this.y, radius: CRATE_SIZE / 2 };
  }

  /** Um projétil acertou; devolve `true` quando a caixa se esvazia. */
  hit(): boolean {
    this.health = applyDamage(this.health, 1);
    this.view.render(this.x, this.y, healthRatio(this.health));
    return isDepleted(this.health);
  }

  /** Caixa usada (pela tropa ou por tiros): some da tela. */
  consume(): void {
    this.consumed = true;
    this.view.destroy();
  }

  moveTo(y: number): void {
    if (this.consumed) return;
    this.y = y;
    this.view.render(this.x, y, healthRatio(this.health));
  }

  destroy(): void {
    if (!this.consumed) this.view.destroy();
  }
}
