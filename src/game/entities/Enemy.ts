import Phaser from 'phaser';
import { enemyDef, type EnemyKind } from '../../core/enemies';
import type { Circle } from '../../core/geometry';
import { applyDamage, createHealth, isDepleted, type Health } from '../../core/health';
import type { Poolable } from '../systems/ObjectPool';
import { styleEnemy } from '../views/EnemyView';

/** Um monstro. Uma única classe para todos os tipos: o que muda vem de `enemyDef(kind)`. */
export class Enemy extends Phaser.GameObjects.Arc implements Poolable {
  kind: EnemyKind = 'common';
  health: Health = createHealth(1);

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, enemyDef('common').radius);
  }

  spawn(kind: EnemyKind, x: number, y: number): void {
    const { hp, radius } = enemyDef(kind);
    this.kind = kind;
    this.health = createHealth(hp);
    styleEnemy(this, kind, radius);
    this.setActive(true).setVisible(true);
    const body = this.arcadeBody();
    body.enable = true;
    body.setCircle(radius);
    body.reset(x, y);
  }

  /** Aplica dano; devolve `true` se o monstro morreu (e já o devolve ao pool). */
  damage(amount: number): boolean {
    this.health = applyDamage(this.health, amount);
    if (!isDepleted(this.health)) return false;
    this.kill();
    return true;
  }

  get circle(): Circle {
    return { x: this.x, y: this.y, radius: enemyDef(this.kind).radius };
  }

  setFallSpeed(pxPerSecond: number): void {
    this.arcadeBody().setVelocity(0, pxPerSecond);
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
