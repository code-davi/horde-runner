import type Phaser from 'phaser';
import { BOSS } from '../../core/balance';
import { bossHp, bossWalkSpeed } from '../../core/enemies';
import type { Circle } from '../../core/geometry';
import { chaseVelocityX } from '../../core/motion';
import { applyDamage, createHealth, healthRatio, isDepleted, type Health } from '../../core/health';
import { BossView } from '../views/BossView';

/**
 * O chefão. Não herda de Enemy: compartilha vida (`health.ts`), colisão (`geometry.ts`)
 * e a barra (`ProgressBar`) por composição (ADR 0017).
 */
export class Boss {
  readonly bossNumber: number;
  x: number;
  y: number;
  health: Health;
  private readonly view: BossView;

  constructor(scene: Phaser.Scene, bossNumber: number, position: { x: number; y: number }) {
    this.bossNumber = bossNumber;
    this.x = position.x;
    this.y = position.y;
    this.health = createHealth(bossHp(bossNumber));
    this.view = new BossView(scene);
    this.render();
  }

  get circle(): Circle {
    return { x: this.x, y: this.y, radius: BOSS.radius };
  }

  /** Aplica dano; devolve `true` se o chefão foi derrotado. */
  damage(amount: number): boolean {
    this.health = applyDamage(this.health, amount);
    this.render();
    return isDepleted(this.health);
  }

  /** Desce com o caminho (enquanto ele rola) mais a própria caminhada e persegue `targetX` (ADR 0025). */
  update(deltaMs: number, scrollSpeed: number, targetX: number): void {
    this.x += (chaseVelocityX(this, targetX, BOSS.steer) * deltaMs) / 1000;
    this.y += ((scrollSpeed + bossWalkSpeed()) * deltaMs) / 1000;
    this.render();
  }

  destroy(): void {
    this.view.destroy();
  }

  private render(): void {
    this.view.render(this.x, this.y, healthRatio(this.health));
  }
}
